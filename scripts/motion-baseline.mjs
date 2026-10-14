// Read-only baseline snapshot for SVG/PNG comparison. Never rewrites fixtures.
import {execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
const root = new URL('../test-results/motion-v030/baseline-source/', import.meta.url);
await mkdir(root, {recursive: true});
execFileSync('tar', ['-x', '-C', root.pathname], {input: execFileSync('git', ['archive', '1e1530f38db1d533227d30fe1659e71417c9c317', 'src/index.mjs', 'website/preview/src', 'website/preview/vendor/blobatar'], {maxBuffer: 8 * 1024 * 1024})});
await build({entryPoints: [new URL('src/index.mjs', root).pathname], outfile: new URL('../baseline.mjs', root).pathname, bundle: true, platform: 'node', format: 'esm'});
