import { useEffect, useState } from 'react';
import { CalendarDays, Check, CheckSquare2, MessageSquareText, Plus, Send, Trash2, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PRIORITIES, STATUSES, TAGS, createId, dateLabel, relativeTime } from '../utils/helpers';
import Avatar from './Avatar';
import ConfirmDialog from './ConfirmDialog';

export default function TaskModal({task=null,projectId='',onClose,onSaved,initialStatus='todo'}){
  const {data,currentUser,createTask,updateTask,deleteTask,addComment}=useWorkspace();
  const [form,setForm]=useState(()=>({projectId:task?.projectId||projectId||data.projects[0]?.id||'',title:task?.title||'',description:task?.description||'',status:task?.status||initialStatus,priority:task?.priority||'medium',tag:task?.tag||'',dueDate:task?.dueDate||'',assigneeIds:task?.assigneeIds||[currentUser.id],checklist:task?.checklist?.map(c=>({...c}))||[]}));
  const [comment,setComment]=useState('');
  const [checkText,setCheckText]=useState('');
  const [error,setError]=useState('');
  const [confirmDelete,setConfirmDelete]=useState(false);
  useEffect(()=>{const onKey=e=>{if(e.key==='Escape'&&!confirmDelete)onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose,confirmDelete]);
  const change=(name,value)=>setForm(old=>({...old,[name]:value}));
  const project=data.projects.find(p=>p.id===form.projectId);
  const members=data.users.filter(u=>project?.memberIds.includes(u.id));
  function submit(e){e.preventDefault();if(form.title.trim().length<2){setError('Enter a task title with at least 2 characters.');return;}if(!form.projectId){setError('Choose a project.');return;}const ok=task?updateTask(task.id,form):createTask(form);if(ok){onSaved?.(ok===true?task.id:ok);onClose();}}
  function submitComment(e){e.preventDefault();if(comment.trim()&&task&&addComment(task.id,comment)){setComment('');}}
  function addCheck(e){e.preventDefault();if(!checkText.trim())return;change('checklist',[...form.checklist,{id:createId('check'),text:checkText.trim(),done:false}]);setCheckText('');}
  return <div className="modal-backdrop task-overlay" role="presentation" onMouseDown={onClose}>
    <div className="dialog task-dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" onMouseDown={e=>e.stopPropagation()}>
      <div className="task-dialog-header"><div className="task-dialog-project"><span className="project-dot" style={{background:project?.color||'#6b7280'}}/>{project?.name||'New task'}<span className="breadcrumbs-separator">/</span>{task?'Task details':'New task'}</div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close task"><X size={20}/></button></div>
      <div className="task-dialog-scroll">
      <form id="task-editor-form" className="task-form-layout" onSubmit={submit}>
        <div className="task-form-main">
          <h2 id="task-dialog-title" className="dialog-heading">{task?'Edit task':'Create a task'}</h2>
          <label className="field"><span>Task title <em>*</em></span><input className="task-title-input" autoFocus maxLength={160} placeholder="What needs to get done?" value={form.title} required onChange={e=>{change('title',e.target.value);setError('')}}/></label>
          <label className="field"><span>Description</span><textarea rows={5} maxLength={4000} placeholder="Add a brief description or useful details..." value={form.description} onChange={e=>change('description',e.target.value)}/></label>
          <section className="task-checklist-section"><div className="section-heading-row"><h3><CheckSquare2 size={17}/> Checklist</h3><span className="muted-small">{form.checklist.filter(c=>c.done).length} of {form.checklist.length}</span></div>
          {!!form.checklist.length&&<div className="checklist-progress"><div style={{width:`${Math.round(form.checklist.filter(c=>c.done).length/form.checklist.length*100)}%`}}/></div>}
          <div className="checklist-items">{form.checklist.map(c=><div className="checklist-item" key={c.id}><input type="checkbox" aria-label={`Complete ${c.text}`} checked={c.done} onChange={e=>change('checklist',form.checklist.map(item=>item.id===c.id?{...item,done:e.target.checked}:item))}/><span className={c.done?'line-through':''}>{c.text}</span><button type="button" className="icon-btn icon-btn-small" aria-label={`Remove ${c.text}`} onClick={()=>change('checklist',form.checklist.filter(item=>item.id!==c.id))}><X size={14}/></button></div>)}</div>
          <div className="checklist-add"><input aria-label="New checklist item" placeholder="Add checklist item..." value={checkText} maxLength={160} onChange={e=>setCheckText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addCheck(e)}}}/><button type="button" className="btn btn-quiet btn-small" disabled={!checkText.trim()} onClick={addCheck}><Plus size={15}/> Add</button></div></section>
          {task&&<section className="task-comments"><div className="section-heading-row"><h3><MessageSquareText size={17}/> Discussion</h3><span className="muted-small">{task.comments.length} comments</span></div>
            <div className="comment-feed">{task.comments.length?task.comments.map(item=>{const author=data.users.find(u=>u.id===item.userId);return <div className="comment" key={item.id}><Avatar user={author} size="sm"/><div className="comment-body"><div className="comment-by"><strong>{author?.name||'Team member'}</strong><time>{relativeTime(item.createdAt)}</time></div><p>{item.body}</p></div></div>}):<p className="muted-small comment-empty">No comments yet. Start the conversation.</p>}</div>
            <div className="comment-compose"><Avatar user={currentUser} size="sm"/><textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={3000} rows={2} placeholder="Write a comment..." aria-label="Write a comment"/><button type="button" onClick={submitComment} className="btn btn-primary btn-small" disabled={!comment.trim()}><Send size={14}/> Post</button></div>
          </section>}
        </div>
        <aside className="task-form-aside">
          <label className="field"><span>Project</span><select value={form.projectId} onChange={e=>{change('projectId',e.target.value);change('assigneeIds',[]);}} disabled={!!task}>{data.projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={e=>change('status',e.target.value)}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
          <label className="field"><span>Priority</span><select value={form.priority} onChange={e=>change('priority',e.target.value)}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
          <label className="field"><span>Due date</span><input type="date" value={form.dueDate} onChange={e=>change('dueDate',e.target.value)} aria-label="Task due date"/></label>
          <label className="field"><span>Label</span><select value={form.tag} onChange={e=>change('tag',e.target.value)}><option value="">No label</option>{TAGS.map(tag=><option key={tag}>{tag}</option>)}</select></label>
          <div className="field"><span>Assignees</span><div className="task-assignees">{members.map(user=><label key={user.id} className="assignee-row"><input type="checkbox" checked={form.assigneeIds.includes(user.id)} onChange={e=>change('assigneeIds',e.target.checked?[...form.assigneeIds,user.id]:form.assigneeIds.filter(id=>id!==user.id))}/><Avatar user={user} size="xs"/><span>{user.name}</span></label>)}{!members.length&&<span className="muted-small">Add team members to this project first.</span>}</div></div>
          {task&&<div className="task-meta-date"><CalendarDays size={14}/> Created {new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(new Date(task.createdAt))}</div>}
        </aside>
      </form>
      </div>
      {error&&<div className="form-error task-dialog-error" role="alert">{error}</div>}
      <div className="task-dialog-actions">{task&&<button type="button" className="btn btn-text-danger" onClick={()=>setConfirmDelete(true)}><Trash2 size={16}/> Delete task</button>}<div className="dialog-action-right"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="submit" form="task-editor-form" className="btn btn-primary"><Check size={16}/>{task?'Save changes':'Create task'}</button></div></div>
    </div>
    {confirmDelete&&<ConfirmDialog title="Delete this task?" description="Its checklist and comments will also be removed from this demo workspace." onCancel={()=>setConfirmDelete(false)} onConfirm={()=>{deleteTask(task.id);setConfirmDelete(false);onClose()}}/>}
  </div>;
}
