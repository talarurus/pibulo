# MP4 frame contract · whoami-mp4-grid-1

Implemented by the optional `@talarurus/whoami/export/mp4` entry, consuming
unchanged `CompiledMotion.sample`/`svgFor`. It never captures Studio DOM, advances
a live engine, uses rAF or records the screen.

## Timing and composition

`createMP4Plan` freezes export configuration. Defaults: 30 fps, 1024×1024, opaque
`#0a0a0b`, all agents in registration order, reducedMotion:false. `agentIds`
selects/orders 1..8 unique registered agents. Grid columns are ceil(sqrt(count)),
rows ceil(count/columns); cells never move with state. Existing avatar marks have
escaped, width-truncated names and readable status labels. Task descriptions
are currently excluded. Arial/sans-serif text means installed fonts affect pixels.

Sample `t(i) = i * 1000 / 30` milliseconds directly. Encode timestamps
`round(i * 1_000_000 / 30)` µs; duration is the next timestamp difference. Requested
duration is motion.durationMs + 1000 ms final hold. Emit ceil(duration * 30 / 1000)
frames; clip duration rounds up to whole frames. Empty events produce one second
idle. Preview cursor/speed, refresh rate and OS changes during export do not affect
frames. Reduced motion is an explicit frozen choice.

Even dimensions 64..2048 per axis; duration including hold ≤30 seconds/900 frames;
file ≤64 MiB; matte is six-digit opaque hex, included in SVG and painted before
rasterization. Tiny sizes are thumbnails; larger sizes are needed for readable
text. Studio offers square 512/1024 presets and the full roster. Long recordings
are rejected, never silently trimmed or retimed.

Reproduction inputs: complete recording and pinned identity revision, compiled
motion revision, origin/resolved policy, frozen export plan with roster/order,
size, matte/reduced motion/composition revision, and frame index. `mp4FrameSVG`
is the pure composition oracle; `mp4FrameTiming` exposes time/duration. Equivalent
inputs produce identical SVG and timestamps. Browser rasterization/fonts, chroma
subsampling and encoders can change pixels/bytes. CSS idle loops, pointer gaze and
companion animation are excluded.

## Codec, cancellation and resources

Probe actual DOM/VideoFrame/VideoEncoder and requested H.264 configuration.
Try AVC baseline/main/high, levels 4.0 or 5.1 selected by macroblock/pixel rate.
AVC chunks, 30 fps, bounded 2..24 Mbps bitrate, keyframe every second.
`latencyMode:'realtime'` limits reordering; it does not drive sampling time.

WebKit 26.5 truncated submitted 4,033,333 µs to 4,033,332 µs. Accept only ±1 µs
from the next expected frame and write original contract PTS/duration to MP4.
Larger changes, duplicates, dropped/reordered frames fail. This necessary bounded
normalization is far smaller than 33,333 µs frame separation and preserves timing.

One export per module instance. Flush after at most four frames; close each
VideoFrame immediately after submission. One canvas/image at a time. AbortSignal
checks surround sampling, rasterization, flush/finalization. Async operations time
out after 15 seconds (profile probes after five). Observer exceptions are isolated.
Every path closes the encoder, releases images/URLs, zeros canvas, clears pages
and drops muxer references. Studio aborts on unmount/recording replacement and
revokes downloads.

Lazy MIT `mp4-muxer@5.2.2` writes regular fast-start MP4 with known-frame metadata
reservation. A bounded seekable page sink handles rewrites; concatenating stream
callbacks would corrupt MP4. Raw frame sequences and a second complete muxer media
buffer are not retained. Encoded bytes, pages and Blob are bounded; transient
browser copies/codec buffers mean 64 MiB is a file cap, not total RAM.

The API returns a video/mp4 Blob without downloading/autoplay. Hosts own controls,
URL cleanup, privacy review and static/transcript alternatives. No audio, subtitles
or alt-text metadata. Encoding may fail after a positive probe. See
[API and qualification](mp4-export.md).
