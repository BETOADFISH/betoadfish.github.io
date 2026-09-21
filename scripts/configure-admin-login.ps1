param([switch]$CheckRuntime)
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$nodeCommand=Get-Command node -ErrorAction SilentlyContinue
$nodeExe=if($nodeCommand){$nodeCommand.Source}else{Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'}
if(-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)){throw 'Node runtime not found. Please ask Codex to repair this setup tool.'}
$wranglerEntry=Join-Path $PWD 'node_modules/wrangler/bin/wrangler.js'
if(-not (Test-Path -LiteralPath $wranglerEntry -PathType Leaf)){throw 'Deployment tool not found. Please ask Codex to repair this setup tool.'}
& $nodeExe --version
if($LASTEXITCODE -ne 0){throw 'Node runtime failed to start.'}
if($CheckRuntime){Write-Host 'Runtime check passed.';exit 0}
$clientId='Ov23linTACx4Ij2qiz8Z'
$secure=Read-Host 'GitHub Client secret (hidden input)' -AsSecureString
$clientSecret=$null
$payload=$null
try {
 $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
 try {$clientSecret=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)}
 if($clientSecret.Length -lt 20){throw 'Client secret is incomplete'}
 $env:WRANGLER_SEND_METRICS='false'
 $env:XDG_CONFIG_HOME=Join-Path $PWD 'work/cloudflare-config'
 $sessionBytes=[Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
 $payload=@{GITHUB_CLIENT_ID=$clientId;GITHUB_CLIENT_SECRET=$clientSecret;GITHUB_OWNER_ID='260268817';SESSION_SECRET=[Convert]::ToBase64String($sessionBytes)} | ConvertTo-Json -Compress
 $payload | & $nodeExe $wranglerEntry secret bulk --config backend/wrangler.jsonc
 if($LASTEXITCODE -ne 0){throw 'Upload failed; please tell Codex the error without including secrets.'}
} finally {$clientSecret=$null;$payload=$null;$secure.Dispose()}
Write-Host 'Login configuration uploaded. You can close this window.'
Read-Host 'Press Enter to close'
