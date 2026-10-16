import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {compileMotionRecording} from '@talarurus/pibulo/motion';
import {RecordedAgentAvatar} from '@talarurus/pibulo/motion/react';
import {serializeRecording} from '@talarurus/pibulo/recording';
import {svgFor} from '@talarurus/pibulo';
import {buildSync} from 'esbuild';
const code = buildSync({stdin:{contents:'export {contrast,fromHex} from "./website/preview/vendor/blobatar/src/color.ts"; export {_layout} from "./website/preview/vendor/blobatar/src/blobatar.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
const module = {exports:{}}; new Function('module','exports',code)(module,module.exports);
const {contrast,fromHex,_layout} = module.exports;
const event = (agentId, sequence, timestamp, type, taskId = 'task-1') => ({version:1,agentId,sequence,timestamp,type,...(type === 'agent.reset' ? {} : {taskId})});
const agents = [{id:'atlas',name:'Atlas'},{id:'mira',name:'Mira'}];
const events = [event('atlas',1,100,'task.started'),event('atlas',2,150,'task.working'),
  event('mira',1,50,'task.started'),event('atlas',3,200,'task.failed'),
  event('atlas',4,230,'task.started','task-2'),event('atlas',5,240,'task.completed','task-2')];
const encode = (events, roster=agents) => {const result = serializeRecording({agents:roster,events});assert.ok(result.ok);return result.json;};
const compile = (events, options={}, roster=agents) => {const result=compileMotionRecording(encode(events,roster),{originMs:0,...options});assert.ok(result.ok,result.error);return result.motion;};

test('immutable tracks preserve original order and reproduce seeks/replays and metadata ties',()=>{
  const motion=compile(events),times=[0,50,100,150,199,200,230,240,280,640,900];
  assert.deepEqual(motion.recording.events,events);
  const expected=times.map(time=>motion.svgFor('atlas',time));
  for(let replay=0;replay<3;replay++){
    const fresh=compile(events);
    for(const index of [10,0,4,8,1,7,3,9,6,2,5]) assert.equal(fresh.svgFor('atlas',times[index]),expected[index]);
  }
  for(const track of motion.tracks){assert.ok(Object.isFrozen(track.segments));for(const segment of track.segments){assert.ok(Object.isFrozen(segment));assert.ok(Object.isFrozen(segment.from.pose));}}
  assert.throws(()=>{motion.tracks[0].segments[0].from.pose.esx=99;},TypeError);
  const ties=compile([event('atlas',1,100,'task.started'),event('atlas',2,100,'task.completed')]);
  assert.equal(ties.sample('atlas',100).snapshot.state,'completed');
  assert.equal(ties.sample('mira',100).snapshot.state,'idle');
  assert.equal(ties.sample('atlas',99).snapshot.state,'idle');
});
test('interruptions and repeated state updates preserve the composite position and tint',()=>{
  for(let index=1;index<events.length;index++){
    const prefix=compile(events.slice(0,index)), full=compile(events.slice(0,index+1)), e=events[index];
    assert.deepEqual(full.sample(e.agentId,e.timestamp).pose,prefix.sample(e.agentId,e.timestamp).pose);
    assert.deepEqual(full.sample(e.agentId,e.timestamp).palette,prefix.sample(e.agentId,e.timestamp).palette);
  }
  const repeated=compile([event('atlas',1,100,'task.started'),event('atlas',2,150,'task.working'),event('atlas',3,180,'task.working')]);
  assert.deepEqual(repeated.sample('atlas',220).pose,compile([event('atlas',1,100,'task.started'),event('atlas',2,150,'task.working')]).sample('atlas',220).pose);
});
test('agent tracks isolate other agents, epoch origin is explicit, and settled frames retain native identity',()=>{
  const motion=compile(events),solo=compile(events.filter(e=>e.agentId==='atlas'),{},[agents[0]]);
  for(const time of [0,100,199,240,900])assert.equal(motion.svgFor('atlas',time),solo.svgFor('atlas',time));
  const shifted=compile(events.map(e=>({...e,timestamp:e.timestamp+1800000000000})),{originMs:1800000000000});
  assert.equal(shifted.svgFor('atlas',280),motion.svgFor('atlas',280));
  assert.equal(motion.svgFor('atlas',640),svgFor({name:'atlas',normalization:'raw',expression:'happy'},240,{label:'Atlas · completed'}));
  assert.equal(motion.svgFor('mira',450),svgFor({name:'mira',normalization:'raw',expression:'thinking'},240,{label:'Mira · thinking'}));
});
test('malformed and bounded input, options, accessor rejection and predictable sampling errors',()=>{
  for(const json of ['{','{}',JSON.stringify({...JSON.parse(encode(events)),version:9}),JSON.stringify({...JSON.parse(encode(events)),events:[events[1]]})])assert.equal(compileMotionRecording(json,{originMs:0}).ok,false);
  const json=encode(events);
  for(const options of [{originMs:101},{originMs:-1},{originMs:NaN},{originMs:0,policy:{transitionMs:0}},{originMs:0,policy:{expressions:{thinking:'wrong'}}},{originMs:0,extra:true}])assert.equal(compileMotionRecording(json,options).ok,false);
  let called=false; const getter={get originMs(){called=true;return 0;}};
  assert.equal(compileMotionRecording(json,getter).ok,false);assert.equal(called,false);
  assert.equal(compileMotionRecording(json,{originMs:0,limits:{maxEvents:2}}).code,'recording-limit');
  const motion=compile(events);
  for(const time of [-1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>motion.sample('atlas',time),RangeError);
  assert.throws(()=>motion.svgFor('atlas',0,{size:20}),RangeError);
  assert.throws(()=>motion.sample('missing',0),RangeError);
  assert.throws(()=>motion.sample('atlas',0,{reducedMotion:'yes'}),TypeError);
  const empty=compile([]);assert.equal(empty.durationMs,0);assert.equal(empty.svgFor('atlas',0),empty.svgFor('atlas',10000));
});
test('reduced-motion sampling settles the latest event and React SSR uses the same sampler',()=>{
  const motion=compile(events);
  assert.equal(motion.svgFor('atlas',100,{reducedMotion:true}),motion.svgFor('atlas',140,{reducedMotion:true}));
  for(const reducedMotion of [false,true]){
    const props={motion,agentId:'atlas',playbackMs:150,size:160,reducedMotion};
    const markup=renderToStaticMarkup(createElement(RecordedAgentAvatar,props));
    assert.ok(markup.includes(motion.svgFor('atlas',150,{size:160,reducedMotion,decorative:true})));
    assert.match(markup,/Executing task/);assert.match(markup,/Atlas · Working/);
  }
});
test('mid-transition palettes keep at least 4.5:1 over representative identities and all expression targets',()=>{
  const names=['idle','happy','sad','mad','surprised','wink','sleepy','smug','unsure','scared','love','shy','sick','thinking'];
  let count=0;
  for(let i=0;i<80;i++)for(const name of names){
    const id=`palette-${i}`,motion=compile([event(id,1,100,'task.started'),event(id,2,230,'task.completed')],{policy:{expressions:{thinking:name,completed:'mad'}}},[{id}]);
    for(const time of [100,125,150,180,220,230,250,300,350,400,500,630]){
      const {palette}=motion.sample(id,time);
      assert.ok(contrast(fromHex(palette.head),fromHex(palette.eye))>=4.5-1e-9,id+'/'+name+'/'+time); count++;
    }
  }
  console.log('Qualified palette samples:',count);
});
test('renderer fixtures remain untouched, and motion-free entries exclude the new sampler',()=>{
  const meta=buildSync({stdin:{contents:'export * from "./src/activity.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',write:false,metafile:true}).metafile;
  assert.ok(!Object.keys(meta.inputs).some(name=>name.includes('/motion')||name.includes('/vendor/')));
  const shapes=new Set();for(let i=0;i<1000;i++)shapes.add(_layout(`contain-${i}`,{normalize:false}).shape);
  assert.equal(shapes.size,10);
});
