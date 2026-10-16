import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pkg=JSON.parse(readFileSync('package.json')),lock=JSON.parse(readFileSync('package-lock.json'));
assert.equal(pkg.name,'@talarurus/pibulo');assert.equal(lock.name,pkg.name);assert.equal(lock.packages[''].name,pkg.name);assert.equal(pkg.version,'0.3.2-dev.0');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);assert.equal(pkg.private,true);assert.equal(pkg.repository.url,'https://github.com/talarurus/whoami.git');
assert.equal(pkg.devDependencies['mp4-muxer'],'5.2.2');
assert.match(readFileSync('THIRD-PARTY-NOTICES.txt','utf8'),/Copyright \(c\) 2023 Vanilagy/);
for(const [name,version] of Object.entries(pkg.devDependencies))assert.match(version,/^\d+\.\d+\.\d+$/);
for(const [path,p] of Object.entries(lock.packages).filter(([k])=>k)){
 assert.ok(['MIT','Apache-2.0'].includes(p.license),path+' license');
 assert.match(p.integrity,/^sha512-/);assert.match(p.resolved,/^https:\/\/registry\.npmjs\.org\//);
}
for(const p of ['LICENSE','THIRD-PARTY-NOTICES.txt','website/preview/vendor/blobatar/LICENSE','website/preview/vendor/blobatarling-scene/LICENSE'])assert.match(readFileSync(p,'utf8'),/Permission is hereby granted/);
assert.match(readFileSync('THIRD-PARTY-NOTICES.txt','utf8'),/Copyright \(c\) 2026 Alain/);
const manifest=JSON.parse(readFileSync('website/preview/reference-manifest.json'));
for(const f of manifest.files.filter(x=>x.modifications==='None; exact pinned bytes'))assert.equal(createHash('sha256').update(readFileSync(f.destination)).digest('hex'),f.sha256,f.destination);
const fonts=JSON.parse(readFileSync('website/preview/public/fonts/SOURCE.json'));
for(const f of fonts.files){const name=f.source.endsWith('LICENSE.TXT')?'OFL.txt':f.source.split('/').at(-1);assert.equal(createHash('sha256').update(readFileSync('website/preview/public/fonts/'+name)).digest('hex'),f.sha256);}
const skip=new Set(['.git','node_modules','dist','test-results','playwright-report','coverage']);let count=0;
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){if(skip.has(item.name))continue;const path=dir==='.'?item.name:dir+'/'+item.name;if(item.isSymbolicLink())throw Error('Source symlink: '+path);if(item.isDirectory())walk(path);else{
 assert.ok(!/(^|\/)(?:\.env(?:\..*)?|\.DS_Store|id_rsa|id_ed25519|credentials|settings\.local\.json)$/.test(path),'Private file: '+path);
 if(/\.(woff2|png|mp4)$/.test(path))continue;
 const text=readFileSync(path,'utf8');
 assert.ok(!/(?:-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{32,})/.test(text),'Credential pattern: '+path);
 if(path==='package-lock.json')assert.ok(!/"(?:link|resolved)":\s*(?:true|"(?:file:|\/Users\/|\/private\/tmp\/))/.test(text),'Local dependency');
 count++;
}}}
walk('.');console.log('PASS release identity, exact upstream/font hashes, MIT notices, locked dependency licenses/integrities and source hygiene ('+count+' text files).');
