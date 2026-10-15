# MP4 export · v0.3.0 development

Optional `@talarurus/whoami/export/mp4` exports recorded agent motion locally
using the existing deterministic sampler and identity artwork.

```ts
import {compileMotionRecording} from '@talarurus/whoami/motion';
import {exportMP4, checkMP4Support} from '@talarurus/whoami/export/mp4';

const compiled = compileMotionRecording(recordingJSON, {originMs: 0});
if (!compiled.ok) throw new Error(compiled.error);
const options = {width: 512, height: 512, background: '#0a0a0b',
  reducedMotion: false};
const support = await checkMP4Support(options);
if (!support.supported) throw new Error(support.reason);
const controller = new AbortController(); // connect Cancel to abort()
const video = await exportMP4(compiled.motion, options, {
  signal: controller.signal,
  onProgress: ({phase, completedFrames, totalFrames}) => {
    console.log(phase, completedFrames, totalFrames);
  },
});
// Explicit download: createObjectURL(video.blob), revoke when done.
// video.plan describes dimensions, roster, duration and fixed timing.
```

[Typed example](../examples/activity/mp4.ts). `createMP4Plan`, `mp4FrameTiming`
and `mp4FrameSVG` expose plan, microsecond timing and pure frame oracle.
`MP4_LIMITS` lists bounds. Strict plain options: width, height, background,
ordered agentIds and reducedMotion; unknown/accessor fields fail. Result: Blob,
plan, codec, encodedBytes (media bytes excluding container overhead). Progress:
checking/rendering/finalizing. `MP4ExportError.code`: invalid-options, unsupported,
busy, cancelled, render-failed, encode-failed, output-limit or timeout.
Node capability detection returns unsupported without opening/importing codecs.

Studio adds 512/1024 presets, progress/cancel and explicit download within the
approved dark layout. Reduced motion disables preview play and settles poses for
manually requested export. Preview speed/position and live sessions are preserved.
The UI warns that caller labels/task information may appear in exported media.

## Dependencies

WebCodecs supplies H.264. MIT `mp4-muxer@5.2.2` is a pinned development dependency,
bundled in a lazy optional chunk with retained package/site attribution. Its two
dependencies are types; no runtime codec or service is installed. Core, activity,
recording and ordinary motion entries exclude video code. Public declarations
use a structural encoder configuration, needing no consumer WebCodecs type package.

Upstream [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) is deprecated in favor
of Mediabunny. This narrow pinned MIT muxer avoids a larger media stack and its
different MPL license. Maintenance is a documented risk to reassess before
long-term release support. No Bloub code/design is reused. Support follows actual
[WebCodecs configuration](https://www.w3.org/TR/webcodecs/), secure context and
device capabilities, not browser names.

## Verification and artifacts

Extends approved `bf51b0c` on develop/v0.3.0. Historical tags, experiment branch,
renderer bytes, APIs, fixtures and old screenshots are preserved. QA is by the
implementation agent, not independent owner acceptance. No publication/deployment.

Qualification used Node 24.21.0/npm 11.19.0, Playwright 1.62.1 and macOS native
AVFoundation. [Machine-readable results](mp4-verification.json) retain codec
probes, decoded metadata, hashes, resource metrics and fidelity measurements.

| Check | Result |
| --- | --- |
| Build, strict production/website/example types, release hygiene | PASS |
| Unit suite | 46 passed; six MP4 groups plus unchanged identity/activity/recording/motion checks |
| Installed independent tarball | ESM/SSR, deterministic plan/SVG, Node unsupported behavior, types and split browser bundle PASS |
| Chrome 155.0.8059.79 | Genuine H.264 export, playback, download and UI checks PASS |
| Playwright WebKit 26.5 | Genuine H.264 export, playback, download and UI checks PASS |
| Probe at 512/1024 | AVC baseline level 4.0, avc1.420028; 2048 also exported at the larger configured level |
| Three-agent clips, each engine | 512/1024, 114 decoded frames, 30 fps, 3.8 seconds |
| Empty recordings, each engine | 64/2048, 30 decoded frames, one second |
| Maximum duration, each engine | 64, 900 decoded frames, 30 seconds; over-limit plan rejected |
| Studio download, each engine | 512, 216 decoded frames, 7.2 seconds |
| Frame fidelity at 0/57/113 | All opaque; foreground mean absolute RGB error ≤1.13/255; PSNR ≥43.57 dB |
| Failure and cleanup | Missing APIs/unsupported codec, concurrent export, cancel after five frames, raster/encoder/timestamp/output-limit failures; no open frames, encoders, image URLs or canvases afterward |
| Studio lifetime and mobile | Completed URL revocation and active unmount cancellation; desktop, 390/320px, touch export, desktop cancel, reduced-motion manual action PASS |
| Historical SVG/PNG parity | Seven baseline/current SVG strings equal; zero decoded PNG differences in each engine; pinned renderer hashes unchanged |

AVFoundation independently parsed and decoded every frame in twelve final files
(2,808 frames total), with dimensions, 30 fps, expected duration, increasing PTS
and frame count asserted. ffprobe was unavailable; the native inspector is
`scripts/inspect-mp4.swift`, with assertions in `scripts/check-mp4-inspection.mjs`.
Container rational PTS differs from rounded input µs by <0.334 µs, and frame
interval error is <10⁻¹² seconds. The committed sample is 99,462 bytes, 512×512,
114 frames, 3.8 seconds, H.264/MP4. Other 512 samples were 97,252 bytes (WebKit);
1024 samples were 204,769/197,513 bytes (Chrome/WebKit). These sizes are examples,
not guarantees across recordings/devices. Decoder comparisons are within each
engine, not a cross-engine pixel-equality claim.

The 900-frame run exposed test timeout sensitivity under heavy host load. API
qualification now runs on an otherwise empty same-origin page, and UI waits
allow active exports to finish. Product per-operation timeouts remain bounded.
Motion regression retained 700 silhouette samples and all eleven browser groups
per engine. Fresh screenshots were visually inspected without changing the
approved layout or historical screenshots.

Run `npm run build`, `npm run typecheck`, `npm test`, `npm run check:release`,
`npm run test:mp4:browser` (after `npm start`) and `npm run test:consumer`.
Browser tests use the same pinned Chrome/WebKit setup as the motion milestone;
`PREVIEW_URL`, `PLAYWRIGHT_BROWSERS_PATH` and optional `MP4_BROWSER` select QA
configuration. Decode final files with Swift on macOS, then run
`node scripts/check-mp4-inspection.mjs`. Raw outputs stay under ignored test-results.

[Desktop](../assets/studio-mp4-desktop.png)
· [Mobile, reduced motion](../assets/studio-mp4-mobile.png)
· [Playable three-agent sample](../assets/motion-export-demo.mp4).

## Limits and next review

30 fps, one second final hold, 1..8 agents, even 64..2048 dimensions, maximum
30 seconds/64 MiB. No audio, captions, scene animation or automatic export.
H.264 is lossy; SVG/timestamp determinism does not imply identical video bytes.
Playwright WebKit does not certify every Safari/iOS device; no physical mobile,
Firefox, screen-reader or hardware matrix certification is claimed.

Review imported recordings, label/status readability, reduced-motion manual export
and target-device downloads/playback. Final release needs owner functional/visual
acceptance and a muxer maintenance decision. Accessibility sidecars, broader codec
qualification and worker isolation remain potential follow-up work.
