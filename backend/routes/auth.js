import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';
import {getUserByEmail,getUserById,registerUser} from '../config/store.js';
import {requireAuth,issueToken} from '../middleware/auth.js';
import {cleanText,validEmail} from '../lib/validation.js';
const router=Router();
const safeUser=u=>({id:u.id,name:u.name,email:u.email,role:u.role,title:u.title,color:u.color});
const signInResult=u=>({ok:true,token:issueToken(u),user:safeUser(u)});
router.post('/login',async(req,res,next)=>{
 try{
  const email=String(req.body?.email||'').trim().toLowerCase();
  const password=String(req.body?.password||'');
  if(!validEmail(email)||!password) return res.status(400).json({ok:false,message:'Enter your email and password.'});
  const user=await getUserByEmail(email);
  if(!user?.passwordHash||!await bcrypt.compare(password,user.passwordHash))return res.status(401).json({ok:false,message:'Incorrect email or password.'});
  res.json(signInResult(user));
 }catch(err){next(err)}
});
router.post('/register',async(req,res,next)=>{
 try{
  const name=cleanText(req.body?.name,70),email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');
  if(name.length<2||!validEmail(email))return res.status(400).json({ok:false,message:'Enter your full name and a valid email.'});
  if(password.length<8||password.length>128)return res.status(400).json({ok:false,message:'Password must contain 8–128 characters.'});
  const passwordHash=await bcrypt.hash(password,10);
  const user=await registerUser({id:'user_'+randomUUID(),name,email,passwordHash});
  res.status(201).json(signInResult(user));
 }catch(err){next(err)}
});
// These two endpoints exist for demonstration, not production impersonation.
router.post('/demo',async(_req,res,next)=>{
 try{const user=await getUserByEmail('demo@taskmate.test');if(!user)return res.status(404).json({ok:false,message:'Demo account not found. Reset sample data.'});res.json(signInResult(user))}catch(err){next(err)}
});
router.post('/switch-demo-user',requireAuth,async(req,res,next)=>{
 try{
  const id=String(req.body?.id||'');
  const user=await getUserById(id);
  if(!user)return res.status(404).json({ok:false,message:'Team member not found.'});
  res.json(signInResult(user));
 }catch(err){next(err)}
});
router.get('/me',requireAuth,async(req,res)=>res.json({ok:true,user:req.user}));
export default router;
