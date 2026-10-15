import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Run after inspect-mp4.swift; qualify independent decoded metadata against the
// fixed contract, rather than trusting a nonempty file or the exporter's plan.
const root='test-results/mp4/';
const inspected=JSON.parse(await readFile(root+'native-inspection.json','utf8'));
const browsers=JSON.parse(await readFile(root+'browser-report.json','utf8'));
assert.equal(inspected.length,12);
const files=[];
for(const value of inspected){
  const name=value.file.split('/').at(-1);
  const expected=name.includes('boundary')?[64,900,30]:name.includes('empty')?[name.includes('2048')?2048:64,30,1]:name.includes('studio')?[512,216,7.2]:[name.includes('1024')?1024:512,114,3.8];
  const [size,frames,duration]=expected;
  assert.equal(value.codec,'avc1');assert.equal(value.width,size);assert.equal(value.height,size);
  assert.equal(value.decodedFrames,frames);assert.equal(value.nominalFrameRate,30);
  assert.ok(Math.abs(value.durationSeconds-duration)<1e-6);assert.equal(value.firstPTS,0);
  assert.ok(value.maxIntervalErrorSeconds<1e-6);
  const ptsError=Math.max(...value.timestamps.map((time,i)=>Math.abs(time*1e6-Math.round(i*1e6/30))));
  assert.ok(ptsError<.334); // container rational timebase, below one microsecond
  const bytes=await readFile(value.file);
  files.push({...value,file:name,timestamps:undefined,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),maxContractPTSErrorUs:ptsError});
}
const demo=await readFile('assets/motion-export-demo.mp4');
assert.equal(createHash('sha256').update(demo).digest('hex'),files.find(file=>file.file==='chrome-512.mp4').sha256);
await writeFile('docs/mp4-verification.json',JSON.stringify({inspection:'macOS AVFoundation parsed and decoded every frame; independent of muxer',browsers:browsers.map(browser=>({engine:browser.engine,version:browser.version,support:browser.support,checks:browser.checks,faults:browser.faults,fidelity:browser.files.map(file=>({file:file.file,codec:file.codec,resources:file.resources,frames:file.plan.frameCount,fidelity:file.fidelity}))})),files},null,2)+'\n');
console.log('PASS independent decode: 12 real MP4 files, frame counts/dimensions/30 fps/duration/order, PTS error <0.334 µs and sample hash.');
