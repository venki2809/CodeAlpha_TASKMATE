import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, CircleDot, FolderKanban, Plus, TrendingUp, Zap, Clock3 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { dateLabel, getGreeting, isOverdue, projectProgress, relativeTime, todayString } from '../utils/helpers';
import Avatar, { AvatarStack } from '../components/Avatar';
import ProjectDialog from '../components/ProjectDialog';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';

export default function DashboardPage(){
 const {data,currentUser}=useWorkspace();const navigate=useNavigate();const [newProject,setNewProject]=useState(false),[newTask,setNewTask]=useState(false);
 const openTasks=data.tasks.filter(t=>t.status!=='done');const myTasks=openTasks.filter(t=>t.assigneeIds.includes(currentUser.id));
 const priorityTasks=[...myTasks].sort((a,b)=>(Number(isOverdue(b))-Number(isOverdue(a))) || (a.dueDate||'9999').localeCompare(b.dueDate||'9999')).slice(0,5);
 const overdue=myTasks.filter(isOverdue).length;
 const dateText=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric'}).format(new Date());
 return <div className="page-content dashboard-page">
   <div className="page-heading"><div><div className="eyebrow">{dateText.toUpperCase()}</div><h1>{getGreeting()}, {currentUser.name.split(' ')[0]} <span className="subdued-period">.</span></h1><p>Here's what's happening across your workspace today.</p></div><button type="button" className="btn btn-primary" onClick={()=>setNewProject(true)}><Plus size={17}/> New project</button></div>
   <section className="stats-strip" aria-label="Workspace summary"><div className="stat-item"><div className="stat-top"><FolderKanban size={18}/> Active projects</div><div className="stat-value">{data.projects.filter(p=>p.status==='active').length}<span className="stat-detail">in workspace</span></div></div><div className="stat-item"><div className="stat-top"><CircleDot size={18}/> My open tasks</div><div className="stat-value">{myTasks.length}<span className="stat-detail">assigned to me</span></div></div><div className="stat-item"><div className="stat-top"><CheckCircle2 size={18}/> Completed</div><div className="stat-value">{data.tasks.filter(t=>t.status==='done').length}<span className="stat-detail">total tasks</span></div></div><div className="stat-item"><div className="stat-top"><CalendarClock size={18}/> Overdue</div><div className="stat-value">{overdue}<span className="stat-detail">need attention</span></div></div></section>
   <div className="dashboard-columns"><section className="dashboard-primary"><div className="section-heading"><div><h2>Projects at a glance</h2><p>Keep track of what's in motion.</p></div><Link to="/projects" className="section-link">All projects <ArrowRight size={16}/></Link></div>
    <div className="project-overview-list">{data.projects.slice(0,4).map(p=>{const tasks=data.tasks.filter(t=>t.projectId===p.id);const done=tasks.filter(t=>t.status==='done').length;const progress=projectProgress(data.tasks,p.id);return <button className="project-overview-row" type="button" key={p.id} onClick={()=>navigate(`/projects/${p.id}`)}><span className="overview-project-icon" style={{background:`${p.color}1c`,color:p.color}}><FolderKanban size={21}/></span><div className="overview-project-main"><div className="overview-project-name">{p.name}<span className={`small-status ${p.status==='completed'?'status-done':''}`}>{p.status==='completed'?'Completed':'Active'}</span></div><span className="overview-project-description">{done} of {tasks.length} tasks completed</span><div className="progress-bar"><span style={{width:`${progress}%`,background:p.color}}/></div></div><span className="overview-project-right"><strong>{progress}%</strong><ArrowRight size={17}/></span></button>})}</div>
    <div className="section-heading section-heading-space"><div><h2>My priorities</h2><p>The next things worth your attention.</p></div><Link to="/my-tasks" className="section-link">View my tasks <ArrowRight size={16}/></Link></div>
    {priorityTasks.length?<div className="priority-list">{priorityTasks.map(t=><button type="button" className="priority-row" key={t.id} onClick={()=>navigate(`/projects/${t.projectId}?task=${t.id}`)}><span className={`priority-status-circle ${t.status}`}/><div className="priority-row-main"><strong>{t.title}</strong><small>{data.projects.find(p=>p.id===t.projectId)?.name}</small></div><span className={`priority-due ${isOverdue(t)?'priority-overdue':''}`}><Clock3 size={14}/>{t.dueDate?dateLabel(t.dueDate):'Anytime'}</span><ArrowRight size={16} className="priority-row-arrow"/></button>)}</div>:<EmptyState title="You're all caught up" description="There are no open tasks assigned to you."/>}
   </section>
   <aside className="dashboard-aside"><div className="section-heading"><h2>Team activity</h2><Link to="/activity" className="section-link">See all</Link></div><div className="activity-list compact-activity">{data.activity.slice(0,6).map(a=>{const user=data.users.find(u=>u.id===a.actorId);return <button className="activity-entry" type="button" key={a.id} onClick={()=>a.projectId&&navigate(`/projects/${a.projectId}${a.taskId?`?task=${a.taskId}`:''}`)}><Avatar user={user} size="sm"/><span className="activity-entry-text"><span><strong>{user?.name.split(' ')[0]||'Someone'}</strong> {a.message}</span><small>{relativeTime(a.createdAt)}</small></span></button>})}</div>
    <div className="quick-panel"><div className="quick-panel-mark"><Zap size={20}/></div><h3>A little progress adds up.</h3><p>Give that next idea a home. Start with a task, then make it happen.</p><button type="button" className="btn btn-dark-outline" onClick={()=>setNewTask(true)}><Plus size={16}/> Create a task</button></div>
   </aside></div>
   {newProject&&<ProjectDialog onClose={()=>setNewProject(false)} onSaved={id=>navigate(`/projects/${id}`)}/>}
   {newTask&&<TaskModal onClose={()=>setNewTask(false)}/>}
 </div>;
}
