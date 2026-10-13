import {BRAND} from './src/brand.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {DEFAULTS,configFor,svgFor,EXPRESSIONS,AGENT_STATES,TRAIT_KEYS,REVISION} from '../dist/preview/runtime.mjs';
const root=resolve('website/dist/preview');
const types={'.woff2':'font/woff2','.js':'text/javascript','.mjs':'text/javascript','.jsx':'text/plain','.ts':'text/plain','.css':'text/css','.svg':'image/svg+xml','.html':'text/html','.txt':'text/plain','.json':'application/json'};
export function avatarResponse(rawUrl,method='GET'){
 if(!['GET','HEAD'].includes(method))return{status:405,headers:{Allow:'GET, HEAD'},body:'GET or HEAD required'};
 try{
  if(rawUrl.length>18000)throw Error('URL too long');const url=new URL(rawUrl,'http://localhost'),name=decodeURIComponent(url.pathname.slice('/avatar/'.length));
  if(name.length>256||url.pathname.slice('/avatar/'.length).includes('/')||/[\u0000-\u001f\u007f]/u.test(name))throw Error('Name must be at most 256 characters without controls; encode slashes as %2F');
  const allowed=['renderer','gen','size','theme','backdrop','background','expression','state','normalization','nextTime','timezone','recovery','title','contrast','palette.head','palette.eye','palette.bg',...TRAIT_KEYS];
  for(const key of url.searchParams.keys())if(!allowed.includes(key)||url.searchParams.getAll(key).length!==1)throw Error('Unknown or repeated query parameter: '+key);
  const get=k=>url.searchParams.get(k);if(get('renderer')!==null&&get('renderer')!=='blobatar')throw Error('Only the preview Blobatar renderer is available');if(get('gen')!==null&&get('gen')!=='2')throw Error('This preview serves Blobatar generation 2; it does not remap gen=1');
  const size=get('size')===null?512:Number(get('size'));if(!Number.isInteger(size)||size<24||size>1024)throw Error('size must be an integer from 24 to 1024');
  const config={...DEFAULTS,name,traits:{},palette:{}};
  for(const key of ['theme','backdrop','expression','state','normalization'])if(get(key)!==null)config[key]=get(key);
  if(get('background')!==null){if(get('backdrop')!==null)throw Error('Use background or backdrop, not both');config.backdrop=get('background');}
  for(const key of TRAIT_KEYS)if(get(key)!==null){const raw=get(key);if(!raw||raw.split(',').length>32||raw.split(',').some(v=>!v.trim()))throw Error('Invalid trait list');const values=raw.split(',').map(Number);if(values.some(v=>!Number.isFinite(v)))throw Error('Traits must be finite numeric positions');config.traits[key]=values.length===1?values[0]:values;}
  for(const key of ['head','eye','bg'])if(get('palette.'+key)!==null)config.palette[key]=get('palette.'+key);
  if(get('contrast')!==null){if(!['true','false'].includes(get('contrast')))throw Error('contrast must be true or false');config.contrast=get('contrast')==='true';}
  if(config.state==='scheduled'){config.nextTime=get('nextTime')||'';config.timezone=get('timezone')||'';}if(config.state==='error')config.recovery=get('recovery')||'';
  if(config.state!=='scheduled'&&(get('nextTime')!==null||get('timezone')!==null)||config.state!=='error'&&get('recovery')!==null)throw Error('Context requires matching state');
  const title=get('title');if(title!==null&&(!title.trim()||title.length>256))throw Error('Title must be 1–256 characters');
  const body=svgFor(configFor(config),size,{decorative:title===null,label:title||undefined});
  return{status:200,headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox",'X-Avatar-Renderer':'blobatar','X-Avatar-Revision':REVISION},body};
 }catch(e){return{status:400,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'},body:'Invalid avatar request: '+e.message}}
}
export function startServer(port=4318){return createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;if(path.startsWith('/avatar/')){const r=avatarResponse(req.url,req.method);res.writeHead(r.status,r.headers);res.end(req.method==='HEAD'?undefined:r.body);return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 const known=['/','/agent-scenes','/design-lab','/editor','/components','/docs','/about','/contact','/privacy'],route=path.replace(/\/$/,'')||'/',pageRoute=!extname(path),file=pageRoute?'index.html':path.slice(1),target=resolve(root,file);
 if(!target.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 try{const body=await readFile(target);res.writeHead(pageRoute&&!known.includes(route)?404:200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body)}catch{res.writeHead(404);res.end('Not found')}
 }).listen(port,'127.0.0.1',()=>console.log(`${BRAND.name} preview · Blobatar B: http://localhost:${port} (loopback only)`))}
if(process.argv[1]?.endsWith('/server.mjs'))startServer(Number(process.env.PORT)||4318);
