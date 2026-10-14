# whoami v0.2.0 release preparation

This is a publication proposal, not authorization to execute it. Work began on clean `develop/v0.2.0` at the expected `7a8f23622d9e784fa3f34fae02752892154f53cb`. The owner reports that the refined desktop/mobile Studio designs passed visual review. No feature development or new artwork was undertaken in this pass.

## Prepared metadata

- Package and lock versions are `0.2.0`; name remains `@talarurus/whoami`. `whoami` remains a provisional product name.
- `package.json` retains `private: true` specifically to prevent npm publication. This does not describe repository visibility: GitHub confirms `talarurus/whoami` is **public**.
- README, changelog, API/provenance and website release/version/access copy describe the supported activity/recording interfaces, experimental presentation surfaces and known limitations. Historical verification records are explicitly marked as checkpoint records.
- [v0.2.0 release notes](v0.2.0.md) separate first-party activity/Studio/recording work from existing upstream renderer and scene functionality.
- [v0.1.0 publication notes](v0.1.0.md) correct the existing draft’s obsolete private-access/draft wording while describing only the original v0.1.0 feature set and historical validation. The original tag/source are not edited.
- Existing approved screenshots are retained. No avatar, scene, activity engine, recording implementation, style or license bytes change in this metadata pass; the only Studio code change is its version badge text.

## Verified local and GitHub state

Read-only verification used the existing Talarurus admin credential for the individual process; the active gh account was not switched. The personal account has pull-only access and cannot see drafts; that account’s initial empty release list was not treated as authoritative.

| Item | Verified state |
| --- | --- |
| Local development branch before preparation | `develop/v0.2.0` at `7a8f23622d9e784fa3f34fae02752892154f53cb`, clean |
| Origin | `git@github-talarurus:talarurus/whoami.git` |
| Origin SSH identity | `talarurus-admin` (GitHub’s expected no-shell response) |
| Repository | Public; default branch main; admin account has admin/push permission |
| Remote main | `f37d1943b778570d8df1083bd47a11e1144f6367`; protected=false |
| Local and remote v0.1.0 tag object | `9456659e6b78833cbd68b29fa203608fa48a7e25` |
| v0.1.0 peeled commit | `f37d1943b778570d8df1083bd47a11e1144f6367` |
| Existing GitHub release | ID `412094234`, tag `v0.1.0`, title `whoami v0.1.0`, draft=true, prerelease=false, target=main, assets=0 |
| Draft last updated at verification | `2026-10-13T20:44:46Z` |
| Draft body SHA-256 before any proposed edit | `f197de3013504754ce26f7a0caf1594211d4f520c14576c6a181dc8b451797dc` |
| Remote development branch / v0.2.0 tag / v0.2.0 release | Absent |

The v0.1.0 draft is visible through owner/admin authentication; the repository itself is public. No GitHub draft, title, notes, visibility, refs or settings were changed during verification. GitHub status can change before publication, so the exact proposed commands recheck the draft identity/body, clean validated commit, origin and tag/main refs before writing.

## Focused validation

Environment: Node 24.21.0, npm 11.19.0, React 19.2.0, Google Chrome 155.0.8059.79.

| Check | Result |
| --- | --- |
| `npm run build` | PASS; 0.2.0 SDK entries, generated declarations, CSS, notices and website |
| `npm run typecheck` | PASS; strict production implementation, Studio and TypeScript/React examples |
| `npm test` | PASS; 33 tests, 0 failures/skips, including all original identity fixtures, 140 shape/expression combinations, React SSR, activity/recording behavior and scene source/playback checks |
| `WHOAMI_CONSUMER_OFFLINE=1 npm run test:consumer` | PASS; separate `talarurus-whoami-0.2.0.tgz` install, ESM SVG/Face/activity/scenes, recording round trip/rejection, SSR, NodeNext TypeScript and browser application bundles |
| Focused Chrome rendering check | PASS; release badge/title, 320px layout, public-repository/tarball docs, revisioned editor configuration, exact configured SVG, PNG parity and no runtime errors |
| PNG comparison | PASS; zero differing decoded channel values against the configured SVG |
| `npm run check:release` | PASS; 0.2.0 identity, npm-private guard, lock alignment, pinned source/font hashes, licenses/notices and hygiene |
| Baseline source comparison | PASS; v0.1.0 tag and protected vendor/fonts/fixtures/legacy SVG/Face/licenses unchanged; activity/recording/React/scenes/styles unchanged from the reviewed refinement |
| `git diff --check` | PASS |

Only release-critical checks were run. The earlier 16 focused Studio checks and separate-agent review remain recorded in [the refinement report](../refinement-v0.2.0.md); the full unrelated historical browser qualification was not restarted. Sandbox network/cache/Chrome restrictions were rerun with approved host access. The already-running loopback preview served the rebuilt website; no website was deployed.

## Proposed publication sequence — awaiting explicit final approval

The validated release commit is the **local metadata-preparation commit reported in the final response**. The exact hash-pinned commands are also saved as a local ignored review artifact at `test-results/release-v0.2.0/publication-plan.md` after that commit exists. This avoids embedding a commit’s own hash in its committed contents.

1. Recheck the clean validated development commit, origin/SSH destination, original local/remote v0.1.0 tag, unchanged main, absent v0.2.0 refs/release, and the existing v0.1.0 draft body. Use the existing admin credential only within a subshell; do not change global authentication.
2. Publish the **existing** v0.1.0 draft, replacing its notes with the prepared v0.1.0 file, pinning its target to the original commit, keeping prerelease=false and latest=false. Do not create or move the v0.1.0 tag. Verify that publication before continuing.
3. Push the exact validated commit to `origin/develop/v0.2.0`. Fast-forward local main to that commit with `git merge --ff-only`, then push main normally. No force push or new merge commit.
4. Create a new annotated `v0.2.0` tag at that exact commit and push only that new tag. Verify its remote peeled commit.
5. Create the v0.2.0 GitHub Release using the existing remote tag (`--verify-tag`), prepared v0.2.0 notes, prerelease=false and latest=true. Verify both published releases and targets.
6. Return the local checkout to `develop/v0.2.0`. GitHub provides its normal source archives; no compiled asset upload, npm publication, website deployment, package rename or v0.3.0 work is proposed.

Core Git operations, with `RELEASE_COMMIT` set to the validated hash reported to the owner:

```sh
git push origin "$RELEASE_COMMIT:refs/heads/develop/v0.2.0"
git switch main
git merge --ff-only "$RELEASE_COMMIT"
git push origin main
git tag -a v0.2.0 "$RELEASE_COMMIT" -m "whoami v0.2.0 source release"
git push origin refs/tags/v0.2.0
git switch develop/v0.2.0
```

These commands are proposed only. The existing v0.1.0 draft publication occurs before these writes; v0.2.0 release creation occurs after the new tag is verified. No operation has been executed merely because it appears here.

## Blockers and limits

No technical release blocker was found. **Explicit final owner approval is still required** for the exact remote writes, fast-forward merge, new v0.2.0 tag and both GitHub Release publications. The authorization for metadata preparation and visual approval is not treated as publication approval.

Known limits are documented in the README/API/release notes: fixed rosters and one current task per agent; caller-managed complete recordings and unique task IDs; safe-integer sequence exhaustion; bounded recording sizes; experimental optional scene presentation; local/in-memory operation; static browser-only PNG; and Chrome/emulated-mobile rather than physical-device, all-browser or screen-reader certification. Separate-agent technical review is not described as human acceptance.
