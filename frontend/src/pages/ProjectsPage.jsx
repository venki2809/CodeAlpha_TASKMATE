import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderKanban, Plus, Search } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { projectProgress } from '../utils/helpers';
import { AvatarStack } from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ProjectDialog from '../components/ProjectDialog';

export default function ProjectsPage(){
 const {data}=useWorkspace();const navigate=useNavigate();const [filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[openCreate,setOpenCreate]=useState(false);
 const projects=data.projects.filter(p=>(filter==='all'||p.status===filter)&&p.name.toLowerCase().includes(query.toLowerCase()));
 return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE / PROJECTS</div><h1>Projects</h1><p>Everything your team is working on, in one place.</p></div><button type="button" className="btn btn-primary" onClick={()=>setOpenCreate(true)}><Plus size={17}/> New project</button></div>
 <div className="toolbar"><div className="tab-group" role="tablist" aria-label="Filter projects">{[{id:'all',label:'All projects'},{id:'active',label:'Active'},{id:'completed',label:'Completed'}].map(tab=><button role="tab" aria-selected={filter===tab.id} type="button" className={`tab ${filter===tab.id?'active':''}`} key={tab.id} onClick={()=>setFilter(tab.id)}>{tab.label}{tab.id==='all'&&<span className="tab-count">{data.projects.length}</span>}</button>)}</div><label className="toolbar-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a project..." aria-label="Find a project"/></label></div>
 {projects.length?<div className="projects-grid">{projects.map(p=>{const tasks=data.tasks.filter(t=>t.projectId===p.id);const done=tasks.filter(t=>t.status==='done').length;return <button type="button" key={p.id} className="project-card" onClick={()=>navigate(`/projects/${p.id}`)}><div className="project-card-top"><span className="project-card-icon" style={{background:`${p.color}1d`,color:p.color}}><FolderKanban size={22}/></span><span className={`small-status ${p.status==='completed'?'status-done':''}`}>{p.status==='completed'?'Completed':'Active'}</span></div><h2>{p.name}</h2><p>{p.description||'No description yet.'}</p><div className="project-card-progress"><div><span>Progress</span><strong>{projectProgress(data.tasks,p.id)}%</strong></div><div className="progress-bar"><span style={{width:`${projectProgress(data.tasks,p.id)}%`,background:p.color}}/></div></div><div className="project-card-footer"><AvatarStack ids={p.memberIds} users={data.users}/><span>{done}/{tasks.length} tasks <ArrowRight size={17}/></span></div></button>})}<button type="button" className="project-card project-card-create" onClick={()=>setOpenCreate(true)}><span className="project-card-plus"><Plus size={26}/></span><h3>Start something new</h3><p>Create a project to organize tasks and collaborate with your team.</p></button></div>:<EmptyState icon={FolderKanban} title="No projects found" description="Try another search or create a project." action={<button type="button" className="btn btn-primary" onClick={()=>setOpenCreate(true)}><Plus size={16}/> Create project</button>}/>}
 {openCreate&&<ProjectDialog onClose={()=>setOpenCreate(false)} onSaved={id=>navigate(`/projects/${id}`)}/>}
 </div>;
}
