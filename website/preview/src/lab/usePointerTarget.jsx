import {useEffect,useState} from 'react';
export function usePointerTarget(host,enabled=true){
  const [target,setTarget]=useState(null);
  useEffect(()=>{
    if(!enabled){setTarget(null);return}
    const fine=matchMedia('(hover: hover) and (pointer: fine)'),still=matchMedia('(prefers-reduced-motion: reduce)');
    let rect=null,frame=0,pending=null;
    const measure=()=>{rect=host.current?.getBoundingClientRect()};
    const rest=()=>{cancelAnimationFrame(frame);frame=0;pending=null;setTarget(null)};
    const move=e=>{if(!fine.matches||still.matches||!rect||!['mouse','pen'].includes(e.pointerType))return;pending={x:Math.max(-1,Math.min(1,(e.clientX-rect.left-rect.width/2)/(rect.width/2))),y:Math.max(-1,Math.min(1,(e.clientY-rect.top-rect.height/2)/(rect.height/2)))};if(!frame)frame=requestAnimationFrame(()=>{frame=0;setTarget(pending)})};
    const media=()=>{rest();measure()};measure();const observer=new ResizeObserver(measure);observer.observe(host.current);
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerleave',rest);window.addEventListener('blur',rest);window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);fine.addEventListener('change',media);still.addEventListener('change',media);
    return()=>{rest();observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('pointerleave',rest);window.removeEventListener('blur',rest);window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);fine.removeEventListener('change',media);still.removeEventListener('change',media)};
  },[enabled,host]);
  return target;
}
