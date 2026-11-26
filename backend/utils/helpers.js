export const STATUSES = [
  { id: 'todo', label: 'To do', color: '#777d89' },
  { id: 'progress', label: 'In progress', color: '#3267d6' },
  { id: 'review', label: 'In review', color: '#9b6bc9' },
  { id: 'done', label: 'Done', color: '#23956b' },
];
export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];
export const TAGS = ['Design', 'Development', 'Product', 'Marketing', 'Research', 'Content', 'QA'];
export const PROJECT_COLORS = ['#5979e9', '#e79c62', '#2ca98b', '#9b80c9', '#d8738b', '#657e96'];

export const createId = (prefix = 'id') => `${prefix}_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`}`;
export const addDays = (offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const todayString = () => addDays(0);
export function dateLabel(value) {
  if (!value) return 'No due date';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}
export function longDate(value) {
  if (!value) return 'No date';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'No date';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}
export function relativeTime(value) {
  if (!value) return 'Just now';
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}
export function isOverdue(task) { return task.status !== 'done' && !!task.dueDate && task.dueDate < todayString(); }
export function projectProgress(tasks, projectId) {
  const related = tasks.filter(task => task.projectId === projectId);
  if (!related.length) return 0;
  return Math.round(related.filter(task => task.status === 'done').length / related.length * 100);
}
export function taskCounts(tasks) {
  return Object.fromEntries(STATUSES.map(status => [status.id, tasks.filter(task => task.status === status.id).length]));
}
export function initials(name = '') { return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?'; }
export function formatProjectKey(name = '') {
  const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  return (clean.split(/\s+/).slice(0, 3).map(word => word[0] || '').join('') || 'PRJ').toUpperCase();
}
export function safeText(value, max = 200) { return String(value ?? '').trim().slice(0, max); }
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
