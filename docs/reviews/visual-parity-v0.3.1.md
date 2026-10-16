# v0.3.1 visual parity pass — owner review

**Subsequent owner decision:** the restored homepage at `0d6e0f7` was approved at
1440, 390 and 320 pixels. [v0.3.1 release preparation](../releases/preparation-v0.3.1.md)
is authorized; publication remains a separate gate. The review below retains its
original pre-approval context.

**Status:** the owner requested restoration of the v0.3.0 homepage after reviewing
the first pass (`96af0a3`). The restored homepage is awaiting visual approval.
See [the restoration review](homepage-restoration-v0.3.1.md) for current screenshots
and follow-up verification. The first-pass evidence remains below.
No release, tag, push, deployment or npm publication. Package metadata remains
0.3.0. This is an implementation-agent review, not independent acceptance.

Baseline: `629c32397057eba7719ab8fe8bb3544a1f985d47`, clean
`develop/v0.3.0`. Work branch: `design/v0.3.1-visual-parity`.
Inspection date: 2026-10-15. The separate company website was not touched.

## Visual result

The homepage again uses the v0.3.0 wordmark, generous spacing and two-column
identity/code composition. The first pass's marketing headline, CTA cluster,
statistics and framed identity card are removed. Expression tiles and six identity
shortcuts remain inside quiet disclosures. The three-agent recording preview now
sits in an unframed secondary section below the hero, with one contextual Studio
link. It still uses the existing public motion API: play/pause, manual states,
offscreen/hidden pause and reduced-motion states are retained. No artwork changes.

The editor shows all fourteen expressions as actual pose tiles, brings palette
controls ahead of detailed geometry axes, and provides section navigation and
visible hue selection/reset. Navigation preserves the configuration fragment.
Incomplete palette input now stays recoverable instead of crashing the page.
Mobile gets a direct jump from the preview to customization. Deep axes,
normalization, constrained sets, JSON overrides, share links and exports remain.

Shared spacing, restrained sage accents, preview surfaces and selection feedback
connect the editor, component examples and homepage. Studio's Activity/Motion
layout is preserved; only a direct Motion link and selected-button hover contrast
change there. The component gallery's previously broken local source-download
links now return the actual checkout files and helpers. Its source-only and
no-registry disclaimers remain visible.

Stale current-page v0.1.0, generation-trial and old helper copy is corrected.
Historical release documentation stays historical. The README uses current
screenshots, an actual animated demo and accurate source/npm/hosting statements.

## Reference and specific comparison

Inspected [current upstream source](https://github.com/Alain00/blobatar) with a
shallow checkout at `a7fd546ebede49d0a9fa638945b9e534489782a2` — the same revision
as our pinned renderer. Inspected the live [home](https://blobatar.dev/),
[editor](https://blobatar.dev/editor), [components](https://blobatar.dev/components),
[wall](https://blobatar.dev/#wall) and [documentation](https://blobatar.dev/docs)
at 1440 and 390 pixels. Evidence is in
[upstream screenshots](../../assets/visual-parity-v0.3.1/upstream/) and
[interaction measurements](../../assets/visual-parity-v0.3.1/upstream/interactions.json).

The upstream hero pairs a compact face with visual shape, expression, background
and hue choices in a popover. Its editor makes pinning and named silhouette
thumbnails clear. Its component gallery distinguishes illustrative UI from source
registry installation. Its wall is a large canvas, not a grid of live React
avatars. We borrowed the lessons of visual choice and clear feedback, while
keeping whoami's dark identity. Owner feedback subsequently restored the original
homepage composition, as recorded in the follow-up review.

Actual upstream interactions inspected: hover motion, click reaction at early
and held frames, left/right gaze, expression and hue selection, reduced-motion
reaction (zero running animations), editor shape selection and Always motion,
component agent-list selection, and wall hover/click. The wall inspection was
read-only; no identity was submitted to its public service. Most upstream
component examples are illustrations with source-install controls, not full
applications. There is no equivalent task recording/replay player in the inspected
upstream routes; whoami's playback was exercised separately.

Reviewed the README's
[sheet.png](https://github.com/Alain00/blobatar/blob/a7fd546ebede49d0a9fa638945b9e534489782a2/docs/media/sheet.png)
(2800×2008),
[crowd.png](https://github.com/Alain00/blobatar/blob/a7fd546ebede49d0a9fa638945b9e534489782a2/docs/media/crowd.png)
(2800×1040), and
[roster.png](https://github.com/Alain00/blobatar/blob/a7fd546ebede49d0a9fa638945b9e534489782a2/docs/media/roster.png)
(2800×1576). The sheet makes shapes, palettes and poses comparable; the crowd
shows seeded variety; the roster explicitly separates generations. Our hero
roster and expression tiles expose existing variety while preserving generation 2.
Reference screenshots depict Alain's MIT Blobatar project; its notices and our
existing third-party attributions are retained.

## Feature parity matrix

“Before” describes v0.3.0. Published adapters, source registry components and
illustrative demos are separate categories; a local endpoint is not a hosted API.

| Experience | Before | v0.3.1 result / remaining difference |
| --- | --- | --- |
| Ten shapes, fourteen poses, palettes, seed identity | Already implemented | Preserved, including all fixtures and pinned renderer bytes. |
| Hero hover, click morph, pointer gaze | Already implemented | Unframed v0.3.0 presentation, clearer interaction hint and keyboard/touch operation; same behavior underneath. |
| Visual variety on entry | Implemented but poorly exposed | Six selectable existing identities and visual expressions in optional hero disclosures. |
| Editor expressions, palette and motion discovery | Implemented but poorly exposed | Pose tiles, early palette controls, section jumps, selected hue + Auto; motion stays beside preview. |
| Rich one-click hero shape/color controls | Missing on homepage | Full editor remains one click away with current config; intentionally kept out of the compact hero. |
| Five interface compositions | Already implemented | Consistent surfaces/selection feedback; repaired source downloads. Checked-in examples, **not five published packages**. |
| Avatar wall | Already implemented | Existing local placement, dialog, zoom and persistence retained. Upstream shared wall backend intentionally excluded. |
| Agent lifecycle, recording, replay, sampled motion | Implemented but poorly exposed | Interactive homepage preview + direct Studio Motion entry. Existing typed APIs and Studio retained; no upstream equivalent in inspected routes. |
| Static SVG/PNG and recording-driven MP4 | Already implemented | Preserved and verified; new README media uses the existing sampler. |
| Polished animated README demo | Missing | Added 5.53s GIF, static poster, matching original MP4 and importable recording. |
| Current docs and local setup | Implemented but poorly exposed | Clear developer links and accurate metadata; local tarball installation stays explicit. |
| npm distribution, hosted SVG API, shadcn registry, extra framework/native SDKs | Intentionally excluded | Upstream offers distribution/service paths; whoami remains source-only with a loopback endpoint and no new SDK work. |
| Real agent monitoring, approval backend, scene video export | Intentionally excluded | Simulated/caller-supplied activity and experimental manual scenes remain clearly labeled. |

## Review artifacts

- [Homepage desktop comparison](../../assets/visual-parity-v0.3.1/compare-home-1440.png)
  and [mobile comparison](../../assets/visual-parity-v0.3.1/compare-home-390.png).
- [Editor desktop comparison](../../assets/visual-parity-v0.3.1/compare-editor-1440.png)
  and [mobile comparison](../../assets/visual-parity-v0.3.1/compare-editor-390.png).
- [Restored homepage screenshots and three-way comparisons](../../assets/visual-parity-v0.3.1/restored/)
  supersede the first-pass homepage images.
- [First-pass screenshots](../../assets/visual-parity-v0.3.1/after/) include all requested
  routes at 1440, 390 and 320 pixels; full homepage, recorded preview, wall,
  expression and palette captures supplement the viewport shots.
- [Baseline screenshots](../../assets/visual-parity-v0.3.1/before/) and
  [upstream screenshots](../../assets/visual-parity-v0.3.1/upstream/).
- [GIF](../../assets/whoami-activity-demo.gif),
  [poster](../../assets/whoami-activity-poster.png),
  [original MP4](../../assets/whoami-activity-demo.mp4),
  [recording JSON](../../assets/whoami-activity-demo.recording.json).

Viewport comparisons use reduced motion for stable captures. Supplementary full
Studio captures show the exercised Activity/Motion/MP4 workflows. Interaction tests
exercise full animation and coarse-pointer/touch contexts. Disabled Play in those
still captures is intentional; manual states remain available.

The GIF is 768×432, 83 frames, 5.53 seconds, **89,749 bytes**. The MP4 is 5.5
seconds, 165 frames at 30 fps. Both use identical fixed-time SVG samples of atlas,
mira and cedar; the GIF uses every second rendered frame with GIF centisecond
rounding. A one-second terminal hold makes the return to idle comfortable; it is
not a mathematically seamless morph loop. Every phase is also written in text.
The poster and README explain the progression without requiring animation.

Media reproduction: after building and starting the local site, run
`node scripts/render-visual-demo.mjs`, then
`python3 scripts/assemble-visual-demo.py` in an environment with Pillow. Pillow is
an offline media-assembly tool, not a project dependency. The script composes
labels/cards around `demoMotion.svgFor`; it never authors avatar paths. Existing
WebCodecs and the already-pinned MIT muxer encode the original MP4. The public
Studio exporter and its frame contract are unchanged.

## First-pass verification (`96af0a3`)

[Machine-readable results](../../assets/visual-parity-v0.3.1/verification.json)
and [demo decode metadata](../../assets/visual-parity-v0.3.1/demo.json).

| Check | Result |
| --- | --- |
| `npm ci`, build, typecheck | Pass; exact locked dependencies, no new runtime library. |
| `npm test` | 46/46; identity, geometry, motion, events, recordings and existing package contracts. |
| `npm run check:release` | Pass; pinned renderer/fonts, licenses, lock integrity and source hygiene. |
| `npm run test:browser` | 30 check groups pass; all shapes/poses, actual SVG/PNG pixel parity, editor pins/share/export, wall persistence, components, gaze, morph, idle motion, keyboard and reduced motion. |
| `visual-parity-browser.mjs` | 9 check groups pass; new preview, stable IDs, manual states, playback/offscreen pause, reduced motion, touch, control navigation, palette recovery, source downloads and route widths. |
| `npm run test:studio` | 16 check groups pass; complete lifecycle, valid/invalid JSON import, export, replay/seek, mobile touch and identity preservation. |
| `npm run test:motion:browser` | Chrome + WebKit: 11 groups and 700 containment samples each. |
| `npm run test:mp4:browser` (Chrome) | Genuine 512/1024 export and native decode, 900-frame limit, cancellation/fault cleanup, unsupported fallback, mobile and reduced-motion behavior. Sample PSNR >43 dB. |
| `npm run test:consumer` | Separate installed tarball: ESM, SVG, React SSR, TypeScript, browser bundle, activity/motion/scenes and optional MP4 capability checks pass. |
| Layout inspection | All seven requested local views at 1440/390/320: no page horizontal overflow or important clipped controls. Long code/table content scrolls within its container. |
| Historical boundaries | No changes to library `src/`, package exports/version/lock, vendor renderer, fixtures, notices or historical assets/releases. |

Browser: Chrome 155.0.8059.79; motion also checked with Playwright WebKit 26.5.
These are browser and emulated viewport checks, not a physical-device certification.
Browser tests now allow separate media output directories to preserve earlier
release evidence. Obsolete UI-copy assertions were updated; identity/geometry
expectations and fixtures were not changed.

## Remaining gaps and recommendation

The homepage delegates detailed shape/color work to the editor. Gallery source
still needs its helpers, pinned vendor code, styles and a React build environment;
it is not a standalone published component bundle. No hosted API, shared wall,
new framework SDK or automatic agent integration was added. The optional pinned
`mp4-muxer@5.2.2` maintenance caveat remains as documented for v0.3.0. A GIF cannot
honor a system reduced-motion preference, so the static poster is linked beside it;
the website preview does honor that preference.

**Recommendation:** review the restored homepage linked above before considering a separate
v0.3.1 source-release preparation step. That later step would set release metadata
and perform any required independent review. This branch is ready for owner
visual review; it is not a published or owner-approved v0.3.1 release.
