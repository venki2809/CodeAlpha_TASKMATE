import jwt from 'jsonwebtoken';
import {randomBytes} from 'node:crypto';
import {getUserById} from '../config/store.js';
const configured=process.env.JWT_SECRET;
const DEMO_SECRET=(!configured||configured.includes('replace-with'))?randomBytes(48).toString('hex'):configured;
if(DEMO_SECRET!==configured) console.log('🔒 Temporary JWT signing secret generated for this run (sessions expire after restart).');
export const issueToken = user=>jwt.sign({sub:user.id},DEMO_SECRET,{expiresIn:'12h'});
export async function requireAuth(req,res,next){
 try{
  const header=req.headers.authorization||'';
  const match=/^Bearer (.+)$/.exec(header);
  if(!match) return res.status(401).json({ok:false,message:'Sign in to continue.'});
  const payload=jwt.verify(match[1],DEMO_SECRET,{algorithms:['HS256']});
  const user=await getUserById(payload.sub);
  if(!user) return res.status(401).json({ok:false,message:'Account no longer exists. Sign in again.'});
  req.user={id:user.id,name:user.name,email:user.email,role:user.role};
  next();
 }catch(err){if(err.name==='JsonWebTokenError'||err.name==='TokenExpiredError')return res.status(401).json({ok:false,message:'Session expired. Please sign in again.'});next(err)}
}
