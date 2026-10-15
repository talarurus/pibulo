import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSync} from 'esbuild';
import {compileMotionRecording} from '@talarurus/whoami/motion';
import {serializeRecording} from '@talarurus/whoami/recording';
import {createMP4Plan,mp4FrameTiming,mp4FrameSVG,checkMP4Support,exportMP4,MP4_LIMITS} from '@talarurus/whoami/export/mp4';
const compile = (events=[],agents=[{id:'atlas',name:'Atlas'},{id:'mira',name:'Mira'}]) => {
  const file=serializeRecording({agents,events});assert.ok(file.ok);const result=compileMotionRecording(file.json,{originMs:0});assert.ok(result.ok);return result.motion;
};
const start={version:1,agentId:'atlas',sequence:1,timestamp:100,taskId:'task',type:'task.started'};
test('fixed frame contract covers all agents and holds the ending for one second',()=>{
  const motion=compile([start,{...start,sequence:2,timestamp:1100,type:'task.completed'}]);
  const plan=createMP4Plan(motion,{width:512,height:512});
  assert.equal(plan.frameCount,75);assert.equal(plan.durationMs,2500);assert.deepEqual(plan.agentIds,['atlas','mira']);
  for(let i=0;i<plan.frameCount;i++){
    const timing=mp4FrameTiming(plan,i);assert.equal(timing.playbackMs,i*1000/30);assert.equal(timing.timestampUs,Math.round(i*1000000/30));
    assert.equal(timing.durationUs,Math.round((i+1)*1000000/30)-timing.timestampUs);
  }
  const first=mp4FrameSVG(motion,plan,0), end=mp4FrameSVG(motion,plan,74);
  const duplicate=compile([start,{...start,sequence:2,timestamp:1100,type:'task.completed'}]);
  const duplicatePlan=createMP4Plan(duplicate,{width:512,height:512});
  for(let i=plan.frameCount-1;i>=0;i--)assert.equal(mp4FrameSVG(motion,plan,i),mp4FrameSVG(duplicate,duplicatePlan,i));
  assert.equal(first,mp4FrameSVG(motion,plan,0));assert.match(first,/Atlas/);assert.match(first,/Mira/);assert.match(end,/Completed/);
  assert.ok(Object.isFrozen(plan.agentIds));assert.equal(createMP4Plan(compile()).frameCount,30);
});
test('dimension, duration, roster, background and option boundaries are explicit',()=>{
  const motion=compile();for(const width of [64,512,1024,2048])assert.equal(createMP4Plan(motion,{width}).width,width);
  for(const options of [{width:63},{width:65},{width:2050},{height:NaN},{background:'transparent'},{background:'#ffffff00'},{agentIds:[]},{agentIds:['atlas','atlas']},{agentIds:['unknown']},{reducedMotion:'yes'},{fps:60}])assert.throws(()=>createMP4Plan(motion,options));
  let called=false;assert.throws(()=>createMP4Plan(motion,{get width(){called=true;return 512;}}));assert.equal(called,false);
  assert.equal(createMP4Plan(compile([{...start,timestamp:28600}])).durationMs,30000);
  assert.throws(()=>createMP4Plan(compile([{...start,timestamp:28601}])));
  assert.throws(()=>createMP4Plan(compile([],Array.from({length:9},(_,i)=>({id:String(i)})))));
  assert.throws(()=>mp4FrameTiming(createMP4Plan(motion),30));
});
test('frame composition escapes caller labels and respects reduced-motion policy',()=>{
  const motion=compile([start],[{id:'atlas',name:'<script> & "label"'}]);
  const plan=createMP4Plan(motion,{reducedMotion:true});
  const a=mp4FrameSVG(motion,plan,3),b=mp4FrameSVG(motion,plan,4);
  assert.ok(!a.includes('<script>'));assert.match(a,/&lt;script&gt;/);assert.equal(a,b);
  const wide=compile([],[{id:'atlas',name:'W'.repeat(128)}]);
  const label=mp4FrameSVG(wide,createMP4Plan(wide,{width:512,height:512}),0);
  assert.match(label,/W{18}…/);assert.ok(!label.includes('W'.repeat(40)));
});
test('seekable output buffering honors rewrites, holes and the byte cap',async()=>{
  const code=buildSync({entryPoints:['src/mp4-buffer.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
  const module={exports:{}};new Function('module','exports',code)(module,module.exports);const sink=new module.exports.MP4Buffer();
  sink.write(new Uint8Array([1,2,3]),0);sink.write(new Uint8Array([9]),1);sink.write(new Uint8Array([7]),5);
  assert.deepEqual([...new Uint8Array(await sink.blob().arrayBuffer())],[1,9,3,0,0,7]);
  assert.throws(()=>sink.write(new Uint8Array([0]),MP4_LIMITS.maxBytes));sink.clear();assert.equal(sink.blob().size,0);
});
test('non-browser usage reports unsupported and cancellation without loading video resources',async()=>{
  assert.equal((await checkMP4Support()).supported,false);
  await assert.rejects(exportMP4(compile()),error=>error.code==='unsupported');
  const aborter=new AbortController();aborter.abort();await assert.rejects(exportMP4(compile(),{},{signal:aborter.signal}),error=>error.code==='cancelled');
});
test('ordinary activity, recording and sampling bundles exclude MP4 and codecs',()=>{
  for(const entry of ['src/activity.ts','src/recording.ts','src/motion.ts']){
    const {metafile}=buildSync({entryPoints:[entry],bundle:true,platform:'node',write:false,metafile:true});
    assert.ok(!Object.keys(metafile.inputs).some(file=>file.includes('/mp4')||file.includes('mp4-muxer')));
  }
  assert.match(readFileSync('dist/mp4.js','utf8'),/import\("\.\/video\/mp4-muxer-/);
});
