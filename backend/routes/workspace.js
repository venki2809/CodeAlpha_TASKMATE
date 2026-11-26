import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {readWorkspace,replaceWorkspace,resetWorkspace,mutateWorkspace,mode} from '../config/store.js';
import {requireAuth} from '../middleware/auth.js';
import {cleanText} from '../lib/validation.js';
const router=Router();
router.use(requireAuth);
const id=(prefix)=>`${prefix}_${randomUUID()}`;
const audit=(actor,type,message,projectId='',taskId='')=>({id:id('activity'),actorId:actor,type,message,projectId,taskId,createdAt:new Date().toISOString()});
router.get('/workspace',async(req,res,next)=>{try{res.json({ok:true,data:await readWorkspace(),dbMode:mode()})}catch(err){next(err)}});
router.put('/workspace',async(req,res,next)=>{try{res.json({ok:true,data:await replaceWorkspace(req.body,req.user)})}catch(err){next(err)}});
router.post('/workspace/reset-demo',async(req,res,next)=>{try{res.json({ok:true,data:await resetWorkspace()})}catch(err){next(err)}});
router.get('/projects',async(req,res,next)=>{try{res.json({ok:true,projects:(await readWorkspace()).projects})}catch(err){next(err)}});
router.post('/projects',async(req,res,next)=>{try{
 const {result,data}=await mutateWorkspace(state=>{
  const name=cleanText(req.body?.name,80);
  if(name.length<2)throw Object.assign(new Error('Project name must be at least 2 characters.'),{status:400});
  const project={id:id('project'),name,key:name.replace(/[^a-z0-9 ]/gi,'').split(' ').map(p=>p[0]).join('').slice(0,5).toUpperCase()||'PRJ',description:cleanText(req.body.description,400),color:req.body.color||'#5979e9',status:'active',ownerId:req.user.id,memberIds:[...new Set([req.user.id,...(Array.isArray(req.body.memberIds)?req.body.memberIds:[])])],createdAt:new Date().toISOString()};
  state.projects.unshift(project);state.activity.unshift(audit(req.user.id,'project',`created project “${name}”`,project.id));return project;
 });res.status(201).json({ok:true,project:result,data});
 }catch(err){next(err)}});
router.patch('/projects/:id',async(req,res,next)=>{try{
 const {result,data}=await mutateWorkspace(state=>{
  const p=state.projects.find(p=>p.id===req.params.id);
  if(!p)throw Object.assign(new Error('Project not found.'),{status:404});
  if(typeof req.body.name==='string')p.name=cleanText(req.body.name,80);
  if(!p.name)throw Object.assign(new Error('Project name required.'),{status:400});
  if(req.body.description!==undefined)p.description=cleanText(req.body.description,400);
  if(req.body.color)p.color=req.body.color;
  if(req.body.status)p.status=req.body.status;
  if(Array.isArray(req.body.memberIds))p.memberIds=[...new Set([p.ownerId,...req.body.memberIds])];
  state.activity.unshift(audit(req.user.id,'project',`updated project “${p.name}”`,p.id));return p;
 });res.json({ok:true,project:result,data});
 }catch(err){next(err)}});
router.delete('/projects/:id',async(req,res,next)=>{try{
 const {data}=await mutateWorkspace(state=>{
  if(!state.projects.some(p=>p.id===req.params.id))throw Object.assign(new Error('Project not found.'),{status:404});
  state.projects=state.projects.filter(p=>p.id!==req.params.id);state.tasks=state.tasks.filter(t=>t.projectId!==req.params.id);state.activity=state.activity.filter(a=>a.projectId!==req.params.id);
  state.notifications=state.notifications.filter(n=>!n.path.includes(`/projects/${req.params.id}`));
 });res.json({ok:true,data});
 }catch(err){next(err)}});
router.get('/tasks',async(req,res,next)=>{try{
 const tasks=(await readWorkspace()).tasks;res.json({ok:true,tasks:req.query.projectId?tasks.filter(t=>t.projectId===req.query.projectId):tasks});
 }catch(err){next(err)}});
router.post('/tasks',async(req,res,next)=>{try{
 const {result,data}=await mutateWorkspace(state=>{
  const project=state.projects.find(p=>p.id===req.body.projectId);
  if(!project)throw Object.assign(new Error('Choose a valid project.'),{status:400});
  const title=cleanText(req.body.title,160);if(title.length<2)throw Object.assign(new Error('Task title must contain two characters.'),{status:400});
  const now=new Date().toISOString();const task={id:id('task'),projectId:project.id,title,description:cleanText(req.body.description,4000),status:req.body.status||'todo',priority:req.body.priority||'medium',assigneeIds:req.body.assigneeIds||[],dueDate:req.body.dueDate||'',tag:req.body.tag||'',checklist:req.body.checklist||[],comments:[],createdBy:req.user.id,createdAt:now,updatedAt:now};
  state.tasks.unshift(task);state.activity.unshift(audit(req.user.id,'task',`created task “${title}”`,project.id,task.id));return task;
 });res.status(201).json({ok:true,task:result,data});
 }catch(err){next(err)}});
router.patch('/tasks/:id',async(req,res,next)=>{try{
 const {result,data}=await mutateWorkspace(state=>{
  const t=state.tasks.find(t=>t.id===req.params.id);if(!t)throw Object.assign(new Error('Task not found.'),{status:404});
  const allowed=['title','description','status','priority','assigneeIds','dueDate','tag','checklist'];
  for(const key of allowed)if(req.body[key]!==undefined)t[key]=req.body[key];
  t.updatedAt=new Date().toISOString();
  state.activity.unshift(audit(req.user.id,'task',`updated task “${t.title}”`,t.projectId,t.id));return t;
 });res.json({ok:true,task:result,data});
 }catch(err){next(err)}});
router.delete('/tasks/:id',async(req,res,next)=>{try{
 const {data}=await mutateWorkspace(state=>{
  const target=state.tasks.find(t=>t.id===req.params.id);if(!target)throw Object.assign(new Error('Task not found.'),{status:404});
  state.tasks=state.tasks.filter(t=>t.id!==req.params.id);state.activity.unshift(audit(req.user.id,'delete',`deleted task “${target.title}”`,target.projectId));
 });res.json({ok:true,data});
 }catch(err){next(err)}});
router.post('/tasks/:id/comments',async(req,res,next)=>{try{
 const {result,data}=await mutateWorkspace(state=>{
  const t=state.tasks.find(t=>t.id===req.params.id);if(!t)throw Object.assign(new Error('Task not found.'),{status:404});
  const body=cleanText(req.body.body,3000);if(!body)throw Object.assign(new Error('Comment cannot be empty.'),{status:400});
  const comment={id:id('comment'),userId:req.user.id,body,createdAt:new Date().toISOString()};
  t.comments.push(comment);t.updatedAt=new Date().toISOString();state.activity.unshift(audit(req.user.id,'comment',`commented on “${t.title}”`,t.projectId,t.id));return comment;
 });res.status(201).json({ok:true,comment:result,data});
 }catch(err){next(err)}});
router.get('/team',async(req,res,next)=>{try{res.json({ok:true,members:(await readWorkspace()).users})}catch(err){next(err)}});
router.get('/activity',async(req,res,next)=>{try{res.json({ok:true,activity:(await readWorkspace()).activity})}catch(err){next(err)}});
router.get('/notifications',async(req,res,next)=>{try{res.json({ok:true,notifications:(await readWorkspace()).notifications.filter(n=>n.userId===req.user.id)})}catch(err){next(err)}});
router.patch('/notifications/:id/read',async(req,res,next)=>{try{
 const {data}=await mutateWorkspace(state=>{const n=state.notifications.find(n=>n.id===req.params.id&&n.userId===req.user.id);if(!n)throw Object.assign(new Error('Notification not found.'),{status:404});n.read=true;return n});res.json({ok:true,data});
 }catch(err){next(err)}});
export default router;
