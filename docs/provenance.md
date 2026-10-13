# Provenance and scope

## Source boundary

whoami v0.1.0 extracts the existing preview at checkpoints c7c3b7fc565d7e0b112976fdf2378f725bd80043 and 5e0869f4d36d7892072bd683f65eb3f5800bdf82 into a standalone source tree. It preserves the previously approved Blobatar renderer and optional scenes. It does not migrate or modify original Blinkling generation data, packages, worktrees or history. This release is private GitHub source with a draft release; no npm publication or production deployment.

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
