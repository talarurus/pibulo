# whoami v0.3.0 final release preparation

Publication proposal only. Work starts on clean `develop/v0.3.0` at approved
implementation `1f19df17f1e233b79ba5b47168539fd9b92b027b`. The owner approved
desktop Studio, mobile Studio and the actual 512×512 exported MP4. This pass
changes release metadata/copy and focused release checks, not features or design.

## Prepared source distribution

Package/lock metadata is 0.3.0; npm private:true and the package/product names are
preserved. README, changelog, API guides, website version labels and
[GitHub release notes](v0.3.0.md) describe the delivered motion/MP4 functionality,
deterministic boundaries and qualified browsers without promising universal support.
The motion guide joins the explicit package documentation allowlist.

**Pinned MIT mp4-muxer 5.2.2 is deprecated upstream and retained unchanged.**
Its maintenance risk and potential need for a future separately reviewed
replacement/fork are disclosed in README, changelog, provenance, API/export guide
and release notes. Original Vanilagy attribution and all Blobatar/Blobatarling/font
notices remain. Core/activity/recording/ordinary motion entries remain codec-free.

Implementation source, stable identities, historical fixtures, CSS/design and
approved media/screenshots remain unchanged, except textual version labels.
Historical checkpoint reports and prior release notes retain their original context.

## Verified baseline and remote state

Read-only GitHub checks used the existing Talarurus admin credential only within
one process; global gh authentication was not changed. No refs/releases were written.

| Item | Verified value |
| --- | --- |
| Starting branch/commit | develop/v0.3.0, `1f19df17f1e233b79ba5b47168539fd9b92b027b`, clean |
| Origin | `git@github-talarurus:talarurus/whoami.git` |
| GitHub repository | Public, default main, existing Talarurus account has push/admin permission |
| Local/remote main | `1e1530f38db1d533227d30fe1659e71417c9c317`, ancestor of development HEAD; protected=false at read-only verification |
| Local/remote v0.1.0 tag object | `9456659e6b78833cbd68b29fa203608fa48a7e25` |
| v0.1.0 peeled commit | `f37d1943b778570d8df1083bd47a11e1144f6367` |
| Local/remote v0.2.0 tag object | `acfb6b13eb24b80c9fa43599f11fc47fbf93a5fc` |
| v0.2.0 peeled commit | `1e1530f38db1d533227d30fe1659e71417c9c317` |
| Experiment branch | `9254098f4d23b8ece6a9f33717bcac468f935a8f`, retained |
| Remote develop/v0.3.0, v0.3.0 tag/release | Absent at verification |
| Published releases | v0.1.0 ID 412094234; v0.2.0 ID 412311999; both non-draft/non-prerelease, unchanged |

Remote state must be rechecked immediately before any future publication. A
changed main, pre-existing v0.3.0 ref/release or tag mismatch requires review;
the proposal does not overwrite refs/releases or force-push.

## Focused final validation

Environment: Node 24.21.0, npm 11.19.0, React 19.2.0, TypeScript 5.9.3,
Playwright 1.62.1. Results from this metadata-preparation pass:

| Check | Result |
| --- | --- |
| Clean `npm ci --ignore-scripts --no-audit --no-fund` | PASS; exact lock restored, no version upgrades; offline cache miss retried with approved network access |
| `npm run build` | PASS; 0.3.0 ESM/declarations/site/notices and optional lazy muxer |
| `npm run typecheck` | PASS; production, website and typed examples |
| `npm test` | PASS; 46 tests, zero failures/skips, including deterministic motion, MP4 boundaries and historical identities |
| `npm run check:release` | PASS; 0.3.0 metadata, npm-private guard, pinned muxer/attribution, locked dependency licenses/integrities, renderer/font hashes and source hygiene |
| Independent installed 0.3.0 tarball | PASS; SVG/identity parity, React/activity/recording/motion ESM/SSR, MP4 plan/SVG/Node support behavior, NodeNext types and browser split bundle |
| Focused Chrome 155.0.8059.79 / WebKit 26.5 smoke | PASS; Studio/docs title, release badge/footer, 0.3.0 tarball instructions, Motion/MP4 panel mount, runtime support, reduced-motion preview and 390/320px layout; no page errors |
| Approved implementation preservation | PASS; all src, vendor, fonts, fixtures, assets, licenses/notices, media record, research, historical release notes/checkpoints unchanged from `1f19df1` |
| Dependency/API boundary | PASS; lock differs only in root version metadata; dependency pins and public export map unchanged |
| Approved MP4 evidence reuse | PASS; SHA-256 `7cc44da41175d0bc21e03dd3e9432cd6668c0331ae0dc64db869c2830b50790d`, identical 99,462-byte reviewed clip and independent decoding record |
| Historical refs | PASS; both original annotated tag objects/peeled commits and experiment branch retained |
| `git diff --check` | PASS |

Fresh metadata smoke/preservation and installed-consumer outputs remain in ignored
`test-results/release-v0.3.0` and its reported consumer directory. The existing
loopback preview served the rebuilt site; no hosted deployment occurred.

Existing implementation evidence is in [the export guide](../mp4-export.md),
[machine-readable media record](../mp4-verification.json) and
[motion checkpoint](../development-v0.3.0.md).

No unrelated historical browser suite or full media qualification is repeated:
exporter/sampler/renderer bytes and reviewed MP4 are unchanged. Reused evidence
includes genuine Chrome 155/WebKit 26.5 H.264 encoding/playback, beginning/middle/end
fidelity, cleanup/failure/cancellation tests, desktop/mobile interactions,
2,808 independently decoded frames in twelve files and original SVG/PNG parity.
Owner approval covers the reviewed Studio views and 512×512 video; automated QA
does not constitute independent acceptance or physical-device certification.

## Proposed publication sequence — separate approval required

The release commit is the local preparation commit reported to the owner. An
exact hash-pinned command file is prepared after that commit at
`test-results/release-v0.3.0/publication-plan.sh` (ignored QA artifact), avoiding
embedding a commit's own hash in its contents. It is inspected, never executed
during preparation. Core commands, with WHOAMI_RELEASE_COMMIT fixed to that hash:

```sh
git push origin "$WHOAMI_RELEASE_COMMIT:refs/heads/develop/v0.3.0"
git switch main
git merge --ff-only "$WHOAMI_RELEASE_COMMIT"
git push origin "$WHOAMI_RELEASE_COMMIT:refs/heads/main"
git tag -a v0.3.0 "$WHOAMI_RELEASE_COMMIT" -m "whoami v0.3.0 source release"
git push origin refs/tags/v0.3.0
gh release create v0.3.0 --repo talarurus/whoami --verify-tag \
  --target "$WHOAMI_RELEASE_COMMIT" --title "whoami v0.3.0" \
  --notes-file docs/releases/v0.3.0.md --latest --prerelease=false
git switch develop/v0.3.0
```

The complete proposal rechecks the clean validated branch/commit, origin, historical
tags, unchanged remote/local main, absent v0.3.0 branch/tag/release and fast-forward
ancestry first. It pins all new refs to the exact release commit, uses normal
non-forced pushes and an annotated tag, then verifies the remote peeled tag/main,
release notes/target/draft/prerelease status and unchanged historical refs.
The process-scoped Talarurus credential supplies release access without switching
global accounts. Existing v0.1.0/v0.2.0 releases are not edited. GitHub supplies
normal source archives; no compiled assets, npm publication or hosted deployment
are proposed.

## Remaining gate and known limitations

Explicit owner authorization remains required for branch pushes, local main
fast-forward, annotated v0.3.0 tag and GitHub Release publication. This preparation
does not perform those actions. The pinned deprecated muxer remains a disclosed
maintenance risk rather than being replaced in release scope. Browser/device codec
availability, lossy encoded pixels/bytes, 30-second/64 MiB bounds, no audio/captions
and unqualified physical Safari/iOS/Firefox/screen-reader coverage remain documented
limits. See the release notes for the complete API/export/identity boundaries.
No technical release blocker was found in this preparation. The checkout remains
on develop/v0.3.0 with only the locally committed preparation; main/tags/remote
refs and existing GitHub releases have not been changed.
