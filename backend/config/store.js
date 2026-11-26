import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import bcrypt from 'bcryptjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialData } from '../data/seed.js';
import { normalizeWorkspace, publicData } from '../lib/validation.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Workspace from '../models/Workspace.js';

const filePath=join(dirname(fileURLToPath(import.meta.url)),'../data/.local-demo-data.json');
let mongod=null;
let currentMode='file';
let localData=null;
let writeChain=Promise.resolve();

function lock(op){
 const result=writeChain.then(op);
 writeChain=result.catch(()=>{});
 return result;
}
async function sample(){
 const fresh=initialData();
 fresh.users=fresh.users.map(u=>({...u,passwordHash:null}));
 fresh.users[0].passwordHash=await bcrypt.hash('Demo@12345',10);
 return normalizeWorkspace(fresh,{users:fresh.users});
}
async function fetchMongo(){
 const [ws,users,projects,tasks,activity,notifications]=await Promise.all([
  Workspace.findOne({slug:'main'}).lean(),User.find().select('+passwordHash').sort('order').lean(),
  Project.find().sort('order').lean(),Task.find().sort('order').lean(),Activity.find().sort('order').lean(),Notification.find().sort('order').lean()
 ]);
 return {workspace:ws?{name:ws.name,description:ws.description,createdAt:ws.createdAt}:null,users,projects,tasks,activity,notifications};
}
function fetchFile(){return structuredClone(localData)}
async function fetchRaw(){return currentMode==='file'?fetchFile():fetchMongo()}
async function saveMongo(data){
  // A single local demo uses whole-workspace snapshots. A lock serializes writes.
  // Unique IDs are persisted in distinct MongoDB collections for inspectable data.
  await Workspace.updateOne({slug:'main'},{$set:{slug:'main',...data.workspace}},{upsert:true});
  for(const [Model,key] of [[User,'users'],[Project,'projects'],[Task,'tasks'],[Activity,'activity'],[Notification,'notifications']]){
    await Model.deleteMany({});
    if (data[key].length) await Model.insertMany(data[key],{ordered:true});
  }
}
function saveFile(data){
 localData=structuredClone(data);
 mkdirSync(dirname(filePath),{recursive:true});
 const tmp=filePath+'.tmp';
 writeFileSync(tmp,JSON.stringify(localData,null,2),'utf8');
 renameSync(tmp,filePath);
}
async function saveRaw(data){return currentMode==='file'?saveFile(data):saveMongo(data)}
async function initializeFile(){
 currentMode='file';
 try {if(existsSync(filePath)){
  const parsed=JSON.parse(readFileSync(filePath,'utf8'));
  localData=normalizeWorkspace(parsed,parsed);
 }} catch(err){console.warn('Cannot parse existing demo store:',err.message)}
 if(!localData) saveFile(await sample());
 console.log('📂 Demo storage: local JSON file (persistent; MongoDB not running)');
}
export async function connectStore(){
 const requested=(process.env.DB_MODE||'memory').toLowerCase();
 if(requested==='file'){await initializeFile();return;}
 try{
  if(requested==='atlas'){
    if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required for atlas mode');
    await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,dbName:'taskmate'});
    currentMode='atlas';
  } else {
    mongod=await MongoMemoryServer.create({instance:{dbName:'taskmate_demo'},binary:{downloadDir:join(dirname(filePath),'mongodb-binary-cache')}});
    await mongoose.connect(mongod.getUri(),{dbName:'taskmate_demo'});
    currentMode='memory';
  }
  const count=await User.countDocuments();
  if(!count) await saveMongo(await sample());
  console.log(`🍃 MongoDB database ready (${currentMode} mode)`);
 }catch(err){
  console.warn(`⚠️ Local MongoDB unavailable: ${err.message}`);
  if(mongoose.connection.readyState) await mongoose.disconnect().catch(()=>{});
  if(mongod) await mongod.stop().catch(()=>{});
  if(requested==='atlas') throw err;
  console.warn('⚠️ Switching to persistent file demo mode. REST API remains functional, but this mode is NOT MongoDB.');
  await initializeFile();
 }
}
export const mode=()=>currentMode;
export async function readWorkspace(){await writeChain;return publicData(await fetchRaw())}
export async function getUserByEmail(email){await writeChain;const state=await fetchRaw();return state.users.find(u=>u.email===email.toLowerCase())||null}
export async function getUserById(id){await writeChain;const state=await fetchRaw();return state.users.find(u=>u.id===id)||null}
export async function replaceWorkspace(snapshot,actor){return lock(async()=>{
 const old=await fetchRaw();
 if(!snapshot?.users?.some(user=>user.id===actor?.id))throw Object.assign(new Error('Cannot remove your own active account.'),{status:400});
 const cleaned=normalizeWorkspace(snapshot,old,actor);
 await saveRaw(cleaned);
 return publicData(cleaned);
})}
export async function registerUser(info){return lock(async()=>{
 const state=await fetchRaw();
 if(state.users.some(u=>u.email===info.email)) throw Object.assign(new Error('That email is already registered.'),{status:409});
 const user={id:info.id,name:info.name,email:info.email,passwordHash:info.passwordHash,role:'Member',title:'Team Member',color:'#dbe8f6'};
 state.users.push(user);
 const first=state.projects.find(p=>p.id==='p1');if(first) first.memberIds=[...new Set([...first.memberIds,user.id])];
 const cleaned=normalizeWorkspace(state,{users:state.users});
 await saveRaw(cleaned);
 return publicData(cleaned).users.find(u=>u.id===user.id);
})}
export async function resetWorkspace(){return lock(async()=>{const next=await sample();await saveRaw(next);return publicData(next)})}
export async function closeStore(){if(mongoose.connection.readyState) await mongoose.disconnect();if(mongod) await mongod.stop()}
export async function mutateWorkspace(transform){return lock(async()=>{
 const old=await fetchRaw();
 const state=publicData(old);
 const value=await transform(state);
 const cleaned=normalizeWorkspace(state,old);
 await saveRaw(cleaned);
 return {data:publicData(cleaned),result:value};
})}
