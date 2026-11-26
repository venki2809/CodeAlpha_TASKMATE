import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createId, formatProjectKey, safeText, STATUSES } from '../utils/helpers';
import { getToken, setToken, request } from '../services/api';

const WorkspaceContext = createContext(null);
const emptyData = () => ({workspace:{name:'Studio North',description:''},users:[],projects:[],tasks:[],activity:[],notifications:[]});

const logEntry = (actorId, type, message, projectId = '', taskId = '') => ({ id:createId('act'), actorId, type, message, projectId, taskId, createdAt:new Date().toISOString() });

export function WorkspaceProvider({ children }) {
  const [data,setDataState] = useState(emptyData);
  const [sessionId,setSessionId] = useState('');
  const [ready,setReady] = useState(false);
  const [dbMode,setDbMode] = useState('checking');
  const [toast,setToast] = useState(null);
  const dataRef=useRef(data);
  const saveQueue=useRef(Promise.resolve());
  const currentUser=data.users.find(u=>u.id===sessionId)||null;
  const flash=useCallback((message,kind='success')=>setToast({id:createId('toast'),message,kind}),[]);

  const receiveData = useCallback(snapshot=>{dataRef.current=snapshot;setDataState(snapshot)},[]);
  const refreshData = async(token=getToken())=>{
    const payload=await request('/workspace',{token});
    receiveData(payload.data);setDbMode(payload.dbMode||'memory');
  };
  useEffect(()=>{
    let active=true;
    async function initialize(){
      const token=getToken();
      if(token){
        try{
          const auth=await request('/auth/me',{token});
          const payload=await request('/workspace',{token});
          if(active){receiveData(payload.data);setSessionId(auth.user.id);setDbMode(payload.dbMode||'memory')}
        }catch{setToken('')}
      }
      if(active)setReady(true);
    }
    initialize();
    return()=>{active=false};
  },[receiveData]);
  useEffect(()=>{
    if(!toast)return;
    const timeout=setTimeout(()=>setToast(null),3800);
    return()=>clearTimeout(timeout);
  },[toast]);

  // Keep original synchronous UI interactions (drag/drop, forms, popovers),
  // and commit each snapshot to Express in order. Errors are shown to the user.
  // All project/task/comment records are stored by the backend, not localStorage.
  function setData(updater){
    const next=typeof updater==='function'?updater(dataRef.current):updater;
    dataRef.current=next;
    setDataState(next);
    const token=getToken();
    if(!token){flash('Not signed in. Change was not saved.','error');return}
    saveQueue.current=saveQueue.current.catch(()=>{}).then(async()=>{
      await request('/workspace',{method:'PUT',body:next,token});
    }).catch(error=>{
      flash(`Save failed: ${error.message}`,'error');
    });
  }
  async function signedIn(auth,message){
    setToken(auth.token);
    await refreshData(auth.token);
    setSessionId(auth.user.id);
    if(message)flash(message);
    return {ok:true};
  }
  const login=async(email,password)=>{
    try{
      const auth=await request('/auth/login',{method:'POST',body:{email,password},token:''});
      return signedIn(auth,`Welcome back, ${auth.user.name.split(' ')[0]}!`);
    }catch(error){return {ok:false,message:error.message}}
  };
  const demoLogin=async()=>{
    try{const auth=await request('/auth/demo',{method:'POST',token:''});return await signedIn(auth,'Welcome to your demo workspace!')}
    catch(error){return {ok:false,message:error.message}}
  };
  const logout=()=>{setToken('');setSessionId('');receiveData(emptyData())};
  const switchUser=async id=>{
    try{
      await saveQueue.current;
      const auth=await request('/auth/switch-demo-user',{method:'POST',body:{id}});
      await signedIn(auth,`Viewing as ${auth.user.name.split(' ')[0]} (demo)`);
      return true;
    }catch(error){flash(error.message,'error');return false}
  };
  const register=async({name,email,password})=>{
    try{
      const auth=await request('/auth/register',{method:'POST',body:{name,email,password},token:''});
      return signedIn(auth,'Account created. Welcome to TASKMATE!');
    }catch(error){return {ok:false,message:error.message}}
  };
  const createProject = ({name,description,color,memberIds}) => {
    const title = safeText(name,80);
    if (!title) return null;
    const id = createId('project');
    setData(prev => {
      const basis = formatProjectKey(title);
      let key = basis;
      let suffix = 2;
      while (prev.projects.some(project => project.key === key)) key = `${basis}${suffix++}`;
      const members = [...new Set([sessionId, ...(memberIds || [])])].filter(u => prev.users.some(user => user.id === u));
      const project = {id,name:title,key,description:safeText(description,400),color:color || '#5979e9',status:'active',ownerId:sessionId,memberIds:members,createdAt:new Date().toISOString()};
      return {...prev, projects:[project,...prev.projects], activity:[logEntry(sessionId,'project',`created project “${title}”`,id),...prev.activity]};
    });
    flash('Project created');
    return id;
  };
  const updateProject = (id, fields) => {
    const title = safeText(fields.name,80);
    if (!title) return false;
    setData(prev => ({...prev,projects:prev.projects.map(p => p.id === id ? {...p,name:title,description:safeText(fields.description,400),color:fields.color || p.color,status:fields.status || p.status, memberIds:[...new Set([p.ownerId,...(fields.memberIds || [])])].filter(uid=>prev.users.some(u=>u.id===uid))} : p),activity:[logEntry(sessionId,'project',`updated project “${title}”`,id),...prev.activity]}));
    flash('Project updated');
    return true;
  };
  const deleteProject = (id) => {
    setData(prev => ({...prev,projects:prev.projects.filter(p=>p.id!==id),tasks:prev.tasks.filter(t=>t.projectId!==id),activity:prev.activity.filter(a=>a.projectId!==id),notifications:prev.notifications.filter(n=>!n.path.includes(`/projects/${id}`))}));
    flash('Project deleted');
  };
  const createTask = (fields) => {
    const title = safeText(fields.title,160);
    if (!title || !data.projects.some(p=>p.id===fields.projectId)) return null;
    const id = createId('task');
    const task = {id,projectId:fields.projectId,title,description:safeText(fields.description,4000),status:fields.status || 'todo',priority:fields.priority || 'medium',assigneeIds:fields.assigneeIds || [],dueDate:fields.dueDate || '',tag:fields.tag || '',checklist:(fields.checklist || []).map(c=>({id:c.id || createId('check'),text:safeText(c.text,160),done:!!c.done})),comments:[],createdBy:sessionId,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    setData(prev => ({...prev,tasks:[task,...prev.tasks],activity:[logEntry(sessionId,'task',`created task “${title}”`,fields.projectId,id),...prev.activity],notifications:[...task.assigneeIds.filter(uid=>uid!==sessionId).map(uid=>({id:createId('notif'),userId:uid,read:false,message:`You were assigned “${title}”.`,path:`/projects/${fields.projectId}?task=${id}`,createdAt:new Date().toISOString()})),...prev.notifications]}));
    flash('Task created');
    return id;
  };
  const updateTask = (id, fields) => {
    const original = data.tasks.find(t=>t.id===id);
    if (!original) return false;
    const updated = {...original,...fields,title:safeText(fields.title ?? original.title,160),description:safeText(fields.description ?? original.description,4000),updatedAt:new Date().toISOString()};
    if (!updated.title) return false;
    const statusText = STATUSES.find(s=>s.id===updated.status)?.label || 'Updated';
    const message = original.status !== updated.status ? `moved “${updated.title}” to ${statusText}` : `updated task “${updated.title}”`;
    setData(prev=>({...prev,tasks:prev.tasks.map(t=>t.id===id?updated:t),activity:[logEntry(sessionId,original.status !== updated.status?'status':'task',message,updated.projectId,id),...prev.activity],notifications:[...updated.assigneeIds.filter(uid=>uid!==sessionId && !original.assigneeIds.includes(uid)).map(uid=>({id:createId('notif'),userId:uid,read:false,message:`You were assigned “${updated.title}”.`,path:`/projects/${updated.projectId}?task=${id}`,createdAt:new Date().toISOString()})),...prev.notifications]}));
    flash(original.status !== updated.status ? `Moved to ${statusText}` : 'Task updated');
    return true;
  };
  const deleteTask = id => {
    const target = data.tasks.find(t=>t.id===id);
    if (!target) return;
    setData(prev=>({...prev,tasks:prev.tasks.filter(t=>t.id!==id),activity:[logEntry(sessionId,'delete',`deleted task “${target.title}”`,target.projectId),...prev.activity]}));
    flash('Task deleted');
  };
  const addComment = (taskId, body) => {
    const target = data.tasks.find(t=>t.id===taskId);
    const text = safeText(body,3000);
    if (!target || !text) return false;
    const comment = {id:createId('comment'),userId:sessionId,body:text,createdAt:new Date().toISOString()};
    setData(prev=>({...prev,tasks:prev.tasks.map(t=>t.id===taskId?{...t,comments:[...t.comments,comment],updatedAt:new Date().toISOString()}:t),activity:[logEntry(sessionId,'comment',`commented on “${target.title}”`,target.projectId,taskId),...prev.activity],notifications:[...target.assigneeIds.filter(uid=>uid!==sessionId).map(uid=>({id:createId('notif'),userId:uid,read:false,message:`New comment on “${target.title}”.`,path:`/projects/${target.projectId}?task=${taskId}`,createdAt:new Date().toISOString()})),...prev.notifications]}));
    flash('Comment added');
    return true;
  };
  const addMember = ({name,email,title,role}) => {
    const userName = safeText(name,70), userEmail = String(email).trim().toLowerCase();
    if (userName.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) return {ok:false,message:'Enter a name and valid email.'};
    if (data.users.some(u=>u.email.toLowerCase()===userEmail)) return {ok:false,message:'This member is already in the workspace.'};
    const user={id:createId('user'),name:userName,email:userEmail,title:safeText(title,90) || 'Team Member',role:role==='Admin'?'Admin':'Member',color:'#e4e3fa'};
    setData(prev=>({...prev,users:[...prev.users,user],activity:[logEntry(sessionId,'member',`added ${userName} to the workspace`),...prev.activity]}));
    flash('Demo member added');
    return {ok:true};
  };
  const updateProfile = ({name,title}) => {
    if (!safeText(name,70)) return false;
    setData(prev=>({...prev,users:prev.users.map(u=>u.id===sessionId?{...u,name:safeText(name,70),title:safeText(title,90)}:u)}));
    flash('Profile updated');
    return true;
  };
  const updateWorkspace = ({name,description}) => {
    if (!safeText(name,80)) return false;
    setData(prev=>({...prev,workspace:{...prev.workspace,name:safeText(name,80),description:safeText(description,200)}}));
    flash('Workspace updated');
    return true;
  };
  const readNotification = id => setData(prev=>({...prev,notifications:prev.notifications.map(n=>n.id===id?{...n,read:true}:n)}));
  const readAllNotifications = () => {setData(prev=>({...prev,notifications:prev.notifications.map(n=>n.userId===sessionId?{...n,read:true}:n)}));flash('All notifications marked as read');};
  const resetDemo = async () => {
    try {
      await saveQueue.current;
      await request('/workspace/reset-demo',{method:'POST'});
      const auth=await request('/auth/demo',{method:'POST',token:''});
      await signedIn(auth,'Sample MongoDB workspace restored');
    } catch(error) { flash(error.message,'error') }
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='taskmate-demo-data.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);flash('Demo data exported');
  };
  const value = useMemo(()=>({data,currentUser,sessionId,ready,dbMode,toast,setToast,flash,login,demoLogin,logout,switchUser,register,createProject,updateProject,deleteProject,createTask,updateTask,deleteTask,addComment,addMember,updateProfile,updateWorkspace,readNotification,readAllNotifications,resetDemo,exportData}),[data,currentUser,sessionId,ready,dbMode,toast,flash]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace() {
  const ctx=useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
