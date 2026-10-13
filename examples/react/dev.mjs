import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
await mkdir('examples/react/dist',{recursive:true});
await build({entryPoints:['examples/react/main.tsx'],bundle:true,format:'esm',outdir:'examples/react/dist',define:{'process.env.NODE_ENV':'"production"'}});
await writeFile('examples/react/dist/index.html','<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>whoami React example</title><link rel="stylesheet" href="/main.css"><div id="root"></div><script type="module" src="/main.js"></script></html>');
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
createServer(async(req,res)=>{const name=({'/':'index.html','/main.js':'main.js','/main.css':'main.css'})[req.url];if(!name){res.writeHead(404);res.end();return}const bytes=await readFile('examples/react/dist/'+name);res.setHeader('Content-Type',mime[name.slice(name.lastIndexOf('.'))]);res.end(bytes)}).listen(Number(process.env.PORT)||4319,'127.0.0.1',()=>console.log('React example: http://localhost:'+ (process.env.PORT||4319)));
