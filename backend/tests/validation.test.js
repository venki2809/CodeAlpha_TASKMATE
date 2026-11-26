import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../data/seed.js';
import {normalizeWorkspace,publicData,validEmail} from '../lib/validation.js';
test('seed fixture passes backend validation',()=>{
 const source=initialData();const normalized=normalizeWorkspace(source,source);
 assert.equal(normalized.projects.length,3);assert.equal(normalized.tasks.length,16);
 assert.equal(normalized.users[0].email,'demo@taskmate.test');
});
test('rejects malformed task references',()=>{
 const source=initialData();source.tasks[0].projectId='missing';
 assert.throws(()=>normalizeWorkspace(source,source),/valid title and project/);
});
test('rejects duplicated IDs',()=>{
 const source=initialData();source.projects.push({...source.projects[0]});
 assert.throws(()=>normalizeWorkspace(source,source),/Duplicate/);
});
test('password hashes do not leak into read response',()=>{
 const source=initialData();source.users[0].passwordHash='secret';
 assert.equal(publicData(normalizeWorkspace(source,source)).users[0].passwordHash,undefined);
});
test('email validation',()=>{assert.ok(validEmail('a@example.com'));assert.ok(!validEmail('a@bad'))});
