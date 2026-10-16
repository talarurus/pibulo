# Pibulo local rebrand · owner review

Branch: `brand/pibulo-rebrand`. Baseline: published whoami v0.3.1 commit
`5d5a9b3e11f8873e3541fabb7eae11dd05ac33c9`, verified as both the initial
HEAD and the peeled local v0.3.1 tag. The working tree was clean before branching.
The final local commit is the tip of this branch; use `git rev-parse HEAD`.
No history rewrite, tag change, push or external publication was performed.

## Result

The active product is **pibulo** by **Talarurus**, with lowercase wordmark and
positioning **Little faces. Big personalities.** The description is: An open-source
toolkit for expressive AI-agent identities, activity visualization, deterministic
replay and motion export.

Package identity is `@talarurus/pibulo`, version `0.3.2-dev.0`, private:true.
All current imports, examples, website titles, metadata, Studio/editor branding,
download filenames and QA expectations use the new identity. The real repository
URL and clone directory stay `talarurus/whoami` and `whoami` pending separate
rename authorization. The local branch is not yet available from the remote.

[Exact changed files](../../assets/pibulo-rebrand/changed-files.txt) includes every
modified and added path in this commit. [Migration](../migration-pibulo.md) covers
package replacement and all compatibility exceptions.

The approved homepage retains its large wordmark, two columns, unframed avatar,
local installation/code panel and restrained activity preview. No Studio redesign
or new avatar generation occurred. Existing layout styles are byte-identical
except the product name in one comment. Desktop/mobile captures were visually
inspected against the retained homepage and Studio evidence. This implementation
self-check is not independent review or owner acceptance; no subagents were used.

## Screenshots

| Surface | Desktop 1440 | Mobile 390 | Narrow mobile 320 |
| --- | --- | --- | --- |
| Homepage | [image](../../assets/pibulo-rebrand/home-1440.png) | [image](../../assets/pibulo-rebrand/home-390.png) | [image](../../assets/pibulo-rebrand/home-320.png) |
| Activity preview | [image](../../assets/pibulo-rebrand/recorded-preview-1440.png) | [image](../../assets/pibulo-rebrand/recorded-preview-390.png) | [image](../../assets/pibulo-rebrand/recorded-preview-320.png) |
| Editor | [image](../../assets/pibulo-rebrand/editor-1440.png) | [image](../../assets/pibulo-rebrand/editor-390.png) | [image](../../assets/pibulo-rebrand/editor-320.png) |
| Studio Activity | [full page](../../assets/pibulo-rebrand/studio-activity-1440.png) | [full page](../../assets/pibulo-rebrand/studio-activity-390.png) | [full page](../../assets/pibulo-rebrand/studio-activity-320.png) |
| Studio Motion | [full page](../../assets/pibulo-rebrand/studio-motion-1440.png) | [full page](../../assets/pibulo-rebrand/studio-motion-390.png) | [full page](../../assets/pibulo-rebrand/studio-motion-320.png) |

Captures use Chrome 155.0.8059.80 and reduced motion. All 12 captured pages fit the
viewport without horizontal overflow or page errors; the three preview captures
show existing idle poses. Full Studio captures include the existing avatars and
controls. [Capture metadata](../../assets/pibulo-rebrand/capture.json).

## Validation

Environment: Node 24.21.0, npm 11.19.0, Google Chrome 155.0.8059.80 and installed
Playwright WebKit 26.5. No dependency/browser upgrade was made.

| Check | Result |
| --- | --- |
| `npm ci --offline --no-audit --no-fund` | PASS, exact lockfile installation |
| `npm run build` | PASS, library/declarations/website |
| `npm run typecheck` | PASS, production, website and examples |
| `npm test` | PASS, 46 tests, zero failures/skips |
| `npm run check:release` | PASS, private development identity, pinned hashes/notices, dependency licenses/integrities, source hygiene |
| `PIBULO_CONSUMER_OFFLINE=1 npm run test:consumer` | PASS, separate installed tarball, all JS entries, CSS/TS consumer bundles, SVG hash/identity, SSR, engine/replay/recording/motion/scenes and MP4 planning |
| Historical recording consumer probe | PASS, unchanged whoami v1 recording imports and re-exports with identical JSON data |
| `npm run test:browser` | PASS, homepage/editor/compositions/navigation, exact SVG/PNG exports, sharing/storage, gaze/reactions, fonts, responsive copy, reduced motion and optional scenes |
| `npm run test:studio` | PASS, lifecycle, replay, import/export, malformed inputs, capacity, mobile/touch, stable identities and old editor links |
| `npm run test:motion:browser` | PASS in Chrome and WebKit, 11 checks and 700 containment samples per runtime |
| `npm run test:mp4:browser` | PASS in Chrome and WebKit, real 512/1024 H.264 encoding/playback/fidelity, Studio download, cancellation, fault injection, cleanup, unsupported fallback and 900-frame boundary |
| `node website/preview/tests/visual-parity-browser.mjs` | PASS, preview states/playback/reduced motion, editor behavior/source downloads and 1440/390/320 route layouts |
| Installed consumer server + `scripts/check-consumer-browser.mjs` | PASS, desktop gaze, React/activity/scenes, mobile updates and no runtime errors |
| Byte preservation + `git diff --check` | PASS |

Raw reports are retained in [verification.json](../../assets/pibulo-rebrand/verification.json).
The first MP4 run stopped on one missed historical footer-version test assertion;
that expectation was corrected and the complete MP4 suite passed on rerun.
The sandbox initially blocked npm cache writes and loopback listening; those
operations were rerun with the required permissions. No product defect or
fixture change was used to resolve either environment restriction.

The [preservation manifest](../../assets/pibulo-rebrand/preservation.json) confirms
182 unchanged files against the release baseline: historical assets and release/
review records, identity fixtures, upstream renderer/scenes/fonts, licenses,
notices, identity/motion implementation and adapter. Root package/lock identity
changes are the only dependency-lock differences; public export definitions,
dependencies, peer requirements, engines and layout CSS are preserved. Only two
library error-message strings change visible product branding; valid-input
behavior, wire formats and revision literals remain the same.

This is Chrome/WebKit and emulated-mobile qualification, not physical-device,
all-browser, accessibility certification or independent acceptance. The existing
optional deprecated mp4-muxer 5.2.2 maintenance caveat remains applicable.

## Remaining whoami references

The [reference audit](../../assets/pibulo-rebrand/whoami-audit.json) inventories
case-insensitive matches with categories, paths and line numbers. No missed active
package imports or visible product branding remain. Legitimate categories are:

- Historical releases/changelog entries, development/refinement/validation/review
  documents and unchanged historical media/verification JSON. Old media remains
  explicitly labeled historical in README.
- Provenance, preserved adapter copyright banner, reference manifest and original
  repository release-boundary instructions in AGENTS.md.
- Compatibility literals `whoami-recording`, `whoami-motion-1`,
  `whoami-mp4-grid-1` and `whoami-motion-cue`, including their current documentation,
  serializers and CSS selectors. Recording download filenames now use pibulo.
- Current GitHub repository URL, origin and checkout folder, until authorized
  renaming. Package metadata accurately retains the current repository URL.
- Legacy `WHOAMI_*` QA environment aliases; new `PIBULO_*` variables take priority.
- Migration/verification text and the historical-recording consumer probe.

There was no public npm publication of the prior package. No redirect, deprecated
package or registry alias is created. Historical release notes are unedited;
provenance and changelog gain new sections while their earlier text stays intact.

## Proposed GitHub rename and release plan — not executed

1. Owner reviews this exact local commit and screenshots. Obtain review from
   someone other than the implementation agent before claiming independent
   review. Keep private:true and choose any release version/tag only under a
   separate owner instruction; `0.3.2-dev.0` remains unreleased meanwhile.
2. Before an authorized rename, inventory the remote's current branches, tag
   targets, releases and uploaded-asset checksums, repository settings, workflows,
   integrations and any Pages/custom-domain configuration. Confirm the desired
   `talarurus/pibulo` name is available. Do not alter visibility or hosting.
3. With explicit owner authorization, an administrator renames the existing
   repository in GitHub Settings to `pibulo`. Preserve the same repository and
   its history/releases. GitHub redirects normal repository and Git URLs, but
   project-site URLs and reusable-action references need explicit review; do not
   reuse the old repository name, which would break redirects. These limitations
   come from [GitHub's rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).
4. After that authorized operation, update the local origin to the corresponding
   `talarurus/pibulo.git` URL while retaining the owner's existing SSH host alias.
   Update current repository links/clone instructions and their integrity-check
   expectation in a new reviewed commit. Preserve historical URLs and documents.
   Verify redirects, tag targets, old release assets and their recorded checksums.
   Treat Pages/domain/Cloudflare work as separate scope requiring authorization.
5. Only after separate push/merge authorization, push the reviewed commit/branch
   without force or rewriting old tags. Rerun qualification on the exact proposed
   release commit after any metadata changes; rebuild and test the tarball.
6. Under separately authorized release preparation, choose the new version and
   create a new tag pinned to that verified commit. Prepare new release notes
   identifying the rename and unchanged formats; retain v0.1.0–v0.3.1 notes/assets
   exactly. A draft can be prepared only when authorized, and publication remains
   a final explicit owner step. GitHub documents draft preparation separately from
   [publishing a release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
   No npm publication, old-package deprecation, website deployment or Cloudflare
   action is included in this plan's authorization.

Stop here for owner review. No push, repository rename, tag, GitHub Release,
npm publication, deployment or Cloudflare change has been performed.
