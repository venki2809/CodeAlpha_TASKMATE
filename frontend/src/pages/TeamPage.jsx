import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UsersRound, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

function AddMemberDialog({onClose}){
 const {addMember}=useWorkspace();const [form,setForm]=useState({name:'',email:'',title:'',role:'Member'}),[error,setError]=useState('');
 function submit(e){e.preventDefault();const res=addMember(form);if(res.ok)onClose();else setError(res.message)}
 return <div className="modal-backdrop" onMouseDown={onClose} role="presentation"><div className="dialog member-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title" onMouseDown={e=>e.stopPropagation()}><header className="dialog-header"><div><div className="eyebrow">WORKSPACE / PEOPLE</div><h2 id="member-dialog-title">Add a demo member</h2></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={20}/></button></header><form className="dialog-body form-stack" onSubmit={submit}><p className="muted-small">Add a teammate to the local workspace. No invitation email will be sent.</p><label className="field"><span>Full name <em>*</em></span><input autoFocus minLength={2} maxLength={70} required placeholder="e.g. Sarah Kim" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label><label className="field"><span>Email address <em>*</em></span><input required type="email" placeholder="sarah@company.com" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label><label className="field"><span>Job title</span><input maxLength={90} placeholder="e.g. Product Designer" value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))}/></label><label className="field"><span>Workspace role</span><select value={form.role} onChange={e=>setForm(v=>({...v,role:e.target.value}))}><option>Member</option><option>Admin</option></select></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="dialog-actions"><button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">Add member</button></div></form></div></div>;
}
export default function TeamPage(){
 const {data}=useWorkspace();const [query,setQuery]=useState(''),[addOpen,setAddOpen]=useState(false);
 const users=data.users.filter(u=>`${u.name} ${u.email} ${u.title}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE / PEOPLE</div><h1>Team members</h1><p>Great work takes a great team. Meet yours.</p></div><button type="button" className="btn btn-primary" onClick={()=>setAddOpen(true)}><Plus size={17}/> Add member</button></div>
 <div className="team-summary"><UsersRound size={19}/><strong>{data.users.length} members</strong><span>in {data.workspace.name}</span></div>
 <div className="toolbar team-toolbar"><h2>People</h2><label className="toolbar-search"><Search size={16}/><input placeholder="Search members..." aria-label="Search members" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 {users.length?<div className="members-list"><div className="members-header"><span>NAME</span><span>ROLE</span><span>PROJECTS</span><span>OPEN TASKS</span></div>{users.map(u=>{const projectCount=data.projects.filter(p=>p.memberIds.includes(u.id)).length;const openCount=data.tasks.filter(t=>t.assigneeIds.includes(u.id)&&t.status!=='done').length;return <div className="member-row" key={u.id}><div className="member-ident"><Avatar user={u} size="lg"/><div><strong>{u.name}</strong><small>{u.email}</small><small>{u.title}</small></div></div><span><span className={`role-pill ${u.role==='Admin'?'role-admin':''}`}>{u.role}</span></span><span>{projectCount} {projectCount===1?'project':'projects'}</span><span><strong>{openCount}</strong> open</span></div>})}</div>:<EmptyState title="No members found" description="Try a different name or email."/>}
 <p className="help-hint">To assign someone to a project, open the project menu and choose <strong>Edit project</strong>.</p>
 {addOpen&&<AddMemberDialog onClose={()=>setAddOpen(false)}/>}
 </div>;
}
