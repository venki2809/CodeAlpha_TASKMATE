import { CalendarDays, CheckSquare, MessageCircle, Flag } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import Avatar, { AvatarStack } from './Avatar';
import { dateLabel, isOverdue } from '../utils/helpers';

export default function TaskCard({task,onOpen,draggable=false,onDragStart,compact=false}){
  const {data}=useWorkspace();
  const completed=task.checklist?.filter(c=>c.done).length||0;
  return <button type="button" className={`task-card ${compact?'task-card-compact':''}`} onClick={()=>onOpen(task.id)} draggable={draggable} onDragStart={e=>{if(draggable){e.dataTransfer.setData('text/taskmate-id',task.id);e.dataTransfer.effectAllowed='move';onDragStart?.(task.id);}}}>
    <div className="task-card-top"><span className="task-id">{data.projects.find(p=>p.id===task.projectId)?.key||'TASK'}-{task.id.replace(/[^0-9]/g,'').slice(-3)||task.id.slice(-3).toUpperCase()}</span>{task.priority==='urgent'&&<span className="urgent-indicator"><Flag size={12} fill="currentColor"/> Urgent</span>}</div>
    <div className="task-card-title">{task.title}</div>
    {task.tag&&<div className="task-tag">{task.tag}</div>}
    <div className="task-card-footer">
      <div className="task-mini-meta">
        {task.dueDate&&<span className={`task-date ${isOverdue(task)?'overdue':''}`}><CalendarDays size={13}/>{dateLabel(task.dueDate)}</span>}
        {!!task.checklist?.length&&<span><CheckSquare size={13}/>{completed}/{task.checklist.length}</span>}
        {!!task.comments?.length&&<span><MessageCircle size={13}/>{task.comments.length}</span>}
      </div>
      <AvatarStack ids={task.assigneeIds} users={data.users} limit={2} size="xs"/>
    </div>
  </button>;
}
