/*! whoami adapter around unmodified MIT Blobatar source. Copyright (c) 2026 Alain for upstream rendering; full notice in ../vendor/blobatar/LICENSE. */
import {blobatar,_layout,_parts} from '../vendor/blobatar/src/blobatar.ts';
import {traits as readTraits} from '../vendor/blobatar/src/traits.ts';
import {normalizeSeed} from '../vendor/blobatar/src/hash.ts';
import {contrast,fromHex} from '../vendor/blobatar/src/color.ts';
import * as poses from '../vendor/blobatar/src/expression.ts';
import {REVISION,EXPRESSIONS,SHAPES,TONES,TRAIT_KEYS,AGENT_STATES,STATES} from './blobatar-schema.mjs';
export const DEFAULTS=Object.freeze({name:'atlas',traits:{},expression:'auto',state:'none',motion:'hover',theme:'dark',backdrop:'none',normalization:'blobatar',pointerGaze:false,nextTime:'Tomorrow, 09:00',timezone:'UTC',recovery:'Try again',palette:{},contrast:true});
export const labelFor=name=>name&&name.trim()?name:'Empty seed';
export function validateName(name){if(typeof name!=='string'||name.length>256||!name.isWellFormed())throw Error('Use at most 256 well-formed Unicode characters.');return name}
export function configFor(input=DEFAULTS,name=input.name??DEFAULTS.name){
  const {linkError,...rest}=input; const c={...DEFAULTS,...rest,name};
  if(Object.keys(c).some(k=>!Object.hasOwn(DEFAULTS,k)))throw Error('Unknown preview configuration field.');validateName(c.name);
  for(const[key,list]of[['expression',['auto',...EXPRESSIONS]],['state',['none',...AGENT_STATES]],['motion',['off','hover','always']],['theme',['dark','light']],['backdrop',['none','circle','squircle','square']],['normalization',['blobatar','raw']]])if(!list.includes(c[key]))throw Error('Invalid '+key);
  if(typeof c.pointerGaze!=='boolean')throw Error('Invalid pointer gaze.');
  if(!c.traits||Array.isArray(c.traits)||Object.getPrototypeOf(c.traits)!==Object.prototype)throw Error('Invalid traits.');
  for(const[key,v]of Object.entries(c.traits)){if(!TRAIT_KEYS.includes(key))throw Error('Unknown trait: '+key);const values=Array.isArray(v)?v:[v];if(values.length>32||values.some(x=>typeof x!=='number'||!Number.isFinite(x)))throw Error('Traits require finite numeric positions; arrays have at most 32 entries.');}
  if(typeof c.contrast!=='boolean'||!c.palette||Array.isArray(c.palette)||Object.getPrototypeOf(c.palette)!==Object.prototype||Object.entries(c.palette).some(([k,v])=>!['head','eye','bg'].includes(k)||typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))throw Error('Palette overrides require head/eye/bg six-digit hex colors.');
  for(const key of ['nextTime','timezone','recovery'])if(typeof c[key]!=='string'||c[key].length>128)throw Error('Invalid state context.');
  if(c.state==='scheduled'&&(!c.nextTime.trim()||!c.timezone.trim())||c.state==='error'&&!c.recovery.trim())throw Error('State context is required.');
  return c;
}
export function expressionFor(config=DEFAULTS){const c=configFor(config);return c.expression==='auto'?(STATES[c.state]?.[0]||'idle'):c.expression}
export function statusFor(config=DEFAULTS){const c=configFor(config);if(c.state==='none')return null;const text=STATES[c.state][1];return c.state==='scheduled'?`${text} · ${c.nextTime} · ${c.timezone}`:c.state==='error'?`${text} · ${c.recovery}`:text}
export function presentation(config=DEFAULTS,size=300){const c=configFor(config);if(!Number.isInteger(size)||size<24||size>4096)throw Error('Size must be an integer from 24 to 4096.');return {size,normalize:c.normalization!=='raw',traits:c.traits,palette:c.palette,contrast:c.contrast,expression:poses[expressionFor(c)],background:c.backdrop==='none'?false:c.backdrop};}
export function identity(config=DEFAULTS,name=config.name){const c=configFor(config,name),t=readTraits(c.name,c.normalization!=='raw',c.traits);return {renderer:'blobatar',upstreamRevision:REVISION,upstreamGeneration:2,seed:c.name,canonicalSeed:c.normalization==='raw'?c.name:normalizeSeed(c.name),normalization:c.normalization,overrides:JSON.parse(JSON.stringify(c.traits)),traits:Object.fromEntries(TRAIT_KEYS.map(k=>[k,t(k)]))};}
export function resolved(config=DEFAULTS,size=300){const c=configFor(config),options=presentation(c,size),layout=_layout(c.name,options),base=_layout(c.name,{...options,expression:poses.idle}),t=readTraits(c.name,c.normalization!=='raw',c.traits);return {renderer:'blobatar',expression:expressionFor(c),statusText:statusFor(c),layout,fit:base.eyes[0].rx/(base.body.rx*(.075+.03*t('eye.rx'))),eyeContrast:contrast(fromHex(layout.palette.eye),fromHex(layout.palette.head))};}
export function svgFor(config=DEFAULTS,size=512,{decorative=false,label}={}){const c=configFor(config);return blobatar(c.name,{...presentation(c,size),title:decorative?undefined:label||labelFor(c.name)});}
export function animatedParts(config,size=300,motion='always'){const c=configFor(config);return _parts(c.name,{...presentation(c,size),animate:motion==='off'?'always':motion});}
export function shareHash(config){const c=configFor(config);return '#config='+encodeURIComponent(JSON.stringify({version:2,renderer:'blobatar',revision:REVISION,config:c}));}
export function readConfig(hash){if(!hash)return {...DEFAULTS,traits:{}};try{if(hash.length>18000)throw Error('Link too long.');const p=JSON.parse(decodeURIComponent(hash.replace(/^#config=/,'')));if(!p.config||typeof p.config!=='object')throw Error('Missing configuration.');if(p.version!==2||p.renderer!=='blobatar'||p.revision!==REVISION)throw Error('This link uses another renderer or revision. G1 links are not silently converted to B.');return configFor(p.config);}catch(e){return {...DEFAULTS,traits:{},linkError:e.message}}}
export function httpPath(config,size=512){const c=configFor(config);const p=new URLSearchParams({renderer:'blobatar',gen:'2',size:String(size),expression:expressionFor(c),backdrop:c.backdrop,normalization:c.normalization,title:labelFor(c.name),contrast:String(c.contrast)});for(const[k,v]of Object.entries(c.palette))p.set('palette.'+k,v);if(c.state!=='none')p.set('state',c.state);if(c.state==='scheduled'){p.set('nextTime',c.nextTime);p.set('timezone',c.timezone)}if(c.state==='error')p.set('recovery',c.recovery);for(const[k,v]of Object.entries(c.traits))p.set(k,Array.isArray(v)?v.join(','):String(v));return '/avatar/'+encodeURIComponent(c.name)+'?'+p;}
export {REVISION,EXPRESSIONS,SHAPES,TONES,TRAIT_KEYS,AGENT_STATES};
