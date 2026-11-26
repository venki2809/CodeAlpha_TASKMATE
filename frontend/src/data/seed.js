import { addDays } from '../utils/helpers.js';

const at = (daysAgo = 0, hour = 10) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 18, 0, 0); return d.toISOString(); };
const task = (id, projectId, title, status, priority, assigneeIds, dueOffset, tag, description, daysAgo = 3) => ({
  id, projectId, title, status, priority, assigneeIds, dueDate: dueOffset === null ? '' : addDays(dueOffset),
  tag, description, createdBy: 'u1', createdAt: at(daysAgo), updatedAt: at(Math.max(0, daysAgo - 1)),
  checklist: [], comments: [],
});

export function initialData() {
  return {
    workspace: { name: 'Studio North', description: 'A place for good work.', createdAt: at(21) },
    users: [
      { id: 'u1', name: 'Aarav Shah', email: 'demo@taskmate.test', role: 'Admin', title: 'Product Lead', color: '#d5e7ff' },
      { id: 'u2', name: 'Meera Iyer', email: 'meera@studionorth.test', role: 'Member', title: 'UI Designer', color: '#f4dbce' },
      { id: 'u3', name: 'Daniel Wong', email: 'daniel@studionorth.test', role: 'Member', title: 'Frontend Engineer', color: '#dedaf8' },
      { id: 'u4', name: 'Priya Nair', email: 'priya@studionorth.test', role: 'Member', title: 'Content Strategist', color: '#d9eedc' },
      { id: 'u5', name: 'Rohan Patel', email: 'rohan@studionorth.test', role: 'Member', title: 'Marketing Lead', color: '#f7e6b9' },
    ],
    projects: [
      { id: 'p1', name: 'Website Redesign', key: 'WEB', description: 'Refresh the company website with a clear, modern experience.', color: '#5979e9', status: 'active', ownerId: 'u1', memberIds: ['u1', 'u2', 'u3', 'u4'], createdAt: at(20) },
      { id: 'p2', name: 'Mobile App Launch', key: 'APP', description: 'Prepare our mobile app for its first public release.', color: '#e79c62', status: 'active', ownerId: 'u1', memberIds: ['u1', 'u2', 'u3', 'u5'], createdAt: at(14) },
      { id: 'p3', name: 'Brand Refresh', key: 'BRD', description: 'A more distinctive visual identity and brand voice.', color: '#2ca98b', status: 'active', ownerId: 'u2', memberIds: ['u1', 'u2', 'u4', 'u5'], createdAt: at(10) },
    ],
    tasks: [
      task('t1','p1','Audit existing page layouts','done','medium',['u1','u2'],-8,'Research','Review all current pages and document issues.',18),
      task('t2','p1','Design homepage wireframes','done','high',['u2'],-3,'Design','Create wireframes for the updated homepage.',12),
      task('t3','p1','Build responsive navigation','progress','high',['u3','u1'],2,'Development','Implement desktop and mobile navigation with accessible interactions.',7),
      task('t4','p1','Review product photography','review','medium',['u2','u4'],1,'Content','Select a consistent visual direction for the site.',5),
      task('t5','p1','Write About page content','todo','low',['u4'],5,'Content','Draft a concise About page for the updated site.',3),
      task('t6','p1','QA checkout experience','todo','urgent',['u1','u3'],-1,'QA','Test the entire checkout flow and capture issues.',4),
      task('t7','p2','Define onboarding flow','done','high',['u1','u2'],-4,'Product','Document steps for new mobile app users.',13),
      task('t8','p2','Build account settings UI','progress','medium',['u3'],3,'Development','Create editable settings views and validation.',7),
      task('t9','p2','Prepare App Store screenshots','todo','medium',['u2','u5'],6,'Marketing','Create polished screenshots in the required sizes.',4),
      task('t10','p2','Write release announcement','todo','high',['u5','u4'],4,'Marketing','Draft launch announcement and email copy.',2),
      task('t11','p2','Test push notifications','review','high',['u1','u3'],0,'QA','Verify opt-in, opt-out and delivery behavior.',4),
      task('t12','p3','Collect visual references','done','low',['u2'],-5,'Research','Create a moodboard of relevant brand references.',9),
      task('t13','p3','Explore new wordmark directions','progress','high',['u2'],2,'Design','Present three type-led logo directions for review.',5),
      task('t14','p3','Create color and typography guide','review','medium',['u2','u4'],3,'Design','Document palette, typography and use cases.',3),
      task('t15','p3','Update social media templates','todo','medium',['u5'],7,'Marketing','Refresh templates for key social channels.',2),
      task('t16','p3','Draft brand voice guidelines','todo','low',['u4'],null,'Content','Define the tone and writing examples.',2),
    ].map(item => item.id === 't3' ? { ...item, checklist: [ {id:'c1', text:'Desktop navigation', done:true}, {id:'c2', text:'Mobile menu', done:false}, {id:'c3', text:'Keyboard navigation', done:false} ] } : item.id === 't13' ? { ...item, comments: [{id:'cm1',userId:'u1',body:'Love the direction so far. Please include a monochrome version.',createdAt:at(1)}] } : item),
    activity: [
      { id: 'a1', actorId:'u2', projectId:'p3', taskId:'t14', type:'status', message:'moved “Create color and typography guide” to In review', createdAt:at(0,9) },
      { id: 'a2', actorId:'u3', projectId:'p1', taskId:'t3', type:'status', message:'started work on “Build responsive navigation”', createdAt:at(0,8) },
      { id: 'a3', actorId:'u1', projectId:'p3', taskId:'t13', type:'comment', message:'commented on “Explore new wordmark directions”', createdAt:at(1,17) },
      { id: 'a4', actorId:'u4', projectId:'p1', taskId:'t4', type:'status', message:'submitted “Review product photography” for review', createdAt:at(1,14) },
      { id: 'a5', actorId:'u2', projectId:'p1', taskId:'t2', type:'status', message:'completed “Design homepage wireframes”', createdAt:at(3) },
    ],
    notifications: [
      {id:'n1', userId:'u1', read:false, message:'You have a QA task that is overdue.', path:'/projects/p1?task=t6', createdAt:at(0,9)},
      {id:'n2', userId:'u1', read:false, message:'Meera moved a task to In review.', path:'/projects/p3?task=t14', createdAt:at(0,8)},
      {id:'n3', userId:'u1', read:true, message:'Mobile App Launch is making progress.', path:'/projects/p2', createdAt:at(2)},
    ],
  };
}
