import React from 'react';
import {createRoot} from 'react-dom/client';
import {Face} from '@talarurus/whoami/react';
import {svgFor, identity, type AvatarConfig} from '@talarurus/whoami';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/gaze.css';
import '@talarurus/whoami/react.css';
const config: AvatarConfig = {name: 'agent-001', expression: 'idle'};
const svg: string = svgFor(config, 128);
const seed: string = identity(config).canonicalSeed;
function Example() {
 return <main><h1>whoami React example</h1><Face name={seed} config={config} size={160} motion="always" pointerGaze decorative={false} label="Agent 001"/><p>Same identity, static SVG:</p><div dangerouslySetInnerHTML={{__html:svg}}/></main>;
}
createRoot(document.getElementById('root')!).render(<Example/>);
