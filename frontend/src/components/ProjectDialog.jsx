import { useEffect, useState } from 'react';
import { X, Check, UsersRound } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import Avatar from './Avatar';
import { PROJECT_COLORS } from '../utils/helpers';

export default function ProjectDialog({project=null,onClose,onSaved}){
 const {data,currentUser,createProject,updateProject}=useWorkspace();
 const [form,setForm]=useState({name:project?.name||'',description:project?.description||'',color:project?.color||PROJECT_COLORS[0],status:project?.status||'active',memberIds:project?.memberIds||[currentUser.id]});
 const [error,setError]=useState('');
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
 const patch=(key,value)=>setForm(p=>({...p,[key]:value}));
 function submit(e){e.preventDefault();if(form.name.trim().length<2){setError('Project name must be at least 2 characters.');return;}const id=project?(updateProject(project.id,form)&&project.id):createProject(form);if(id){onSaved?.(id);onClose();}}
 return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
  <div className="dialog project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" onMouseDown={e=>e.stopPropagation()}>
   <header className="dialog-header"><div><div className="eyebrow">WORKSPACE / PROJECTS</div><h2 id="project-dialog-title">{project?'Edit project':'Create a project'}</h2></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={20}/></button></header>
   <form onSubmit={submit} className="dialog-body form-stack">
    <label className="field"><span>Project name <em>*</em></span><input autoFocus maxLength={80} placeholder="e.g. Q1 Product Launch" value={form.name} onChange={e=>{patch('name',e.target.value);setError('')}} required/></label>
    <label className="field"><span>Description</span><textarea rows={3} maxLength={400} placeholder="What are you working on?" value={form.description} onChange={e=>patch('description',e.target.value)}/></label>
    <div className="field"><span>Project color</span><div className="color-options">{PROJECT_COLORS.map(color=><button type="button" aria-label={`Choose color ${color}`} aria-pressed={form.color===color} className={`color-option ${form.color===color?'selected':''}`} style={{background:color}} key={color} onClick={()=>patch('color',color)}>{form.color===color&&<Check size={15} color="white"/>}</button>)}</div></div>
    {project&&<label className="field"><span>Project status</span><select value={form.status} onChange={e=>patch('status',e.target.value)}><option value="active">Active</option><option value="completed">Completed</option></select></label>}
    <div className="field"><span>Team members</span><div className="member-picker">{data.users.map(user=><label className="member-option" key={user.id}><input type="checkbox" checked={form.memberIds.includes(user.id)} disabled={project?.ownerId===user.id || (!project && currentUser.id===user.id)} onChange={e=>patch('memberIds',e.target.checked?[...form.memberIds,user.id]:form.memberIds.filter(id=>id!==user.id))}/><Avatar size="sm" user={user}/><span><strong>{user.name}</strong><small>{user.title}</small></span></label>)}</div></div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    <div className="dialog-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">{project?'Save changes':'Create project'}</button></div>
   </form>
  </div>
 </div>;
}
