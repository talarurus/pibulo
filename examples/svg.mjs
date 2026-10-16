import {writeFile} from 'node:fs/promises';
import {svgFor} from '@talarurus/pibulo';
const svg = svgFor({name: 'agent-001', expression: 'happy'}, 128);
await writeFile(process.argv[2] || '/tmp/pibulo-example.svg', svg);
console.log('Rendered agent-001 as static SVG.');
