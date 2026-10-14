# Future MP4 frame contract · proposal, no encoder implemented

The available frame boundary is `CompiledMotion.sampleAll(playbackMs, options)`
for scene metadata and `CompiledMotion.svgFor(agentId, playbackMs, svgOptions)`
for an existing avatar's static vector frame. Future composition should consume
those methods, not capture the Studio DOM, advance a live engine or wait for rAF.
The React component and Studio use this same core.

Proposed first export: 30 fps, square 1024×1024 for one selected agent, or a fixed
grid whose roster/order/layout is part of export configuration. Dimensions must
be bounded even integers, initially 64..2048 per axis. Matte must be an explicit
opaque six-digit hex color and filled before every raster frame; SVG remains
transparent outside its marks. Background compositing belongs to the exporter,
not recording data or identity generation.

Use `t(i) = i * 1000 / fps` milliseconds directly, not accumulated delta time.
Encoded timestamps are `round(i * 1_000_000 / fps)` microseconds with duration
equal to the next timestamp difference. Proposed duration is motion.durationMs
plus a fixed 1000 ms terminal hold, avoiding a final frame that stops partway
through a morph. Emit `ceil(durationMs * fps / 1000)` frames, each timestamp less
than that duration. Explicit zero-event exports can produce a bounded idle still
clip. Looping, reverse playback and variable speed require a separately specified
time mapping; the first export need not inherit current Studio playback speed.

Export input must retain motion/identity revisions, complete recording, origin,
resolved policy, roster, dimensions/layout, matte, duration/hold, frame rate and
reduced-motion choice. Select `reducedMotion` explicitly rather than reading the
OS midway through export. Include a poster/static alternative and a readable
event transcript; the host video player needs controls and a reduced-motion
autoplay policy. Text captions/layout are separate composition inputs.

The future async frame consumer must check an AbortSignal before each sample,
rasterization and encoder submission, apply backpressure to bound raw-frame
memory, release each VideoFrame after submission and close/cancel the encoder,
canvas/image resources and object URLs in failure/cancellation paths. Progress
and errors must not change the source recording or live session. Re-rendering
the same frame after cancellation must still work.

Feature-detect the requested encoder configuration, not just the presence of
VideoEncoder. Browser/OS codec support, secure-context requirements, encoder
availability, colored-edge/chroma fidelity and resulting file sizes require
separate qualification. Encoder and muxer dependencies must stay lazy and outside
ordinary SVG/activity/motion imports. Frame values/timestamps can be deterministic
while raster pixels or compressed bytes vary by engine/hardware. No encoder,
muxer dependency, video export button or production exporter is added here.
