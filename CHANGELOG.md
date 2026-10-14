# Changelog

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
