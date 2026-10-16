import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {createActivityEngine, replayActivity, validateActivityEvent, EVENT_STATES} from '@talarurus/pibulo/activity';
import {AgentAvatar} from '@talarurus/pibulo/activity/react';
import {AgentScene} from '@talarurus/pibulo/scenes';
import {identity} from '@talarurus/pibulo';
const agents = [{id:'Atlas',name:'Atlas'}, {id:'atlas',name:'Other'}];
const event = (type,sequence,extra={}) => ({version:1,agentId:'Atlas',sequence,timestamp:sequence,taskId:'task-1',type,...extra});
test('all lifecycle states, input resolution, terminal states and reset have explicit mappings',()=>{
 const engine=createActivityEngine({agents});
 for(const [index,type] of ['task.started','task.working','task.waiting','task.input-required','task.input-resolved','task.completed','agent.reset','task.started','task.failed','agent.reset'].entries()){
  const e=event(type,index+1,type==='agent.reset'?{}:index>=7?{taskId:'task-2'}:{});if(type==='agent.reset')delete e.taskId;
  const result=engine.dispatch(e);assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.snapshot.state,EVENT_STATES[type]);
 }
 assert.equal(engine.getAgent('Atlas').taskId,null);
 assert.deepEqual(engine.getAgent('atlas'),createActivityEngine({agents}).getAgent('atlas'));
});
test('stale ordering, duplicates, wrong tasks and illegal transitions cannot change history or state',()=>{
 const engine=createActivityEngine({agents});assert.equal(engine.dispatch(event('task.started',3)).ok,true);
 const before=engine.getAgent('Atlas'),history=engine.getHistory();
 for(const [e,code] of [[event('task.working',2),'stale-event'],[event('task.started',3),'stale-event'],[event('task.working',4,{timestamp:2}),'stale-event'],[event('task.completed',4,{taskId:'old'}),'task-mismatch'],[event('task.input-resolved',4),'invalid-transition'],[event('task.started',4),'invalid-transition'],[event('task.started',4,{agentId:'missing'}),'unknown-agent']]){
  assert.equal(engine.dispatch(e).code,code);assert.equal(engine.getAgent('Atlas'),before);assert.equal(engine.getHistory(),history);
 }
 assert.equal(engine.dispatch(event('task.completed',4)).ok,true);
 assert.equal(engine.dispatch(event('task.working',5)).code,'invalid-transition');
 assert.equal(engine.dispatch(event('task.started',5)).code,'task-mismatch');
 assert.equal(engine.dispatch(event('task.started',6,{taskId:'task-2'})).ok,true);
 assert.equal(engine.dispatch(event('task.failed',7)).code,'task-mismatch');
});
test('untrusted events reject invalid versions, types, fields, strings and numbers predictably',()=>{
 const valid=event('task.started',1);
 for(const input of [null,[],false,'event',{}, {...valid,version:2},{...valid,type:'toString'},{...valid,extra:true},{...valid,sequence:NaN},{...valid,sequence:Infinity},{...valid,sequence:0},{...valid,sequence:1.5},{...valid,timestamp:-1},{...valid,taskId:''},{...valid,agentId:'x'.repeat(129)},{...valid,message:'x'.repeat(513)},{...valid,message:'\u0000'},{...valid,agentId:'\ud800'},{...valid,type:'agent.reset'},new Proxy({},{get(){throw Error('bad')}})]) assert.equal(validateActivityEvent(input).ok,false);
 assert.equal(validateActivityEvent({...valid,message:'<script>plain text</script>'}).ok,true);
 assert.equal(validateActivityEvent({version:1,agentId:'Atlas',type:'agent.reset',sequence:1,timestamp:0}).ok,true);
 let accessed=false;const accessor={...valid};Object.defineProperty(accessor,'message',{get(){accessed=true;return 'unsafe'}});
 assert.equal(validateActivityEvent(accessor).ok,false);assert.equal(accessed,false);
 assert.equal(validateActivityEvent(new Date()).ok,false);
});
test('history is bounded, immutable and detached from callers; resets preserve sequence ordering',()=>{
 for(const historyLimit of [1,2,5]){
  const engine=createActivityEngine({agents,historyLimit});const input=event('task.started',1);engine.dispatch(input);input.message='mutated';assert.equal(engine.getHistory()[0].message,undefined);
  for(let sequence=2;sequence<12;sequence++)engine.dispatch(event('task.working',sequence));
  assert.equal(engine.getHistory().length,historyLimit);assert.equal(engine.getHistory().at(-1).sequence,11);
  assert.throws(()=>{engine.getAgent('Atlas').state='error'},TypeError);assert.throws(()=>engine.getHistory().push(input),TypeError);
  engine.dispatch({version:1,agentId:'Atlas',type:'agent.reset',sequence:12,timestamp:12});assert.equal(engine.dispatch(event('task.started',11)).code,'stale-event');
 }
 for(const historyLimit of [0,-1,Infinity,10001,1.5])assert.throws(()=>createActivityEngine({agents,historyLimit}),RangeError);
 assert.throws(()=>createActivityEngine({agents:[...agents,agents[0]]}),TypeError);
});
test('replay reproduces multiple independent agents and rejected events without wall-clock input',()=>{
 const events=[event('task.started',1),event('task.working',2),event('task.started',1,{agentId:'atlas',taskId:'other'}),event('task.input-required',3),event('task.completed',4,{agentId:'atlas',taskId:'other'}),event('task.working',2),event('task.input-resolved',4),event('task.completed',5)];
 const one=replayActivity({agents,historyLimit:3},events),two=replayActivity({agents,historyLimit:3},events);
 assert.deepEqual(one.engine.getAgents(),two.engine.getAgents());assert.deepEqual(one.results,two.results);assert.deepEqual(one.engine.getHistory(),two.engine.getHistory());
 assert.equal(one.engine.getAgent('Atlas').state,'completed');assert.equal(one.engine.getAgent('atlas').state,'completed');
 const a=one.engine.getAgent('Atlas'),b=one.engine.getAgent('atlas');assert.notDeepEqual(identity({name:a.seed,normalization:'raw'}).traits,identity({name:b.seed,normalization:'raw'}).traits);
});
test('subscriptions publish accepted snapshots, isolate failures, and unsubscribe',()=>{
 const engine=createActivityEngine({agents});let calls=0;
 engine.subscribe(()=>{throw Error('consumer failure')});const stop=engine.subscribe(()=>calls++);
 let reentrant;
 engine.subscribe(()=>{reentrant=engine.dispatch(event('task.working',9));});
 assert.equal(engine.dispatch(event('task.started',1)).ok,true);assert.equal(reentrant.code,'invalid-transition');assert.equal(calls,1);engine.dispatch(event('task.started',1));assert.equal(calls,1);stop();stop();engine.dispatch(event('task.working',2));assert.equal(calls,1);
});
test('React avatar and optional scene have deterministic SSR and accessible status text',()=>{
 const engine=createActivityEngine({agents});engine.dispatch(event('task.started',1));
 for(const Component of [AgentAvatar,AgentScene]){
  const render=()=>renderToStaticMarkup(createElement(Component,{engine,agentId:'Atlas'}));const html=render();assert.equal(render(),html);assert.match(html,/role="status"/);assert.match(html,/Atlas · Thinking/);assert.match(html,/data-agent-state="thinking"/);
 }
 assert.throws(()=>renderToStaticMarkup(createElement(AgentAvatar,{engine,agentId:'unknown'})),RangeError);
});
test('ordinary SVG and React activity imports exclude optional scene code; engine excludes renderer and React',async()=>{
 for(const entry of ['src/index.mjs','src/activity-react.tsx','src/activity.ts']){
  const result=await build({entryPoints:[entry],bundle:true,format:'esm',write:false,metafile:true,external:['react']});
  const inputs=Object.keys(result.metafile.inputs);assert.ok(inputs.every(input=>!input.includes('blobatarling-scene')));
  if(entry==='src/activity.ts')assert.deepEqual(inputs,['src/activity.ts']);
 }
});
