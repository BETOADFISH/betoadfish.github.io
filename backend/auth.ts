import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey} from 'jose';
export type AuthEnv={ACCESS_TEAM_DOMAIN:string;ACCESS_AUD:string;OWNER_EMAIL:string};
const verifiers=new Map<string,JWTVerifyGetKey>();
export async function verifyOwner(token:string,env:AuthEnv,key?:JWTVerifyGetKey){
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN||'')||!env.ACCESS_AUD||!env.OWNER_EMAIL||!token)throw Error('Unauthorized');
 const issuer=`https://${env.ACCESS_TEAM_DOMAIN}`;
 if(!key){if(!verifiers.has(issuer))verifiers.set(issuer,createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));key=verifiers.get(issuer)!;}
 const {payload}=await jwtVerify(token,key,{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']});
 if(typeof payload.email!=='string'||payload.email.toLowerCase()!==env.OWNER_EMAIL.toLowerCase())throw Error('Unauthorized');return payload.sub!;
}
