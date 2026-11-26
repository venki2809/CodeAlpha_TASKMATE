import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FolderKanban, MessageSquareText, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { relativeTime } from '../utils/helpers';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
const FILTERS=[{id:'all',label:'All activity'},{id:'task',label:'Tasks'},{id:'status',label:'Status changes'},{id:'comment',label:'Comments'},{id:'project',label:'Projects'}];
export default function ActivityPage(){
 const {data}=useWorkspace();const navigate=useNavigate();const [filter,setFilter]=useState('all');
 const feed=data.activity.filter(a=>filter==='all'||a.type===filter).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE / HISTORY</div><h1>Activity</h1><p>A clear view of how your team's work is moving forward.</p></div></div>
 <div className="toolbar"><div className="tab-group" role="tablist" aria-label="Filter activity">{FILTERS.map(t=><button type="button" role="tab" aria-selected={filter===t.id} className={`tab ${filter===t.id?'active':''}`} key={t.id} onClick={()=>setFilter(t.id)}>{t.label}</button>)}</div></div>
 {feed.length?<div className="activity-feed">{feed.map(a=>{const user=data.users.find(u=>u.id===a.actorId);const project=data.projects.find(p=>p.id===a.projectId);return <div className="feed-entry" key={a.id}><div className="feed-rail"><Avatar user={user} size="sm"/><span/></div><div className="feed-content"><div><strong>{user?.name||'Team member'}</strong> {a.message}</div><div className="feed-meta"><span>{relativeTime(a.createdAt)}</span>{project&&<><span>·</span><button type="button" onClick={()=>navigate(`/projects/${project.id}${a.taskId&&data.tasks.some(t=>t.id===a.taskId)?`?task=${a.taskId}`:''}`)}>{project.name}</button></>}</div></div></div>})}</div>:<EmptyState icon={Activity} title="No activity here yet" description="As your team works on tasks and projects, updates will appear here."/>}
 </div>;
}
