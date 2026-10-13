import {validateName} from './adapter.mjs';
export const WALL_KEY='blinkling.preview.wall.v1';
// Browser-local persistence adapter. Replace this interface for approved shared storage.
export const wallStore={
  load(){try{const data=JSON.parse(localStorage.getItem(WALL_KEY)||'{}');if(!data||Array.isArray(data)||typeof data!=='object')throw Error();const valid={};for(const [cell,name] of Object.entries(data)){if(!/^\d+$/.test(cell)||+cell>=360||typeof name!=='string'||name.length>64)continue;try{validateName(name);valid[cell]=name}catch{}}return {entries:valid,error:''}}catch{return {entries:{},error:'Local wall data could not be read. Your browser may block storage.'}}},
  save(entries){try{localStorage.setItem(WALL_KEY,JSON.stringify(entries));return ''}catch{return 'Storage is unavailable. This placement will last until you reload.'}},
  clear(){try{localStorage.removeItem(WALL_KEY);return ''}catch{return 'Could not clear browser storage.'}}
};
