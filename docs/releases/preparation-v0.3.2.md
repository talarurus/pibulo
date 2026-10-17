# Pibulo v0.3.2 release preparation

Prepared on `brand/pibulo-rebrand` from clean, independently reviewed commit
`fe11472ec2571f083bfe5fb7a264439ee8609ca6`. Previous public release and preserved
main baseline: v0.3.1 at `5d5a9b3e11f8873e3541fabb7eae11dd05ac33c9`.
The owner authorized local preparation and a local commit. Publication requires
separate final authorization; no push, merge, tag, GitHub Release, npm publication,
deployment or GitHub account configuration change is performed here.

## Scope

Active package/lock, integrity-check, build, website/Studio and documentation labels
are 0.3.2. The package remains private. The release notes describe Pibulo's renamed
repository and package, import migration, preserved upstream artwork and existing
compatibility. Transitional remote-branch wording is removed from active guides.
Historical releases, rebrand evidence and provenance checkpoint sections retain
their original context. Approved screenshots are unchanged historical captures;
they may display the development version used when captured.

The package includes the small desktop/mobile homepage screenshots, historical
poster, historical 1.9 KB recording and new release notes. Other media, examples
and internal review records use URLs pinned to `v0.3.2`, rather than packaging
internal records or large media. All shipped Markdown links are checked in both
source and installed-package contexts; tag-pinned paths are checked against local
source. **Those future URLs are not claimed live before publication.** Their
unauthenticated public verification is a required publication-plan step.

No public library implementation, avatar geometry, seed mapping, event semantics,
recording schema, motion sampling, MP4 functionality, styles, vendor byte, fixture,
font, license, notice, dependency pin or approved screenshot changes are intended.
The independent review covers the approved baseline; preparation verification is
implementation-agent QA, not a second independent review.

## Final qualification

Results and generated media stay under ignored `test-results/release-v0.3.2/`.
| Check | Result |
| --- | --- |
| Clean install/build | `npm ci --offline --no-audit --no-fund` and `npm run build` pass with exact locked dependencies and fresh build output directories. |
| TypeScript / unit tests | `npm run typecheck` passes; `npm test`: 46 pass, zero failures/skips. |
| Release integrity | `npm run check:release` passes for 0.3.2/private metadata, pinned upstream/font hashes, licenses, notices and source hygiene. |
| Actual installed consumer | `PIBULO_CONSUMER_OFFLINE=1 npm run test:consumer` passes: all JS/type/CSS export targets, SVG identity hash, React SSR, TypeScript, browser bundles, engine/replay/scenes/motion and optional MP4 planning. |
| Packed documentation | 62 files, 320,342-byte tarball. All 54 shipped documentation-link occurrences resolve locally in repository/package contexts or map to prepared source paths; 23 distinct tag URLs await post-publication public verification. Small approved images/poster/recording and release notes are included; internal reviews and large media are excluded. |
| Browser/editor | `npm run test:browser`: 30 groups pass in Chrome 155.0.8059.80; exact SVG export and PNG comparison have zero differing channels. Gaze, sharing, storage, editor/compositions, touch, keyboard and reduced motion remain qualified. |
| Homepage/Studio responsiveness | Release labels, pinned clone/copy and tarball instructions pass across 15 route/width combinations at 1440/390/320. Fresh homepage and Activity/Motion Studio screenshots were inspected; no overflow or page errors. |
| Visual interactions | Nine focused groups pass for recording-preview states/playback, reduced motion, editor recovery, source downloads and responsive routes. |
| Recording compatibility / MP4 | The historical whoami v1 recording round-trips unchanged in the installed consumer. Studio imports its nine events, seeks all four states, restarts/plays/pauses and retains reduced-motion seeking. A real 512×512, 5.5-second, 124,863-byte MP4 exports, downloads as `pibulo-motion.mp4`, decodes and plays in Chrome. |
| Preservation | Library source, vendor/artwork, fixtures, fonts, styles, licenses, notices, approved screenshots and historical release docs match the reviewed commit. Export maps, peers and dependency pins are unchanged; lockfile differences are root versions only. Clean library builds match apart from a temporary-review module-path comment and its derived muxer chunk filename. |
| Remote baseline | Read-only API/ref checks match the rename inventory: same public repository ID, main at v0.3.1, four unchanged annotated tags and four historical release IDs/note hashes/empty asset inventories. Latest remains v0.3.1; no v0.3.2 tag/release or remote Pibulo branch exists. Pages is disabled and no Actions workflows are present. |
| Diff / plan | `git diff --check` passes. The post-commit publication plan is inspected and shell/Python syntax-checked without executing it. |

Raw results are in `test-results/release-v0.3.2/verification.json`; the installed
consumer inventory and deferred URL list are retained there and in
`test-results/release-v0.3.2/pending-public-links.json`. No full MP4 fault-injection
or WebKit matrix was repeated for metadata/documentation changes; prior
qualification remains preserved. Chrome/emulated mobile checks do not certify
all physical devices or universal codec availability. The existing deprecated
MIT mp4-muxer maintenance caveat remains. No blocking issue remains; future URL
availability is deliberately pending publication.


## Publication proposal

After the final local commit, the exact hash-pinned plan is generated at
`test-results/release-v0.3.2/publication-plan.sh`. It is inspected and syntax-checked
but never executed during preparation. Keeping it outside the commit avoids a
self-referential commit hash. It pins the final commit and release-note checksum.

The plan requires explicit authorization and an existing write-capable credential;
it does not switch accounts or change GitHub configuration. Preflight checks pin
the local branch/HEAD, origin, both baseline ancestors, local and remote main,
historical annotated tags and peeled commits, and historical release IDs, bodies,
targets and asset inventories. v0.3.2 must not exist locally or remotely. Changed
remote state stops publication for inspection.

1. Push the exact prepared commit to `refs/heads/brand/pibulo-rebrand` without force.
2. Fast-forward local main from the preserved v0.3.1 baseline, recheck remote main,
   push the same exact commit normally, and verify both remote branch targets.
3. Create annotated `v0.3.2` at that commit; push only that tag and verify its tag
   object and peeled target. Historical tags are never rewritten.
4. Publish `Pibulo v0.3.2` with the committed notes, `--verify-tag`, the exact target,
   `--prerelease=false` and `--latest`. GitHub supplies normal source archives;
   no compiled tarball, media or other asset is uploaded.
5. Verify latest stable, public repository/release/source archive access, exact
   release notes, every future documentation/media URL, annotated tag and branch
   targets, and unchanged historical release/tag inventories. Verify old URLs
   still redirect. Return to the development branch with a clean tree.

Failures stop the plan. A partial execution requires inspection before retrying.
The plan does not deploy a website, publish npm packages, change visibility or
modify historical releases. Any external service integration remains outside
this GitHub source-release scope.
