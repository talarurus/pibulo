# whoami v0.3.1 release preparation

Prepared locally from clean `design/v0.3.1-visual-parity` at
`0d6e0f78225264d9ba5bd6195a3fc9297bc606bb`. The owner approved the restored
homepage at 1440px, 390px and 320px, then authorized release preparation.
Publication remains separately gated. No push, main update, tag, GitHub Release,
npm publication or deployment is performed during this preparation.

## Prepared changes and preservation

Package and lock root metadata are 0.3.1; `private:true`, dependency pins, product
name, export map and package contents allowlist are preserved. README, changelog,
API guide, current website version labels and [GitHub release notes](v0.3.1.md)
now describe the source release. Historical API introduction versions and earlier
release/checkpoint records retain their context. Review reports have a short
addendum recording owner approval, without rewriting the original evidence.

The approved large wordmark, two-column layout, unframed avatar, whitespace,
installation/code presentation and quiet secondary recording preview are
byte-for-byte unchanged from the approved commit. Editor expression/palette
controls, source-download fixes and accessibility improvements are retained.
Only textual version/copy changes touch Studio and website documentation.

Public library source, pinned vendor renderer/scenes, fixtures, fonts, styles,
notices, licenses and all media are unchanged. README retains the approved GIF,
MP4/poster alternatives and restored screenshots. Attribution remains accurate:
Blobatar and Blobatarling MIT artwork, Geist SIL OFL fonts, and optional pinned
MIT mp4-muxer 5.2.2. The muxer's documented deprecation/maintenance caveat remains.
No new dependency, API, feature, artwork or design system is introduced.

## Verified baseline and remote state

Read-only checks on 2026-10-15:

| Item | Verified value |
| --- | --- |
| Starting branch/HEAD | `design/v0.3.1-visual-parity`, `0d6e0f78225264d9ba5bd6195a3fc9297bc606bb`, clean |
| Origin | `git@github-talarurus:talarurus/whoami.git` |
| Local/remote main and develop/v0.3.0 | `629c32397057eba7719ab8fe8bb3544a1f985d47` |
| v0.1.0 annotated tag / commit | `9456659e6b78833cbd68b29fa203608fa48a7e25` / `f37d1943b778570d8df1083bd47a11e1144f6367` |
| v0.2.0 annotated tag / commit | `acfb6b13eb24b80c9fa43599f11fc47fbf93a5fc` / `1e1530f38db1d533227d30fe1659e71417c9c317` |
| v0.3.0 annotated tag / commit | `e164f1232e0cbca48fe80aad9e84680510ec54d8` / `629c32397057eba7719ab8fe8bb3544a1f985d47` |
| Existing GitHub Releases | v0.1.0 ID 412094234; v0.2.0 ID 412311999; v0.3.0 ID 413451642; all published/non-prerelease |
| Latest GitHub Release | v0.3.0, targeting `629c32397057eba7719ab8fe8bb3544a1f985d47` |
| Remote design/v0.3.1-visual-parity, v0.3.1 tag/release | Absent |
| Repository | Public, default branch main; main currently unprotected |

The current default gh credential can read the public repository but reports
`push:false`. Future publication must use a repository-authorized write credential
(for example a process-scoped `GH_TOKEN`); the plan validates permission before
any mutation. No global authentication changes or credential copies are made.
Remote state must be rechecked immediately before publication. A changed baseline,
existing proposed ref/release or historical-tag mismatch stops the plan.

## Focused final verification

Node 24.21.0, npm 11.19.0, TypeScript 5.9.3, Playwright 1.62.1,
Chrome 155.0.8059.79. Results are retained under ignored
`test-results/release-v0.3.1/`; approved screenshots/media are not overwritten.

| Check | Result |
| --- | --- |
| Locked install | `npm ci --ignore-scripts --no-audit --no-fund --offline` passes; no upgrades. |
| Build / TypeScript | `npm run build` and `npm run typecheck` pass for library, website and typed examples. |
| Unit tests | `npm test`: 46 pass, zero failures/skips; original geometry, identity, motion, recording and export boundaries. |
| Release hygiene | `npm run check:release` passes for 0.3.1/private metadata, dependency integrities/licenses, pinned renderer/font hashes, attribution and source hygiene. |
| Browser/editor | `npm run test:browser`: 30 groups pass; deterministic seeds, all shapes/poses, editor pins/palettes/sharing, copy/export, gaze/morph, keyboard/touch, reduced motion, component/wall interactions and responsive routes. |
| SVG/PNG parity | Exported SVG exactly matches the renderer; PNG pixel comparison has zero differing channels. Fixtures are unchanged. |
| Visual parity | 9 groups pass for the retained homepage preview, four recorded states, play/pause/offscreen pause, reduced motion, editor controls/palette recovery, source downloads and all seven routes at 1440/390/320. |
| Installed 0.3.1 consumer | Local tarball installation passes ESM/SVG/identity, React SSR, activity/recording/motion/scenes, TypeScript, browser bundles and optional MP4 API checks. |
| Studio replay / MP4 | Retained recording imports; four states, seek/restart/play/pause and reduced-motion seeking pass. A genuine 512px, 5.5s MP4 exports, downloads and decodes natively in Chrome. |
| Version smoke | Homepage, editor, docs and Studio show 0.3.1 labels; docs use the 0.3.1 tarball; no page overflow at 1440/390/320. |
| Preservation | No changes from approved HEAD to homepage/preview behavior, styles, library, vendor, fonts, fixtures, notices, licenses or assets. Package/lock differ only in root version fields. |
| Diff checks | `git diff --check` passes; earlier release notes and local/remote annotated tag objects unchanged. |

Implementation-agent QA and owner design approval are distinct; no independent
review or physical-device certification is claimed. Prior Chrome/WebKit exporter
qualification is preserved, without repeating unrelated encoding/failure matrices.
The existing codec, resource, experimental-scene and muxer-maintenance limits apply.

## Exact publication plan — separate authorization required

The final release commit is reported to the owner after local commit creation.
The exact hash-pinned executable proposal is then generated at
`test-results/release-v0.3.1/publication-plan.sh`; it is inspected and syntax-checked,
never executed during preparation. Keeping that file outside the commit avoids
an impossible self-referential commit hash. It pins the preparation commit and the
release-notes checksum, and requires explicit authorization plus write-capable
GitHub credentials before its first mutation.

Its sequence is:

1. Check clean tree, exact release HEAD/branch, origin, source baseline ancestry,
   local/remote main, all three historical annotated tags and peeled commits,
   unchanged existing Releases/latest, and absence of v0.3.1 branch/tag/release.
2. Push the pinned commit to `refs/heads/design/v0.3.1-visual-parity` using a normal
   non-forced push, then verify its remote hash.
3. Switch to main, `git merge --ff-only` the pinned commit, recheck remote main is
   still the v0.3.0 baseline, push the exact hash to main without forcing, and
   verify the remote hash.
4. Create annotated `v0.3.1` at that exact hash; push only that tag, then verify
   the remote tag object and peeled commit.
5. Run `gh release create v0.3.1 --repo talarurus/whoami --verify-tag`, with
   `--target` pinned to the release hash, `--title "whoami v0.3.1"`,
   `--notes-file docs/releases/v0.3.1.md`, `--latest` and `--prerelease=false`.
   This publishes a non-draft Release with GitHub's normal source archives.
6. Verify published/non-prerelease state, latest=v0.3.1, target and exact release
   notes; verify main, development branch, new annotated tag and all historical
   tag objects/peeled commits and previous Release records. Return to the
   reviewed development branch with a clean tree.

The proposal performs no force-push, historical tag edits, npm publication,
website deployment or compiled-asset upload. Failures stop execution; a partial
publication requires inspection before any retry, rather than blind rerunning.
The next step is separate owner authorization for this exact pinned plan.
