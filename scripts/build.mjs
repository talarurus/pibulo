import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const [entry,out] of [['src/index.mjs','dist/index.js'],['src/react.jsx','dist/react.js'],['src/activity.ts','dist/activity.js'],['src/recording.ts','dist/recording.js'],['src/activity-react.tsx','dist/activity-react.js'],['src/scenes.tsx','dist/scenes.js'],['src/motion.ts','dist/motion.js'],['src/motion-react.tsx','dist/motion-react.js']]){
 await build({entryPoints:[entry],outfile:out,bundle:true,format:'esm',platform:'neutral',target:'es2022',external:['react'],legalComments:'eof'});
}
await build({entryPoints:['src/mp4.ts'],outdir:'dist',entryNames:'mp4',chunkNames:'video/[name]-[hash]',bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2022',legalComments:'eof'});
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.production.json'],{stdio:'inherit'});
await copyFile('website/preview/vendor/blobatarling-scene/scene.css','dist/scenes.css');
await mkdir('dist/types/src',{recursive:true});
for(const file of ['react.d.ts','index.d.ts'])await copyFile('src/'+file,'dist/types/src/'+file);
for(const file of ['index.d.ts','react.d.ts','react.css'])await copyFile('src/'+file,'dist/'+file);
for(const file of ['motion','gaze'])await copyFile('website/preview/vendor/blobatar/src/'+file+'.css','dist/'+file+'.css');
const files=['LICENSE','website/preview/THIRD-PARTY-NOTICES.txt','website/preview/vendor/blobatar/LICENSE','website/preview/vendor/blobatarling-scene/LICENSE','website/preview/public/fonts/OFL.txt','node_modules/react/LICENSE','node_modules/react-dom/LICENSE','node_modules/scheduler/LICENSE','node_modules/mp4-muxer/LICENSE'];
await writeFile('THIRD-PARTY-NOTICES.txt',(await Promise.all(files.map(async f=>f+'\n\n'+await readFile(f,'utf8')))).join('\n\n'));
await copyFile('THIRD-PARTY-NOTICES.txt','dist/THIRD-PARTY-NOTICES.txt');
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.website.json'],{stdio:'inherit'});
await import('../website/preview/build.mjs');
console.log('Built @talarurus/pibulo 0.3.2 source package core, activity engine, React entry, styles, and website.');
