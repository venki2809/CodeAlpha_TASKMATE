import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, ListTodo, Plus, Search } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { STATUSES, dateLabel, isOverdue, todayString, addDays } from '../utils/helpers';
import { AvatarStack } from '../components/Avatar';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';

export default function MyTasksPage(){
 const {data,currentUser}=useWorkspace();const navigate=useNavigate();const [filter,setFilter]=useState('open'),[query,setQuery]=useState(''),[newTask,setNewTask]=useState(false);
 const all=data.tasks.filter(t=>t.assigneeIds.includes(currentUser.id));
 const filtered=useMemo(()=>all.filter(t=>{
   if(query&&!t.title.toLowerCase().includes(query.toLowerCase()))return false;
   if(filter==='open')return t.status!=='done';
   if(filter==='today')return t.dueDate===todayString()&&t.status!=='done';
   if(filter==='overdue')return isOverdue(t);
   if(filter==='upcoming')return t.status!=='done'&&!!t.dueDate&&t.dueDate>todayString();
   if(filter==='done')return t.status==='done';
   return true;
 }).sort((a,b)=>(a.dueDate||'9999-12-31').localeCompare(b.dueDate||'9999-12-31')),[all,filter,query]);
 const tabs=[{id:'open',label:'Open',count:all.filter(t=>t.status!=='done').length},{id:'today',label:'Due today',count:all.filter(t=>t.dueDate===todayString()&&t.status!=='done').length},{id:'upcoming',label:'Upcoming',count:all.filter(t=>t.dueDate>todayString()&&t.status!=='done').length},{id:'overdue',label:'Overdue',count:all.filter(isOverdue).length},{id:'done',label:'Completed',count:all.filter(t=>t.status==='done').length}];
 return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">PERSONAL WORKSPACE</div><h1>My tasks</h1><p>Stay on top of the work that matters to you.</p></div><button type="button" className="btn btn-primary" onClick={()=>setNewTask(true)}><Plus size={17}/> New task</button></div>
 <div className="my-task-summary"><div><ListTodo size={18}/><strong>{all.filter(t=>t.status!=='done').length}</strong><span>Open tasks</span></div><div><CalendarClock size={18}/><strong>{all.filter(isOverdue).length}</strong><span>Overdue</span></div><div><CheckCircle2 size={18}/><strong>{all.filter(t=>t.status==='done').length}</strong><span>Completed</span></div></div>
 <div className="toolbar my-tasks-toolbar"><div className="tab-group" role="tablist" aria-label="Filter my tasks">{tabs.map(t=><button role="tab" aria-selected={filter===t.id} className={`tab ${filter===t.id?'active':''}`} type="button" key={t.id} onClick={()=>setFilter(t.id)}>{t.label}<span className="tab-count">{t.count}</span></button>)}</div><label className="toolbar-search"><Search size={16}/><input placeholder="Search my tasks..." aria-label="Search my tasks" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 {filtered.length?<div className="my-tasks-list">{filtered.map(t=>{const project=data.projects.find(p=>p.id===t.projectId);const st=STATUSES.find(s=>s.id===t.status);return <button type="button" key={t.id} className="my-task-row" onClick={()=>navigate(`/projects/${t.projectId}?task=${t.id}`)}><span className="task-state-icon" style={{borderColor:st?.color}}>{t.status==='done'&&<CheckCircle2 size={21} color={st?.color}/>}</span><div className="my-task-main"><strong>{t.title}</strong><span className="my-task-project"><span className="project-square" style={{background:project?.color}}/>{project?.name}</span></div><span className={`status-chip status-${t.status}`}>{st?.label}</span><span className={`my-task-due ${isOverdue(t)?'red-text':''}`}>{dateLabel(t.dueDate)}</span><ArrowRight size={17} className="light-icon"/></button>})}</div>:<EmptyState icon={ListTodo} title="No tasks in this view" description="Choose a different filter or create a new task." action={<button className="btn btn-primary" type="button" onClick={()=>setNewTask(true)}><Plus size={16}/> Create task</button>}/>}
 {newTask&&<TaskModal onClose={()=>setNewTask(false)}/>}
 </div>;
}
