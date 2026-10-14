# v0.2.0 development review

This is owner-authorized development, not a v0.2.0 release. Branch: `develop/v0.2.0`. Local package version: `0.2.0-dev.0`. No tag, GitHub release, deployment, npm publication, rename or change to another Talarurus project is part of this work.

The baseline is the original v0.1.0 commit `f37d194` (annotated tag object `9456659e6b78833cbd68b29fa203608fa48a7e25`). The v0.1.0 tag, renderer/vendor files, reference manifest, seven identity fixtures, existing SVG/React implementation and declarations, fonts, license files and notices are unchanged. Existing validation remains in [validation.md](validation.md).

## What is new

- A strict TypeScript, framework-neutral engine with stable exact agent IDs, immutable snapshots, a small version 1 event schema, explicit lifecycle transitions, sequence/timestamp and task checks, bounded history, subscriptions, and deterministic complete-recording replay.
- React `useAgentActivity` and `AgentAvatar`, plus isolated optional `AgentScene`. The existing Face API remains compatible. New library declarations are generated from checked TypeScript; Studio implementation is also strictly checked.
- `/studio`, powered by those public package exports: three independent agents; start/work/wait/input/resolve/complete/error/reset; timeline; replay/pause/step/seek; React and recording examples with clipboard copy. Simulated events are clearly labeled. Recordings cap at 120 accepted events and stay in memory.
- Separate installed-tarball examples and checks for the activity engine and both components, alongside the original SVG and Face example. `npm start` builds the public package first so a fresh checkout does not require pre-existing dist files.

## What is reused

| Functionality | Provenance |
| --- | --- |
| Seed hashing, geometry, palettes, expressions, motion, gaze | Pinned Alain00/Blobatar renderer; unchanged |
| Laptop, hand/badge artwork, activity samples, playback and DOM binding | Already-adapted Blobatarling modules; unchanged |
| AgentScene lifecycle/visibility adapter | Adapted from the existing manual scene demo into a public subscribed component |
| Website shell, fonts, editor, exports and compositions | Existing attributed v0.1.0 implementation |

These visuals are not counted as new differentiation. The new layer is the activity contract and behavior, reusable subscriptions, event-driven composition and interactive Studio. Full provenance is in [provenance.md](provenance.md); all third-party licenses remain intact.

## Verification

Implementation-agent verification on macOS, Node 24.21.0, npm 11.19.0, React 19.2.0 and Google Chrome 155.0.8059.40. This is not independent acceptance review.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; locked dependencies, no added runtime or development packages |
| `npm run build` | PASS; existing entries plus activity/React/scenes, generated declarations, styles and website |
| `npm run typecheck` | PASS; production implementation, Studio, existing and new TypeScript/React examples |
| `npm test` | PASS; 25 tests: 17 existing plus 8 new activity/integration tests |
| `npm run check:release` | PASS; private development identity, exact upstream/font hashes, notices, lock integrity/licenses and hygiene |
| Baseline fixture and source comparison | PASS; seven original identity/SVG hashes, 140 shape/expression combinations, original Face SSR and share contracts |
| `npm run test:browser` | PASS; all 30 existing website/editor/scene/refinement checks |
| Existing SVG/PNG export | PASS; zero differing decoded PNG channel values versus the configured SVG |
| `npm run test:studio` | PASS; 9 interaction/layout checks plus no runtime errors |
| Studio lifecycle | PASS; thinking/working/waiting/input/resolution/completion/error/reset and agent independence |
| Studio replay | PASS; initial idle state, stepping, prefix seeking, terminal-state reconstruction, return to live |
| Studio bounded recording | PASS; all 120 accepted events retained, further mutations disabled, new session restores controls |
| Studio layouts | PASS; 320, 390, 768 and 1440px without horizontal overflow; touch mobile interactions |
| Accessibility/motion | PASS; polite atomic text status, labeled controls, reduced-motion geometry/animation checks, offscreen pause |
| `npm run test:consumer` (offline cache) | PASS; separate tarball install, ESM imports, immutable baseline SVG/identity, Face/activity/scene SSR, replay, NodeNext strict TypeScript and application bundles |
| Separate installed application in Chrome | PASS; 4 checks: original Face desktop gaze/mobile, activity components update together on desktop/mobile, no runtime errors |
| `npm start` with generated package dist initially absent | PASS; package/declarations/site built and loopback preview served |
| `git diff --check` | PASS |

The unit tests cover explicit transitions, bad versions/types/fields/numbers/strings/accessors, stale/duplicate events and timestamps, task mismatch, illegal terminal/input transitions, independent agents, bounded immutable history (including limit 1), detached input objects, deterministic replay/rejections, subscriber failure/reentrancy/unsubscribe, accessible SSR, and scene import isolation. They do not substitute for owner or independent review.

Sandbox denials for branch creation, loopback serving, Chrome launch and npm cache writes were rerun with the required host permissions. They are environment restrictions, not product passes. An implementation check found that the waiting-state UI enabled a repeated Wait event that the engine rejects; the control was corrected and the focused browser suite verifies it is disabled.

## Screenshots

- [Desktop Studio](../assets/studio-desktop.png)
- [Mobile Studio](../assets/studio-mobile.png)

The screenshots use synthetic agents/events and the actual public rendering components.

## API examples

See the full [public schema, transitions and React contract](api.md), [typed React activity example](../examples/activity/main.tsx) and [framework-neutral TypeScript example](../examples/activity/engine.ts). Existing root and Face examples remain available.

## Remaining limits

The registered agent roster is fixed per engine, with one current task per agent. Callers must provide increasing per-agent sequences, nondecreasing timestamps and unique task IDs across a session. Events arriving out of order are rejected, not buffered/reordered. There is no network transport, automatic agent monitoring, authentication, durable storage, approval backend, checkpoint restore or scene export. A bounded history tail alone may be incomplete for replay; callers retain full recordings. Studio sessions are memory-only and intentionally capped. Task input is a visual state, not an external authorization mechanism.

New production modules are checked TypeScript; the existing first-party JavaScript and handwritten legacy declarations are retained to avoid unrelated migration/regressions. Browser verification covers desktop Chrome and emulated mobile/touch, not physical devices, Safari/Firefox or screen-reader certification.

## Before a v0.2.0 release

1. Owner visual and functional review of `/studio`, including replay, mobile controls and the integration example. Stop here for that review.
2. Independent source/API and accessibility review by someone other than the implementation agent; none is claimed here and no subagents were used.
3. Resolve review feedback, agree the v1 schema/ordering/task-ID contract and supported browser scope, and verify any resulting changes.
4. Obtain separate authorization for a final version, tag, GitHub release, deployment or npm publication. The repository remains private and the current work is committed locally only.
