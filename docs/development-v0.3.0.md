# v0.3.0 Motion Studio development milestone

Historical motion checkpoint at `bf51b0c`. The subsequent owner-authorized
[MP4 implementation and qualification](mp4-export.md) extends this milestone;
the original findings below retain their checkpoint context.

Implemented locally on `develop/v0.3.0`, created from approved release commit
`1e1530f38db1d533227d30fe1659e71417c9c317` after verifying a clean worktree. The
approved `9254098` experiment remains on `experiment/v0.3-motion-feasibility`;
its sampling approach was selectively ported, without its research site or a
branch merge. Metadata is `0.3.0-dev.0`, not a release.

## Delivered

- Optional strictly typed, framework-neutral `/motion` entry, complete v1 JSON
  recording validation through the unchanged recording/activity implementations,
  explicit origin/policy, immutable per-agent tracks, arbitrary millisecond
  sampling, position-continuous interruption origins and reduced-motion targets.
- Optional `/motion/react` recorded avatar and system preference hook. The caller
  owns playback time; the component has no animation clock or gaze listeners.
- Existing dark `/studio` with Activity/Motion modes, shared multi-agent timestamp,
  speed (0.25×..2×), play/pause/restart, millisecond/event seeking, readable details,
  keyboard navigation and touch controls. A compact selected-state panel replaces
  simulation controls in Motion mode. Failed import/origin changes preserve the
  current motion. Returning to Activity retains its live state.
- Static planning/execution cues distinguish thinking from working using text
  and simple typographic marks. Existing face expressions, silhouettes and
  artwork remain intact, and status meaning survives disabled animation/color.
- [Motion API/example](motion-api.md), a buildable TypeScript example and the
  [future MP4 frame contract](mp4-frame-contract.md). No encoder, muxer, video UI
  or new runtime dependency is included.

## Verified

Environment: Node 24.21.0, npm 11.19.0, React 19.2.0, Playwright 1.62.1. Existing
dependencies were present; the exact pinned WebKit QA runtime was downloaded into
ignored repository test-results. QA builds/consumer installs remain inside the
repository. Sandbox-restricted browser/network/cache operations used approved
host access; the npm test cache is repository-local. Existing loopback preview
served the rebuilt Studio after `npm start` reported port 4318 already occupied.

| Check | Result |
| --- | --- |
| Build and strict production/website/example TypeScript | PASS |
| Focused unit suite | 40 passed, zero failures/skips; includes 7 motion tests and all 33 existing checks |
| Motion ordering/replay/interruption/isolation/input validation | PASS; cross-agent disorder, per-agent ties, empty events, malformed envelopes, bounds and option errors |
| Palette qualification | 13,440 samples over 80 identities and all 14 expression targets; eye-to-head contrast ≥4.5:1 |
| Chrome 155.0.8059.79 | 11 focused browser groups passed, no page errors |
| Playwright WebKit 26.5 | Same 11 browser groups passed, no page errors |
| Silhouette containment | 700 samples per engine: one raw identity for each of ten silhouettes × fourteen expression targets × five transition times; all inside the 100×100 viewBox |
| React lifetime | Three mount/play/unmount cycles per engine; zero remaining tracked rAF requests and reduced-motion media listeners |
| Studio desktop/mobile | Shared state, seek/restart/pause/speed, failed import/origin atomicity, event keyboard navigation, touch agent selection, 390/320px layout and OS reduced-motion fallback passed |
| Existing identity parity | All seven fixture configurations equal baseline SVG bytes; zero differing decoded PNG channel values per engine |
| Separate installed tarball | SVG/React/activity/recording/scenes/motion ESM and SSR; NodeNext TypeScript including new motion example; browser bundles passed |
| Source hygiene | Release check and diff whitespace passed; pinned source/font/license hashes unchanged |

Chrome/WebKit containment aggregate: x≥11.27, y≥13.92, right≤87.55,
bottom≤88.33 in 100-unit coordinates. This is representative coverage, not an
exhaustive proof across all possible IDs, policies or rapid interruption chains.
PNG parity compares baseline/current in the same engine and process; it is not
cross-engine pixel equality. Historical fixtures and screenshots are preserved.

Run checks from the repository root:

```sh
npm run build
npm run typecheck
npm test
npm run check:release
npm start
# In another terminal; uses Chrome and the pinned WebKit QA installation:
npm run test:motion:browser
# Optional standalone package verification with a repository-local npm cache:
npm_config_cache="$PWD/test-results/motion-v030/npm-cache" npm run test:consumer
```

`PREVIEW_URL` selects another preview origin. On another machine, install the
matching WebKit runtime with
`PLAYWRIGHT_BROWSERS_PATH="$PWD/test-results/motion-v030/browsers" npx playwright install webkit`.
The browser script generates a read-only baseline snapshot and a JSON report under
`test-results/motion-v030`. Source hygiene excludes ignored QA/browser/consumer
outputs; published file boundaries remain the explicit package allowlist.
Incidental ignored Finder metadata was moved into ignored build QA storage,
preserving it while keeping authored-source hygiene checks intact.

## Review artifacts and remaining scope

[Desktop Motion Studio](../assets/studio-motion-desktop.png) ·
[Mobile Motion Studio with reduced motion](../assets/studio-motion-mobile.png).

The reproducibility boundary is recording + pinned identity + motion revision +
resolved policy + origin + ID + timestamp + reduced-motion flag + SVG size/title
policy. The sampler retains no playback history. UI cursor scheduling, OS media
preference changes, rasterization and existing CSS/gaze/scene lifecycle animation
remain browser-driven. Position continuity does not promise velocity continuity;
8-bit palette values may step, and an unusual polarity fallback can change color.

No Firefox, physical-device, screen-reader or hardware-video certification was
performed. Playwright WebKit is not a claim of universal Safari/iOS coverage.
Motion currently samples avatars, not continuous laptop-scene transitions or the
historical CSS idle loops. User-controlled arbitrary trait/palette overrides are
not exposed by the new motion API. Renderer internals remain pinned implementation
dependencies; new renderer generations require separate migration authorization.

Next focused work is an exporter consuming `sampleAll`/`svgFor` at explicit fixed
frame timestamps, with bounded dimensions/duration, an opaque matte, cancellation,
encoder backpressure/cleanup and codec support/fidelity checks. The contract
proposes 30 fps, 1024² and a final hold; it is not implemented export functionality.
This milestone stops for owner visual/functional review. QA is by the implementation
agent and is not independent acceptance review. No push, merge, tag, release,
deployment, npm publication or existing-release modification occurred.
