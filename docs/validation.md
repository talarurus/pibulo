# v0.1.0 validation

Implementation-agent verification on macOS with Node 24.21.0, npm 11.19.0, React/ReactDOM 19.2.0 and Google Chrome 155.0.8059.40. No independent review or physical-device certification is claimed.

| Check | Result |
| --- | --- |
| Isolated clean clone, with neither dependencies nor build outputs copied | PASS |
| `npm ci` using a new empty npm cache | PASS: 12 packages installed |
| `npm run build` | PASS: compiled ESM SVG/React entries, declarations, CSS and actual website |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 17 tests, 0 failed/skipped |
| `npm run check:release` | PASS: source identity, MIT notices, source/font hashes, dependency licenses/integrities and hygiene |
| `node examples/svg.mjs` | PASS: writes actual deterministic SVG |
| `npm start` with PORT=4329 in clean clone | PASS: actual website served from isolated clone |
| `npm run example:react` with PORT=4332 in clean clone | PASS: desktop gaze, mobile render, 0 runtime errors |
| Separate application installs locally packed tarball | PASS: ESM SVG import, stable hash/identity, React SSR, TypeScript and browser bundle |
| Separate installed React consumer in Chrome | PASS: desktop pointer gaze, mobile reduced-motion render, 0 runtime errors |
| Existing website browser suite | PASS: 17 checks |
| Hero/reaction/scene browser suite | PASS: 8 checks |
| Mobile code-copy/navigation browser suite | PASS: 5 checks |
| `npm audit --json` | PASS: 0 reported advisories across all severities |
| Original blinkling-preview and blinkling file hashes, HEAD and status | PASS: 373 and 301 files unchanged, including pre-existing uncommitted work |

The 30 website checks verify the editor's ten silhouettes/fourteen poses, controls/pins/lists/palettes/state labels, revisioned sharing, components, browser-local wall, GET/HEAD SVG parity, live four-direction gaze, blink/breathe/bob, password caret/reveal, reduced motion, coarse pointer, hero click/keyboard/reset, optional six manual scenes and pause/disposal. Layouts and actual long-code scroll/copy were checked at 320, 360, 390, 768 and 1440 pixels. SVG export matches the configured renderer bytes; the 512×512 PNG has **zero differing decoded channel values** against that SVG.

Seven new compatibility fixtures were captured from the unchanged preview checkpoint 5e0869f4, before packaging changes. They preserve existing ASCII/empty/Unicode/raw/pinned/palette identities and SVG SHA-256 values; no existing generation goldens were rewritten. Existing adapter checks also compare all ten-by-fourteen silhouette/expression combinations with exact pinned upstream serialization. Scene checks retain fork-source hashes and test all shapes, activity frames, playback replacement/pause/disposal and reduced-motion stills.

The fresh install emitted npm's nonblocking install-script notices for esbuild and optional fsevents. The documented install and all builds passed using the locked platform packages. No install-script approval or global configuration change was needed.

An initial browser assertion expected the obsolete provisional branding. Its expected text was changed to v0.1.0 without changing behavioral assertions; the complete affected suite then passed. Initial sandbox-only network/loopback/cache denials were rerun with the required host permission. These environmental attempts are not counted as product passes.

Source review excludes parent repository history, private release documents, credentials/configuration, unused alternate-renderer experiments, historical result artifacts, node_modules and built website/package output. The sole README screenshot is a deliberate synthetic product asset. Exact MIT upstream notices, runtime notices and OFL font license are retained and built into distribution notices. No npm publish or production deployment was performed.

Limitations: Chrome desktop and emulated mobile viewports only; no physical devices, Safari/Firefox matrix, screen-reader certification or independent acceptance review. PNG is static/browser-only. Composition examples are checked-in source, not exported SDK components. Scenes remain manual and experimental, with no monitoring, session/approval system, agent integration, export or packaged scene API. The loopback server has no hot reload and is not a production hosting service. This record concerns the standalone whoami release, not qualification of the original Blinkling packages.
