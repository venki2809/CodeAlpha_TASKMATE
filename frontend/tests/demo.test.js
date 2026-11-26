import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../src/data/seed.js';
import { STATUSES, PRIORITIES, addDays, dateLabel, isOverdue, projectProgress, formatProjectKey, taskCounts, safeText, initials } from '../src/utils/helpers.js';

test('demo contains three full projects with team members', () => {
  const data = initialData();
  assert.equal(data.projects.length, 3);
  assert.ok(data.users.length >= 5);
  assert.ok(data.projects.every(p => p.memberIds.length > 0 && p.ownerId));
});

test('seeded tasks have valid projects, statuses, assignees, and dates', () => {
  const data = initialData();
  assert.equal(data.tasks.length, 16);
  assert.equal(new Set(data.tasks.map(t => t.id)).size, data.tasks.length);
  assert.ok(data.tasks.every(t => data.projects.some(p => p.id === t.projectId)));
  assert.ok(data.tasks.every(t => STATUSES.some(s => s.id === t.status)));
  assert.ok(data.tasks.every(t => PRIORITIES.some(p => p.id === t.priority)));
  assert.ok(data.tasks.every(t => t.assigneeIds.every(id => data.users.some(u => u.id === id))));
  assert.ok(data.tasks.every(t => !t.dueDate || /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)));
});

test('progress and status counts stay consistent', () => {
  const data = initialData();
  for (const p of data.projects) {
    const tasks = data.tasks.filter(t => t.projectId === p.id);
    const completed = tasks.filter(t => t.status === 'done').length;
    assert.equal(projectProgress(data.tasks, p.id), Math.round(completed / tasks.length * 100));
  }
  const counts = taskCounts(data.tasks);
  assert.equal(Object.values(counts).reduce((sum, n) => sum + n, 0), data.tasks.length);
});

test('overdue detection excludes completed tasks', () => {
  assert.equal(isOverdue({dueDate:addDays(-2),status:'todo'}), true);
  assert.equal(isOverdue({dueDate:addDays(-2),status:'done'}), false);
  assert.equal(isOverdue({dueDate:addDays(2),status:'progress'}), false);
});

test('formatted text helpers behave for realistic inputs', () => {
  assert.equal(formatProjectKey('Mobile App Launch'), 'MAL');
  assert.equal(initials('Aarav Shah'), 'AS');
  assert.equal(safeText('   Demo task   ', 30), 'Demo task');
  assert.ok(dateLabel(addDays(0)).length >= 3);
});

test('notifications and activity reference valid members and tasks', () => {
  const d = initialData();
  assert.ok(d.notifications.every(n => d.users.some(u => u.id === n.userId)));
  assert.ok(d.activity.every(a => d.users.some(u => u.id === a.actorId)));
  assert.ok(d.tasks.some(t => t.comments.length > 0));
  assert.ok(d.tasks.some(t => t.checklist.length > 0));
});
