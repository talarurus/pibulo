import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const [entry,out] of [['src/index.mjs','dist/index.js'],['src/react.jsx','dist/react.js']]){
 await build({entryPoints:[entry],outfile:out,bundle:true,format:'esm',platform:'neutral',target:'es2022',external:['react'],legalComments:'eof'});
}
for(const file of ['index.d.ts','react.d.ts','react.css'])await copyFile('src/'+file,'dist/'+file);
for(const file of ['motion','gaze'])await copyFile('website/preview/vendor/blobatar/src/'+file+'.css','dist/'+file+'.css');
const files=['LICENSE','website/preview/THIRD-PARTY-NOTICES.txt','website/preview/vendor/blobatar/LICENSE','website/preview/vendor/blobatarling-scene/LICENSE','website/preview/public/fonts/OFL.txt','node_modules/react/LICENSE','node_modules/react-dom/LICENSE','node_modules/scheduler/LICENSE'];
await writeFile('THIRD-PARTY-NOTICES.txt',(await Promise.all(files.map(async f=>f+'\n\n'+await readFile(f,'utf8')))).join('\n\n'));
await copyFile('THIRD-PARTY-NOTICES.txt','dist/THIRD-PARTY-NOTICES.txt');
await import('../website/preview/build.mjs');
console.log('Built @talarurus/whoami 0.1.0 core, React entry, styles, and website.');
