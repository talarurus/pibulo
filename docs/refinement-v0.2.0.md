# v0.2.0 final refinement and technical review

Work began on `develop/v0.2.0` at the expected clean baseline `4abff75044c6b3055741d16be9a5885edd2d1b66`. No unrelated changes were present or overwritten. The existing v0.1.0 commit/tag, renderer, identity fixtures, font and license bytes remain unchanged. This refinement also leaves the activity engine, React binding and optional scene implementation unchanged.

## Exact changes

- Mobile agent selection is a compact horizontal selector with familiar faces, state badges, visible IDs, pressed/selected indication and 44px native buttons. One/two-agent rosters fill the row; longer rosters scroll. Long names/IDs truncate visually while full text remains available. Duplicate display names have ID-qualified accessible selection labels.
- Replay has a prominent control bar and an explicit Live session / Replay mode announcement. Timeline rows use readable event labels and open details containing type, message, agent, task ID, sequence and timestamp. Previous/Step, the native range and Arrow/Home/End row navigation use the existing replay-prefix mechanism. Live state remains preserved.
- Product copy explains stable ID → familiar identity versus events → changing activity, and makes caller responsibility explicit. Simulated and imported sources are disclosed accurately.
- A framework-neutral `/recording` package export adds versioned JSON serialization/import. Both validate the envelope, pinned identity contract, roster, bounds and every event through a fresh engine; there is no alternate state machine or unchecked snapshot hydration.
- Studio supports local recording download/upload, with task-information warnings, strict UTF-8 decoding, bounded reads, atomic session replacement, persistent import errors, and safe continuation after imported future timestamps. Generated integration snippets quote imported IDs/names safely.
- New typed examples, generated declarations, recording unit tests, focused browser checks and installed-tarball checks cover the new boundary. No dependency is added.

The dark design, fonts, avatar geometry, palettes and laptop artwork retain the approved direction and existing attribution. No renderer generation, new artwork, backend, cloud storage, account, telemetry, automatic persistence, native app or agent monitoring is added.

## Recording contract

The version 1 envelope contains `format: "whoami-recording"`, `version: 1`, `eventVersion: 1`, `initialState: "idle"`, pinned Blobatar `identity` revision/normalization, ordered `agents` and ordered accepted `events`. Exact agent IDs seed identity in raw mode; display names do not change the seed.

SDK limits: 1 MiB UTF-8, 1,000 events and 32 agents. Studio limits: 256 KiB, 120 events and 8 agents. Existing event string bounds remain 128 UTF-16 units for IDs/names/task IDs and 512 for messages, without controls or malformed Unicode. Callers may only lower SDK limits.

`serializeRecording({agents, events})` returns `{ok:true,json,recording}` or a helpful failure; it also validates and re-exports an ActivityRecording directly. `parseRecording(json)` returns `{ok:true,recording,engine}` only after complete validation/replay. Failures expose no partial engine and cannot change the caller’s current session. Original arrival order is retained; no sorting or inferred events are introduced.

See [API details and JSON envelope](api.md#json-activity-recordings--version-1) and [the typed recording example](../examples/activity/recording.ts).

## Separate-agent technical review

The owner explicitly authorized independent technical review in the final-refinement request. Implementation: root agent. Reviewer: separate `technical_review` agent, working read-only, with no file edits or delegated implementation. This is independent of the implementation agent; it is not a human review, screen-reader certification or owner acceptance.

Reviewed lifecycle correctness; agent/task isolation; stale, duplicate and out-of-order events; deterministic replay and recording boundaries; React external-store subscriptions and listener/playback/observer/media cleanup; generated declaration/consumer compatibility; accessible native controls, state announcements and reduced motion; untrusted import/export; pinned identities; and MIT/font/runtime attribution completeness.

The reviewer performed in-memory probes for round trips, independent agents sharing task IDs, input lifecycle, terminal/reused task IDs, missing starts, duplicate/out-of-order sequences, unknown agents/prototype names, unsupported versions/revisions, malformed JSON and lowered byte/event limits. The reviewer independently ran all eight recording tests successfully, checked direct recording re-export and fatal UTF-8 decoding, and reviewed the final long/duplicate-name mobile changes.

**Findings: no blocking defects confirmed.** No baseline engine or renderer change was needed. Nonblocking limitations:

- Live engine callers must keep task IDs unique across resets; the recording boundary enforces this per agent across the entire imported/exported sequence.
- Serialization can establish replayability from idle but cannot prove a caller retained every earlier valid event. Full accepted recordings remain caller-owned; an evicted history tail can be incomplete.
- An agent imported at the maximum safe-integer sequence cannot accept another event. Rejection is safe; New session restores operation.
- Desktop Chrome and emulated mobile/touch checks do not certify physical devices, other browser engines or screen readers.

During implementation verification, direct re-export of the typed ActivityRecording was made ergonomic and metadata-safe, imported timestamps/task IDs were handled without inventing a second state system, and long/duplicate display names were kept compact and distinguishable. An initial focused browser check used an exact name that omitted the existing editor button’s arrow; only the test locator was corrected.

## Verification

Environment: macOS, Node 24.21.0, npm 11.19.0, React 19.2.0, Google Chrome 155.0.8059.40.

| Check | Result |
| --- | --- |
| `npm run build` | PASS; new ESM recording entry and declarations, existing SDK and website |
| `npm run typecheck` | PASS; strict production modules, Studio and examples |
| `npm test` | PASS; 33 tests, including 8 new recording tests and all unchanged identity/render/scene tests |
| Reviewer recording tests | PASS; 8/8, run separately by the review agent |
| `npm run check:release` | PASS; pinned hashes, notices/licenses, lock and source hygiene |
| `npm run test:studio` | PASS; 15 focused checks plus no runtime errors |
| Studio/browser scope | Lifecycle/isolation, replay/pause/step/seek, keyboard event navigation, clipboard, reduced motion, offscreen pause, 320/390/768/1440px layouts, compact touch selector, long/duplicate imported names, bounded recording capacity |
| Recording/browser scope | Desktop/mobile download/import round trips; malformed/unsupported/unordered/oversized/invalid-UTF8 files preserve the current session; custom identities and imported future timestamps remain usable |
| Editor regression | PASS; existing share links, exact configured SVG and PNG pixel parity (zero differing decoded channel values) |
| Small-screen docs | PASS; public recording example copies correctly at 320px without overflow |
| `WHOAMI_CONSUMER_OFFLINE=1 npm run test:consumer` | PASS; separate installed tarball, SVG/Face compatibility, activity/scene SSR, recording round trip, malformed JSON rejection, NodeNext TypeScript and application bundles |
| Baseline source comparison | PASS; unchanged activity/React/scenes, legacy SVG/Face APIs, vendor renderer/scene modules, identity fixtures, fonts and notices |
| `git diff --check` | PASS |

Long unrelated historical browser qualification was not repeated. The focused checks cover the changed Studio/files and affected export path. Sandbox loopback/cache restrictions required approved host execution; an already-running loopback preview served the rebuilt website. No source from another Talarurus project was modified.

## Screenshots and owner review

- [Refined desktop Studio](../assets/studio-refined-desktop.png)
- [Refined mobile Studio](../assets/studio-refined-mobile.png)

Open `/studio` locally to review selection, state controls, timeline/replay and file round trips. Recordings stay in memory unless explicitly exported; import replaces the session only after validation.

Technical implementation is ready for an owner-approved v0.2.0 GitHub source release after visual/functional approval and final release metadata/version preparation. The current package remains private `0.2.0-dev.0`. No push, final release/tag, deployment or npm publication has been performed. Stop here for owner approval; no v0.3.0 work is authorized or begun.
