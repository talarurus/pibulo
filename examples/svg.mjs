import {writeFile} from 'node:fs/promises';
import {svgFor} from '@talarurus/whoami';
const svg = svgFor({name: 'agent-001', expression: 'happy'}, 128);
await writeFile(process.argv[2] || '/tmp/whoami-example.svg', svg);
console.log('Rendered agent-001 as static SVG.');
