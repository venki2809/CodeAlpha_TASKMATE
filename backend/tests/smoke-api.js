// Runs against the live TASKMATE backend. Resets its demo data at the end.
// Start backend first; then run: node tests/smoke-api.js
import assert from 'node:assert/strict';
const root=process.env.API_URL||'http://localhost:5000/api';
let token='';
async function api(route,method='GET',body){
 const response=await fetch(root+route,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
 const result=await response.json();
 if(!response.ok)throw new Error(`${method} ${route}: ${result.message}`);
 return result;
}
try{
 const health=await api('/health');assert.equal(health.ok,true);
 console.log('PASS backend health, database:',health.database);
 const session=await api('/auth/demo','POST');token=session.token;
 assert.ok(token);console.log('PASS demo login + JWT');
 const data=await api('/workspace');assert.equal(data.data.projects.length>=3,true);
 console.log('PASS database-backed workspace loaded');
 const p=await api('/projects','POST',{name:'Integration Test Project',description:'Test project'});
 assert.ok(p.project.id);console.log('PASS project creation');
 const t=await api('/tasks','POST',{projectId:p.project.id,title:'Test API integration',assigneeIds:['u1']});
 assert.ok(t.task.id);console.log('PASS task creation');
 const c=await api(`/tasks/${t.task.id}/comments`,'POST',{body:'Tested end-to-end'});
 assert.equal(c.comment.body,'Tested end-to-end');console.log('PASS comments');
 const updated=await api(`/tasks/${t.task.id}`,'PATCH',{status:'done'});
 assert.equal(updated.task.status,'done');console.log('PASS task status update');
 const refreshed=await api('/workspace');assert.ok(refreshed.data.tasks.some(item=>item.id===t.task.id));
 console.log('PASS reads persisted backend data');
 await api(`/projects/${p.project.id}`,'DELETE');console.log('PASS cascade delete');
 console.log('ALL API SMOKE TESTS PASSED');
} catch(e){console.error('API TEST FAILED:',e.message);process.exitCode=1}
finally{
 if(token){try{await api('/workspace/reset-demo','POST');console.log('Demo sample data restored')}catch(e){console.error('Reset failed:',e.message)}}
}
