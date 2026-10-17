# Changelog

## Unreleased · pibulo 0.3.2-dev.0

- Local product rebrand: whoami → pibulo, published by Talarurus. Little faces. Big personalities.
- Source-package imports become `@talarurus/pibulo`; private local tarball distribution remains in effect.
- Existing recording formats, motion/MP4 revisions, artwork, deterministic identities and public API behavior remain compatible.
- Historical releases, tags, media and attribution are preserved. The owner-authorized repository rename to `talarurus/pibulo` is complete; Pibulo release publication still requires separate owner authorization.
- See [migration](docs/migration-pibulo.md) and [verification](docs/reviews/pibulo-rebrand.md).

## 0.3.1 · prepared for GitHub source release

- Owner-approved homepage refinement preserves the large wordmark, generous whitespace, two-column composition, unframed interactive avatar and local installation/live code example.
- Quiet recording-driven preview below the hero exposes existing idle, thinking, working and completed states, with playback/manual seeking, reduced-motion support and a direct Studio Motion link.
- Editor expression thumbnails, earlier palette controls, hue selection/reset, configuration-preserving section navigation and mobile customization jump improve discovery. Incomplete palette input remains recoverable.
- Component source downloads now serve actual checkout files and helpers; existing source-only disclaimers remain. Responsive, contrast and selection feedback improvements are retained.
- README includes the approved recording-driven GIF, static poster, original MP4 and restored homepage screenshots.
- Existing artwork, seed-to-identity mappings, fixtures, public APIs, Activity/Motion Studio and MP4 exporter remain unchanged. No new dependency, framework SDK or hosted service.
- Attribution remains intact: Blobatar/Blobatarling MIT artwork, Geist OFL fonts and optional pinned deprecated MIT mp4-muxer 5.2.2. Existing exporter limits and maintenance caveat still apply.
- Prepared locally; GitHub publication requires separate authorization. npm publication remains disabled. See `docs/releases/preparation-v0.3.1.md` and `docs/releases/v0.3.1.md`.

## 0.3.0 · prepared for GitHub source release

- Optional typed recorded-motion API: validated v1 recordings, explicit origin, immutable tracks, arbitrary sampling, continuous interrupted poses and reduced-motion policy.
- Optional React recorded avatar and system motion preference hook; no clock or gaze in the component.
- Dark Studio Motion mode: shared timestamp, playback speed, pause/restart, keyboard/touch seek and unchanged local JSON recording controls. Planning and execution have distinct text cues.
- Optional typed MP4 export: fixed timestamps, multi-agent opaque composition, WebCodecs H.264 and a lazy MIT muxer, bounded resources, cancellation and runtime capability detection. Studio has 512/1024 presets, progress/cancel and download; existing identities, APIs and pinned renderer bytes remain unchanged.
- SVG samples/timing are reproducible from the complete recording, pinned identity/motion revisions, origin, resolved policy and frame configuration. Browser rasterization, fonts, CSS/gaze and encoded bytes are outside that guarantee; interrupted transitions preserve position, not velocity.
- Chrome 155 and Playwright WebKit 26.5 genuinely encoded and played H.264 MP4. Twelve files/2,808 frames were independently decoded; desktop/mobile Studio and the 512×512 MP4 have owner approval. Physical Safari/iOS and universal codec support are not certified.
- Export bounds: 30 fps, 1..8 agents, even 64..2048 dimensions, 30 seconds including final hold, 64 MiB maximum, opaque matte, no audio/captions/scene animation. Unsupported configurations fail clearly.
- **Dependency disclosure:** pinned MIT `mp4-muxer@5.2.2` is deprecated upstream and retained unchanged. Its lazy optional bundle includes attribution; maintenance/security/compatibility fixes may require a separately reviewed replacement. Ordinary activity/recording/motion entries remain codec-free.
- Owner authorization for GitHub publication remains separate. No npm publication or hosted website is included. See `docs/releases/preparation-v0.3.0.md` and `docs/releases/v0.3.0.md`.

## 0.2.0

### Added by whoami

- Framework-neutral strict TypeScript activity engine: stable exact agent IDs, version 1 caller events, explicit task transitions, immutable snapshots, bounded accepted-event history, per-agent sequence/timestamp and task checks, and deterministic complete-recording replay.
- React `AgentAvatar` and `useAgentActivity`, plus a separate optional `AgentScene` entry. New declarations are generated from checked source; ordinary SVG/avatar consumers do not load scene code.
- Agent Identity Studio at `/studio`: independent agents, task/input/error/reset controls, compact mobile selection, live/replay mode, keyboard timeline navigation, event details, pause/step/seek and copyable integration examples.
- Version 1 JSON recordings with pinned identity/event metadata, complete accepted events, bounded byte/agent/event/string validation, and atomic import through a fresh engine. Studio supports local export/import with privacy notices and strict UTF-8 decoding.

### Reused and preserved

Blobatar supplies the existing deterministic renderer, ten silhouettes, fourteen expressions, palettes, motion and gaze. Blobatarling supplies the already-adapted laptop/hand/badge artwork, activity frames, playback and DOM binding. These are reused upstream features, not new v0.2.0 differentiation. MIT credits and notices remain intact.

Preserves v0.1.0 identity fixtures, renderer bytes, SVG/PNG results, Face API, share links, editor, website and existing compositions. No renderer generation or package rename. The repository is public; `private: true` in package.json intentionally prevents npm publication.

### Status and limits

Owner-requested desktop/mobile visual review passed. Separate-agent technical review found no blocking defects; it does not establish human or screen-reader certification. Final GitHub publication remains a separate approval step. Optional scenes remain experimental. Callers provide events and maintain unique task IDs; bounded history is not durable recording storage. One task per agent, fixed roster per engine, SDK recording limits of 1 MiB / 1,000 events / 32 agents, and narrower Studio limits of 256 KiB / 120 / 8 apply. Browser validation covers Chrome and mobile emulation. No automatic monitoring, backend, cloud storage, telemetry, deployment or npm publication.

## 0.1.0

First standalone GitHub source release of whoami. Extracts the existing website and pinned Blobatar renderer into an independently buildable repository; packages the SVG helper and React Face with declarations/CSS; includes working JavaScript/TypeScript examples, release documentation, retained notices, and focused release checks.

Preserves ten silhouettes, fourteen expressions, 58 controls, deterministic identities, eye tracking, click reactions, editor, static SVG/PNG export, responsive compositions and the local wall. Six manual companion scenes remain optional and experimental. No npm publication, hosted service or agent integration.
