import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {svgFor,identity,shareHash,readConfig} from '@talarurus/pibulo';
import {Face} from '@talarurus/pibulo/react';
const fixtures=JSON.parse(readFileSync('tests/fixtures/preview-identity.json'));
test('packaged SVG/identity preserves seven existing preview checkpoint fixtures',()=>{
 for(const {config,size,sha256,identity:expected} of fixtures.cases){
  assert.equal(createHash('sha256').update(svgFor(config,size)).digest('hex'),sha256);
  assert.deepEqual(identity(config),expected);
 }
});
test('packaged React SSR uses the same selected geometry and accessible title',()=>{
 for(const {config,size} of fixtures.cases){
  const html=renderToStaticMarkup(createElement(Face,{name:config.name,config,size,decorative:false,motion:'always',pointerGaze:true}));
  assert.ok(html.includes(svgFor(config,size)));
 }
});
test('packaged configuration sharing preserves identity and rejects incompatible revisions',()=>{
 for(const {config} of fixtures.cases)assert.deepEqual(identity(readConfig(shareHash(config))),identity(config));
 assert.match(readConfig('#config='+encodeURIComponent(JSON.stringify({version:2,renderer:'blobatar',revision:'different',config:{name:'atlas'}}))).linkError,/another renderer or revision/);
});
