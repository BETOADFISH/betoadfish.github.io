$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$clientId='Ov23linTACx4Ij2qiz8Z'
if($clientId -notmatch '^[A-Za-z0-9_.-]{8,100}$'){throw 'Invalid Client ID'}
$secure=Read-Host 'GitHub Client secret (hidden input)' -AsSecureString
$pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {$clientSecret=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)}
if($clientSecret.Length -lt 20){throw 'Client secret is incomplete'}
$env:WRANGLER_SEND_METRICS='false'
$env:XDG_CONFIG_HOME=Join-Path $PWD 'work/cloudflare-config'
$sessionBytes=[Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
$payload=@{GITHUB_CLIENT_ID=$clientId;GITHUB_CLIENT_SECRET=$clientSecret;GITHUB_OWNER_ID='260268817';SESSION_SECRET=[Convert]::ToBase64String($sessionBytes)} | ConvertTo-Json -Compress
$payload | node node_modules/wrangler/bin/wrangler.js secret bulk --config backend/wrangler.jsonc
$clientSecret=$null;$payload=$null;$secure.Dispose()
if($LASTEXITCODE -ne 0){throw 'Upload failed; please tell Codex the error without including secrets.'}
Write-Host 'Login configuration uploaded. You can close this window.'
Read-Host 'Press Enter to close'
