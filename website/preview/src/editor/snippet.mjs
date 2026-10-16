/*! Preview code emitter adapted from Blobatar editor/snippet.ts, Copyright (c) 2026 Alain, MIT. */
import {BRAND} from '../brand.mjs';
import {configFor,httpPath,labelFor} from '../adapter.mjs';
const json=x=>JSON.stringify(x,null,2);
const quote=s=>"'"+s.replace(/'/g,"'\\''")+"'";
export function snippet(api,input){const config=configFor(input);
 if(api==='react')return `// pibulo source package (local tarball; not published to npm).\nimport { createElement } from "react";\nimport { Face } from "@talarurus/pibulo/react";\n\nexport default function AgentAvatar() {\n  return createElement(Face, {\n    name: ${json(config.name)},\n    config: ${json(config)},\n    size: 300, decorative: false,\n    label: ${json(labelFor(config.name))},\n    motion: ${json(config.motion)},\n    pointerGaze: ${config.pointerGaze}\n  });\n}\n// Browser: import @talarurus/pibulo/motion.css, gaze.css, and react.css.`;
 if(api==='core')return `// pibulo source package (local tarball; not published to npm).\nimport { svgFor } from "@talarurus/pibulo";\n\nconst config = ${json(config)};\nconst svg = svgFor(config, 300);\n// Static selected pose, including pins and backdrop.\n// Node: the package imports compiled JavaScript.`;
 if(api==='http')return `// Loopback preview only; returns actual pinned Blobatar B SVG.\nfetch(${json(httpPath(config,300))})\n  .then(response => {\n    if (!response.ok) throw new Error("Avatar request failed");\n    return response.text();\n  })\n  .then(svg => console.log(svg));`;
 const base=typeof location==='undefined'?'http://localhost:4318':location.origin;
 return '# Preview-local HTTP export; this is curl, not the frozen CLI.\n'+'curl --fail '+quote(base+httpPath(config,300))+' > '+BRAND.slug+'.svg\n# Static selected B pose; every configured trait is included.';
}

// Compact homepage examples; full configuration emitter above stays available in the editor.
export function heroSnippet(api,input){
 const c=configFor(input);
 if(api==='core')return `// pibulo source package example
import { svgFor } from "@talarurus/pibulo";

const svg = svgFor({
  name: ${json(c.name)}, expression: ${json(c.expression)}
}, 300);`;
 return `// pibulo source package example
import { createElement } from "react";
import { Face } from "@talarurus/pibulo/react";
// Import @talarurus/pibulo/motion.css, gaze.css, and react.css.

export default () => createElement(Face, {
  name: ${json(c.name)},${c.expression==='idle'?'':`
  config: {expression: ${json(c.expression)}},`}
  motion: "always", pointerGaze: true
});`;
}
