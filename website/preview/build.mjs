import {BRAND} from './src/brand.mjs';
import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile,cp} from 'node:fs/promises';
const base='website/preview',out='website/dist/preview';
await mkdir(out,{recursive:true});
const nodeRuntime=await build({entryPoints:[`${base}/src/adapter.mjs`],outfile:`${out}/runtime.mjs`,bundle:true,format:'esm',platform:'node',target:'node24',legalComments:'eof'});
const runtime=await import('../../'+out+'/runtime.mjs?build='+Date.now());
await build({entryPoints:[`${base}/src/main.jsx`],outdir:out,entryNames:'app',chunkNames:'chunks/[name]-[hash]',splitting:true,bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',define:{'process.env.NODE_ENV':'"production"'},metafile:true}).then(async r=>{const forbidden=Object.keys(r.metafile.inputs).filter(p=>p.includes('packages/core/')||p.includes('packages/react/')||p.includes('/lab/refined')||p.includes('/lab/CurrentFace'));if(forbidden.length)throw Error('Default preview must contain only approved B art: '+forbidden.join(', '));await writeFile(`${out}/bundle-inputs.json`,JSON.stringify(r.metafile,null,2))});
for(const file of ['style.css','design-lab.css','visual-parity.css'])await copyFile(`${base}/public/${file}`,`${out}/${file}`);
await writeFile(`${out}/index.html`,(await readFile(`${base}/public/index.html`,'utf8')).replaceAll('{{PREVIEW_NAME}}',BRAND.name));
await writeFile(`${out}/favicon.svg`,runtime.svgFor({...runtime.DEFAULTS,name:'blinkling'},32,{decorative:false,label:BRAND.name+' preview icon'}));
await cp(`${base}/public/fonts`,`${out}/fonts`,{recursive:true});
// Component gallery links expose this checkout's source, with relative helpers.
await cp(`${base}/src`,`${out}/source`,{recursive:true});
await cp(`${base}/vendor`,`${out}/vendor`,{recursive:true});
await copyFile(`${base}/vendor/blobatarling-scene/scene.css`,`${out}/agent-scenes.css`);
for(const file of ['motion','gaze'])await copyFile(`${base}/vendor/blobatar/src/${file}.css`,`${out}/blobatar-${file}.css`);

const licenses=['LICENSE','node_modules/react/LICENSE','node_modules/react-dom/LICENSE','node_modules/scheduler/LICENSE',`${base}/THIRD-PARTY-NOTICES.txt`,`${base}/public/fonts/OFL.txt`,`${base}/vendor/blobatarling-scene/LICENSE`,'node_modules/mp4-muxer/LICENSE'];
await writeFile(`${out}/THIRD-PARTY-NOTICES.txt`,(await Promise.all(licenses.map(async p=>p+'\n\n'+await readFile(p,'utf8')))).join('\n\n'));
console.log('Built B preview, runtime and exact third-party notices. No G1 packages built or included.');
