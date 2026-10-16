# Provenance and scope

## Source boundary

whoami v0.1.0 extracts the existing preview at checkpoints c7c3b7fc565d7e0b112976fdf2378f725bd80043 and 5e0869f4d36d7892072bd683f65eb3f5800bdf82 into a standalone source tree. It preserves the previously approved Blobatar renderer and optional scenes. It does not migrate or modify original Blinkling generation data, packages, worktrees or history. The original v0.1.0 preparation used a private repository and draft release. The repository is now public; GitHub publication remains separately controlled. No npm publication or production deployment is included.

## Reused work

Alain00/blobatar, pinned at a7fd546ebede49d0a9fa638945b9e534489782a2: exact renderer geometry, expressions, palettes, keyed traits/hash, motion CSS and gaze implementation, MIT Copyright (c) 2026 Alain. Full original license is at website/preview/vendor/blobatar/LICENSE. File/source hashes are retained in website/preview/reference-manifest.json; Destination descriptions identify current adaptation surfaces. Exact-byte entries are checked by tests. The React gaze hook changes its import path and retains its banner.

The website layout, editor controls, exports, caret mirror, wall interaction, chat grouping and compositions adapt the upstream MIT website. Source banners and website/preview/THIRD-PARTY-NOTICES.txt retain attribution. Hero reaction timing follows the upstream implementation. The standalone release changes packaging, examples, run commands and release copy without changing avatar geometry or trait constants.

SparshKaushik/blobatarling at 8cb2ddecb5a5c33fbf7c1b4b2b846ee5c9439697: selected compatible scene, playback, DOM binder, activity/laptop modules. Original author Alain, maintained by Sparsh Kaushik, additions authored by Khai. Exact fork MIT license and source/adaptation hashes are retained in website/preview/vendor/blobatarling-scene/{LICENSE,SOURCE.json}. Relative imports are adapted; color.ts extracts the unchanged mixPalettes utility. Scene tests verify recorded bytes. No agent event infrastructure is copied.

Geist and Geist Mono: locally served font subsets from the pinned Blobatar site. SIL OFL 1.1, Copyright (c) 2023 Vercel in collaboration with basement.studio. Font hashes and exact license are in website/preview/public/fonts/{SOURCE.json,OFL.txt}.

## Authored here

The configuration boundary, revisioned sharing, status-label mappings, React lifecycle wiring, semantic HTML adaptations, local persistence, packaging, TypeScript declarations, standalone examples, documentation and release checks were authored or adapted for Talarurus under its MIT license. These do not imply independent artwork, a legal clean room, upstream endorsement or independent acceptance review.

## Dependencies

The SVG entry bundles the existing renderer with no runtime dependencies. React is optional for static SVG consumers and a peer for the React entry. React/ReactDOM 19.2.0 and scheduler 0.27.0 (MIT) are bundled into the website, whose built notices retain their licenses. React remains external in the package's React entry.

Development dependencies are exact in package.json; all transitive versions and registry integrities are locked in package-lock.json. Existing esbuild 0.25.11 (MIT) compiles TS/JSX and bundles; TypeScript 5.9.3 (Apache-2.0) checks the declarations/example; Playwright 1.62.1 and playwright-core (Apache-2.0) run browser checks; @types/react and @types/react-dom 19.2.2, csstype 3.2.3 (MIT) supply types. esbuild platform packages 0.25.11 and optional fsevents 2.3.2 are MIT. No copyleft dependency is included. Playwright browsers are QA tools and are not redistributed. Lock licenses/integrities are checked by scripts/check-release.mjs. Full runtime/font/upstream notices are retained in root THIRD-PARTY-NOTICES.txt and build outputs.

One added declaration dependency, @types/react-dom, enables the buildable TypeScript React example. No new runtime library is introduced. npm replaces the parent pnpm workspace only in this standalone repository.

## v0.2.0 development additions

Owner-authorized development begins at the unchanged v0.1.0 tag (f37d194). No upstream renderer, scene module, notice, font or identity fixture is rewritten. The new framework-neutral activity engine, schema, ordering/lifecycle validation, deterministic event replay, React subscription binding, Studio and typed examples are first-party work. AgentScene adapts the already-present manual demo’s binding, visibility handling and playback into an event-driven public component; the laptop art, expressions, still frames and animation are reused Blobatar/Blobatarling functionality, not new differentiation. No event engine was copied from upstream.

New production TypeScript (including the Studio) is strictly checked; library declarations are emitted from its source. Existing Face and SVG implementation/declarations remain unchanged to preserve the release boundary. New activity/scene subpath exports keep optional scenes outside ordinary SVG/React avatar bundles. No runtime dependencies are added. The development and refinement verification records retain their original prerelease context. Release metadata is now prepared as 0.2.0, with npm publication still disabled by package.json private=true. v0.1.0 validation remains a historical record; current release preparation is in releases/preparation-v0.2.0.md.

The final v0.2.0 refinement adds first-party bounded JSON recording serialization/validation and focused Studio usability/file controls. It reuses the existing engine/event schema, not a second state system. No renderer, activity engine, artwork, license or font bytes change in this refinement. An owner-authorized separate agent performed read-only technical review and recording probes; this is distinguished from human or owner acceptance in refinement-v0.2.0.md.

## v0.3.0 development milestone

This section describes the original motion checkpoint. The subsequent MP4 work
is recorded separately below.

The owner authorized production motion development from the unchanged v0.2.0 release commit `1e1530f38db1d533227d30fe1659e71417c9c317`. The experiment at `9254098` remains on its branch; only its proven time-sampling approach is ported. The new typed motion compiler, optional React recorded avatar and Studio motion controls are first-party work. They reuse existing pinned Blobatar poses, geometry, baking, palette helpers and stable raw identity seeds. No Bloub code, measured xAI profiles, eyes, geometry, animation constants or artwork are copied. Existing engine/recording implementations, fixtures, upstream bytes and notices are unchanged; no generation migration occurs. Metadata `0.3.0-dev.0` identifies local development, not a release. No runtime dependencies, encoder or muxer are added. Browser QA downloads remain ignored and are not packaged.

## MP4 development checkpoint

Owner-authorized export extends `bf51b0c` on develop/v0.3.0. The frame compositor,
bounded seekable sink, WebCodecs adapter and Studio controls are first-party code.
Existing compiled motion/renderer and identities are reused unchanged. Optional
export bundles lazy `mp4-muxer@5.2.2` (Vanilagy, MIT), with original copyright and
license appended to notices. No renderer, artwork or Bloub material is copied.
Muxer is pinned in development dependencies; its type dependencies are not part
of consumer runtime requirements. Upstream deprecation/maintenance risk is
documented in mp4-export.md. No release/tag/publication occurs.

## v0.3.0 release preparation

Metadata preparation starts at approved implementation commit
`1f19df17f1e233b79ba5b47168539fd9b92b027b` on clean develop/v0.3.0.
The owner approved desktop/mobile Studio and the actual 512×512 MP4. Package/lock
metadata is now 0.3.0 with private:true; this does not publish anything. Motion,
MP4 implementation, artwork, renderer bytes, identities, fixtures, licenses and
existing media evidence remain unchanged. Historical checkpoint sections above
retain their original context. Release copy and version labels are updated only.
Pinned deprecated MIT mp4-muxer 5.2.2 is deliberately retained, with maintenance
risk disclosed; no dependency replacement occurs. Final validation/publication
proposal is in releases/preparation-v0.3.0.md. Publishing requires separate approval.

## v0.3.1 visual pass (owner review)

Owner-authorized local visual work starts from published v0.3.0 commit
`629c32397057eba7719ab8fe8bb3544a1f985d47`. The homepage, editor discovery,
component presentation and current-page copy are refined. A first-party homepage
preview and README demo reuse the existing recording compiler and SVG sampler,
with unchanged raw identities. New media frames add only surrounding text/cards;
all character geometry remains pinned upstream artwork. The local website build
also exposes the gallery's advertised source files and their existing helpers.
No public library implementation, identity fixtures, vendor bytes, licenses,
historical releases or company website are changed. No new dependency is added.
Package metadata remains 0.3.0 pending separately authorized release preparation.
See reviews/visual-parity-v0.3.1.md for comparison, evidence and the owner approval
gate. No independent review is claimed.

## v0.3.1 release preparation

The owner approved the restored homepage at 1440, 390 and 320 pixels at
`0d6e0f78225264d9ba5bd6195a3fc9297bc606bb`, then authorized release preparation.
Package/lock metadata and current website labels are now 0.3.1 with private:true.
The approved layout, all artwork, identities, fixtures, APIs, dependencies, notices
and demo assets are preserved. Attribution remains as recorded above: pinned
Blobatar/Blobatarling MIT artwork, Geist OFL fonts and optional MIT mp4-muxer.
Historical review sections retain their checkpoint context. This preparation adds
release copy and verification only; no independent review is claimed. See
[release preparation](releases/preparation-v0.3.1.md). GitHub publication requires
separate authorization; npm publication and deployment are outside this release.
