import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Bell, ChevronDown, ChevronRight, CircleHelp, Command, FolderKanban, Home, LogOut, Menu, Plus, Search, Settings2, UserRound, UsersRound, X, CheckCheck, ListTodo } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import Avatar from './Avatar';
import TaskModal from './TaskModal';
import { relativeTime } from '../utils/helpers';

const NAV=[{to:'/dashboard',label:'Overview',icon:Home},{to:'/my-tasks',label:'My tasks',icon:ListTodo},{to:'/projects',label:'All projects',icon:FolderKanban},{to:'/team',label:'Team members',icon:UsersRound},{to:'/activity',label:'Activity',icon:Activity}];

function Sidebar({onNavigate}){
 const {data,currentUser}=useWorkspace();
 const navigate=useNavigate();
 return <div className="sidebar-inner">
  <button className="brand" onClick={()=>{navigate('/dashboard');onNavigate()}} type="button" aria-label="Taskmate home"><span className="brand-symbol"><i/><i/><i/><i/></span><span>taskmate<span className="brand-period">.</span></span></button>
  <button type="button" className="workspace-switch" title="Open workspace settings" onClick={()=>{navigate('/settings');onNavigate()}}><span className="workspace-avatar">{data.workspace.name[0]?.toUpperCase()||'W'}</span><div className="workspace-name"><strong>{data.workspace.name}</strong><small>Demo workspace</small></div><ChevronDown size={16} className="light-icon"/></button>
  <div className="side-section-label">WORKSPACE</div>
  <nav className="side-nav" aria-label="Main navigation">{NAV.map(({to,label,icon:Icon})=><NavLink key={to} to={to} onClick={onNavigate} end={to==='/dashboard'||to==='/projects'} className={({isActive})=>`nav-item ${isActive?'active':''}`}><Icon size={18} strokeWidth={1.8}/><span>{label}</span></NavLink>)}</nav>
  <div className="side-section-title"><span>YOUR PROJECTS</span><button className="icon-btn icon-btn-small" aria-label="View all projects" title="View all projects" type="button" onClick={()=>{navigate('/projects');onNavigate()}}><Plus size={16}/></button></div>
  <nav className="sidebar-projects" aria-label="Project shortcuts">{data.projects.slice(0,6).map(project=><NavLink to={`/projects/${project.id}`} onClick={onNavigate} key={project.id} className={({isActive})=>`project-side-item ${isActive?'selected':''}`}><span className="project-square" style={{background:project.color}}/><span className="truncate">{project.name}</span></NavLink>)}</nav>
  <div className="sidebar-bottom"><NavLink onClick={onNavigate} to="/settings" className={({isActive})=>`nav-item ${isActive?'active':''}`}><Settings2 size={18}/><span>Settings</span></NavLink><div className="sidebar-profile"><Avatar user={currentUser} size="md"/><div><strong>{currentUser?.name}</strong><small>{currentUser?.role} · Demo mode</small></div></div></div>
 </div>;
}

function DemoUserSwitcher({onClose}) {
 const {data,currentUser,switchUser}=useWorkspace();const navigate=useNavigate();
 return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="dialog switcher-dialog" role="dialog" aria-modal="true" aria-labelledby="switcher-title" onMouseDown={e=>e.stopPropagation()}>
 <div className="dialog-header"><div><div className="eyebrow">TEAM COLLABORATION / DEMO</div><h2 id="switcher-title">Switch demo member</h2></div><button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={20}/></button></div>
 <p className="switcher-caption">Preview the tasks and notifications assigned to each teammate. This switches browser demo personas, not real accounts.</p>
 <div className="switcher-list">{data.users.map(user=><button type="button" key={user.id} className="switcher-member" disabled={user.id===currentUser.id} onClick={()=>{switchUser(user.id);onClose();navigate('/dashboard')}}><Avatar user={user} size="md"/><span className="switcher-member-details"><strong>{user.name}</strong><small>{user.title}</small></span>{user.id===currentUser.id?<span className="role-pill">Current</span>:<ArrowRight size={16}/>}</button>)}</div>
 </div></div>
}

function SearchPanel({onClose}){
 const [query,setQuery]=useState('');
 const {data}=useWorkspace();const navigate=useNavigate();
 const text=query.trim().toLowerCase();
 const projects=data.projects.filter(p=>p.name.toLowerCase().includes(text)).slice(0,5);
 const tasks=data.tasks.filter(t=>t.title.toLowerCase().includes(text)||t.description.toLowerCase().includes(text)).slice(0,8);
 function go(path){navigate(path);onClose()}
 useEffect(()=>{const handler=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[onClose]);
 return <div className="search-backdrop" onMouseDown={onClose} role="presentation"><div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search tasks and projects" onMouseDown={e=>e.stopPropagation()}>
  <div className="search-input-wrap"><Search size={20}/><input autoFocus aria-label="Search tasks and projects" placeholder="Search projects, tasks..." value={query} onChange={e=>setQuery(e.target.value)}/><button type="button" className="kbd-key" onClick={onClose}>ESC</button></div>
  {text?<div className="search-results">
    {!!projects.length&&<><div className="search-group-title">PROJECTS</div>{projects.map(p=><button key={p.id} type="button" className="search-result" onClick={()=>go(`/projects/${p.id}`)}><span className="project-square" style={{background:p.color}}/>{p.name}<ArrowRight size={15}/></button>)}</>}
    {!!tasks.length&&<><div className="search-group-title">TASKS</div>{tasks.map(t=><button key={t.id} type="button" className="search-result" onClick={()=>go(`/projects/${t.projectId}?task=${t.id}`)}><ListTodo size={17}/><span>{t.title}</span><ArrowRight size={15}/></button>)}</>}
    {!projects.length&&!tasks.length&&<div className="search-no-results">No matches for “{query}”. Try another search.</div>}
  </div>:<div className="search-hint"><Command size={18}/> Start typing to find tasks and projects.</div>}
 </div></div>;
}

export default function AppShell(){
 const {data,currentUser,logout,readNotification,readAllNotifications}=useWorkspace();
 const location=useLocation();const navigate=useNavigate();
 const [mobileOpen,setMobileOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false),[notifOpen,setNotifOpen]=useState(false),[userOpen,setUserOpen]=useState(false),[newTaskOpen,setNewTaskOpen]=useState(false),[switcherOpen,setSwitcherOpen]=useState(false);
 const notifications=useMemo(()=>data.notifications.filter(n=>n.userId===currentUser.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),[data.notifications,currentUser.id]);
 const unread=notifications.filter(n=>!n.read).length;
 const projectId=location.pathname.match(/^\/projects\/([^/]+)$/)?.[1]||'';
 const project=data.projects.find(p=>p.id===projectId);
 const mainPage=location.pathname.split('/')[1];
 const title=project?project.name:({'dashboard':'Overview','projects':'Projects','my-tasks':'My tasks','team':'Team members','activity':'Activity','settings':'Settings'})[mainPage]||'Workspace';
 useEffect(()=>{setMobileOpen(false);setNotifOpen(false);setUserOpen(false)},[location.pathname]);
 useEffect(()=>{const onKey=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(v=>!v)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 return <div className="app-frame">
   <aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}><Sidebar onNavigate={()=>setMobileOpen(false)}/></aside>
   {mobileOpen&&<button type="button" className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
   <div className="main-column"><header className="topbar">
     <div className="topbar-left"><button className="icon-btn mobile-menu-btn" aria-label="Open menu" type="button" onClick={()=>setMobileOpen(true)}><Menu size={22}/></button><div className="top-crumb"><span>Workspace</span><ChevronRight size={14}/><strong>{title}</strong></div></div>
     <div className="topbar-right"><button type="button" className="header-search" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>Search anything</span><kbd>Ctrl K</kbd></button>
     <button type="button" className="btn btn-primary new-task-header" onClick={()=>setNewTaskOpen(true)}><Plus size={16}/> New task</button>
     <div className="popover-root"><button type="button" className={`icon-btn header-icon ${notifOpen?'pressed':''}`} aria-label="Notifications" aria-expanded={notifOpen} onClick={()=>{setNotifOpen(v=>!v);setUserOpen(false)}}><Bell size={19}/>{unread>0&&<span className="notification-dot"/>}</button>
       {notifOpen&&<div className="popover notification-popover"><div className="popover-heading"><strong>Notifications {unread>0&&<span className="tiny-count">{unread}</span>}</strong><button type="button" className="text-button" disabled={unread===0} onClick={readAllNotifications}><CheckCheck size={15}/> Mark all read</button></div><div className="notification-list">{notifications.length?notifications.map(n=><button key={n.id} type="button" className={`notification-entry ${!n.read?'unread':''}`} onClick={()=>{readNotification(n.id);setNotifOpen(false);navigate(n.path)}}><span className="notif-marker"/><div><span>{n.message}</span><small>{relativeTime(n.createdAt)}</small></div></button>):<div className="popover-empty">You’re all caught up.</div>}</div></div>}
     </div>
     <div className="popover-root"><button className="user-trigger" type="button" aria-label="Open account menu" aria-expanded={userOpen} onClick={()=>{setUserOpen(v=>!v);setNotifOpen(false)}}><Avatar user={currentUser} size="sm"/><ChevronDown size={15}/></button>
       {userOpen&&<div className="popover account-popover"><div className="account-popover-top"><strong>{currentUser.name}</strong><small>{currentUser.email}</small></div><button type="button" onClick={()=>{setUserOpen(false);navigate('/settings')}}><Settings2 size={16}/> Profile & settings</button><button type="button" onClick={()=>{setUserOpen(false);setSwitcherOpen(true)}}><UsersRound size={16}/> Switch demo member</button><button type="button" onClick={()=>{setUserOpen(false);logout();navigate('/login')}}><LogOut size={16}/> Sign out</button></div>}
     </div></div>
   </header>
   <main className="main-content"><Outlet/></main>
   </div>
   {searchOpen&&<SearchPanel onClose={()=>setSearchOpen(false)}/>}
   {switcherOpen&&<DemoUserSwitcher onClose={()=>setSwitcherOpen(false)}/>}
   {newTaskOpen&&<TaskModal projectId={projectId} onClose={()=>setNewTaskOpen(false)}/>}
 </div>;
}
