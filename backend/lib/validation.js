const text = (value, limit=200) => String(value ?? '').trim().slice(0, limit);
const id = value => /^[a-zA-Z0-9_-]{1,110}$/.test(String(value ?? '')) ? String(value) : '';
const email = value => text(value,130).toLowerCase();
const mailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const color = (value,fallback='#5979e9') => /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : fallback;
const date = value => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
const timestamp = value => !Number.isNaN(Date.parse(value || '')) ? new Date(value).toISOString() : new Date().toISOString();
const unique = list => [...new Set(list)];
const idArray = (items, max=100) => unique((Array.isArray(items)?items:[]).slice(0,max).map(id).filter(Boolean));
const valid = (value,options,fallback) => options.includes(value) ? value : fallback;
const ensureDistinct = (array,field) => {
 const seen = new Set();
 for (const item of array) { if (!item[field] || seen.has(item[field])) throw new Error(`Duplicate or invalid ${field}.`); seen.add(item[field]); }
};

export function normalizeWorkspace(input, previous={users:[]}, actor=null) {
  if (!input || typeof input !== 'object') throw new Error('Workspace data is required.');
  const specs={users:200,projects:200,tasks:1500,activity:4000,notifications:4000};
  for(const [field,max] of Object.entries(specs)) {
    if (!Array.isArray(input[field]) || input[field].length>max) throw new Error(`Invalid ${field} list (maximum ${max}).`);
  }
  const prior = new Map((previous.users||[]).map(user=>[user.id,user]));
  const users=input.users.map((u,index)=>({
    id:id(u.id),name:text(u.name,70),email:email(u.email),
    // Roles and credential hashes are authoritative on the server.
    role:prior.get(u.id)?.role||(actor?.role==='Admin'&&u.role==='Admin'?'Admin':'Member'), title:text(u.title,90)||'Team Member',
    color:color(u.color,'#dbe8f6'),passwordHash:prior.get(u.id)?.passwordHash||null,
    order:index
  }));
  for (const u of users) if (!u.name || !mailPattern.test(u.email)) throw new Error('Invalid team member details.');
  ensureDistinct(users,'id');ensureDistinct(users,'email');
  const userIds=new Set(users.map(u=>u.id));
  const projects=input.projects.map((p,index)=>({
    id:id(p.id),name:text(p.name,80),key:text(p.key,15),description:text(p.description,400),
    color:color(p.color),status:valid(p.status,['active','completed'],'active'),
    ownerId:id(p.ownerId),memberIds:idArray(p.memberIds).filter(x=>userIds.has(x)),createdAt:timestamp(p.createdAt),order:index
  }));
  ensureDistinct(projects,'id');
  for(const p of projects){
    if(!p.name || !userIds.has(p.ownerId)) throw new Error('Project needs a valid name and owner.');
    p.memberIds=unique([p.ownerId,...p.memberIds]);
  }
  const projectMap=new Map(projects.map(p=>[p.id,p]));
  const tasks=input.tasks.map((t,index)=>({
    id:id(t.id),projectId:id(t.projectId),title:text(t.title,160),
    description:text(t.description,4000),status:valid(t.status,['todo','progress','review','done'],'todo'),
    priority:valid(t.priority,['low','medium','high','urgent'],'medium'),
    assigneeIds:idArray(t.assigneeIds).filter(uid=>projectMap.get(t.projectId)?.memberIds.includes(uid)),
    dueDate:date(t.dueDate),tag:text(t.tag,40),
    checklist:(Array.isArray(t.checklist)?t.checklist:[]).slice(0,80).map((c,i)=>({id:id(c.id)||`check${i}`,text:text(c.text,160),done:!!c.done})).filter(c=>c.text),
    comments:(Array.isArray(t.comments)?t.comments:[]).slice(0,250).map((c,i)=>({id:id(c.id)||`comment${i}`,userId:id(c.userId),body:text(c.body,3000),createdAt:timestamp(c.createdAt)})).filter(c=>c.body&&userIds.has(c.userId)),
    createdBy:id(t.createdBy),createdAt:timestamp(t.createdAt),updatedAt:timestamp(t.updatedAt),order:index
  }));
  ensureDistinct(tasks,'id');
  for(const t of tasks) if (!t.title || !projectMap.has(t.projectId)) throw new Error('Task needs a valid title and project.');
  const activity=input.activity.map((a,i)=>({id:id(a.id),actorId:id(a.actorId),projectId:id(a.projectId),taskId:id(a.taskId),type:text(a.type,30),message:text(a.message,400),createdAt:timestamp(a.createdAt),order:i})).filter(a=>a.id&&a.message);
  const notifications=input.notifications.map((n,i)=>({id:id(n.id),userId:id(n.userId),read:!!n.read,message:text(n.message,300),path:text(n.path,250),createdAt:timestamp(n.createdAt),order:i})).filter(n=>n.id&&userIds.has(n.userId));
  ensureDistinct(activity,'id');ensureDistinct(notifications,'id');
  const workspace={name:text(input.workspace?.name,80)||'Studio North',description:text(input.workspace?.description,200),createdAt:timestamp(input.workspace?.createdAt)};
  return {workspace,users,projects,tasks,activity,notifications};
}

export function publicData(data) {
  const clear = items => items.map(item=>{const { _id, passwordHash, order, ...rest}=item;return rest});
  return {workspace:data.workspace, users:clear(data.users),projects:clear(data.projects),tasks:clear(data.tasks),activity:clear(data.activity),notifications:clear(data.notifications)};
}
export const validEmail = value => mailPattern.test(email(value));
export const cleanText=text;
