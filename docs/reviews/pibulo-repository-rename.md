# Pibulo repository rename · owner review

The owner authorized an in-place GitHub repository rename and local migration
corrections, without authorizing a push or a new release. The initial working
tree was clean on `brand/pibulo-rebrand` at
`a8afbfa0aa3b056a9c3342bd0bc087e42cfddebb`. The resulting corrective commit is
the branch tip; use `git log -1 --format='%H %s'` to identify it.

## Repository result

`gh auth status` verified the stored accounts outside the network sandbox.
`gh auth switch --hostname github.com --user talarurus-admin` selected the
owner-authorized account; the API confirmed that identity and admin permission.
No token was extracted or used from the read-only account.

The authorized command completed successfully:

```sh
gh repo rename pibulo --repo talarurus/whoami --yes
```

The public repository is now <https://github.com/talarurus/pibulo>. Before and
after, its ID is `1417947315` and node ID is `R_kgDOVIQosw`. Visibility remains
public. This is the same repository, without a transfer or replacement.

The default branch remains `main`, at
`5d5a9b3e11f8873e3541fabb7eae11dd05ac33c9` (published whoami v0.3.1).
Consequently the public default branch temporarily displays the previous whoami
source. The local Pibulo branch has not been pushed and is absent remotely.

The existing checkout remains in `~/projects/talarurus/whoami`; `origin` now uses
`https://github.com/talarurus/pibulo.git` for fetch and push. `git ls-remote
--heads --tags origin` and `git fetch --dry-run origin` succeeded. The fetch
discovery added the local symbolic `origin/HEAD` pointing to `origin/main`;
existing branch and tag targets did not change.

## Historical preservation and redirects

| Release | Original and current peeled commit | Unchanged release ID |
| --- | --- | --- |
| v0.1.0 | `f37d1943b778570d8df1083bd47a11e1144f6367` | 412094234 |
| v0.2.0 | `1e1530f38db1d533227d30fe1659e71417c9c317` | 412311999 |
| v0.3.0 | `629c32397057eba7719ab8fe8bb3544a1f985d47` | 413451642 |
| v0.3.1 | `5d5a9b3e11f8873e3541fabb7eae11dd05ac33c9` | 414516327 |

Pre/post API snapshots match for all four remote branches, all four annotated
tag objects, and all four published releases. Only API/HTML endpoint URL fields
were normalized for comparison; release bodies were compared verbatim. Release
titles, IDs, timestamps, targets and assets are unchanged. All four releases had
zero uploaded assets before and after; historical media tracked in Git is intact.
The [preservation evidence](../../assets/pibulo-repository-rename/github-preservation.json)
retains both inventories and SHA-256 hashes of the release notes.

An unauthenticated HTTP check returned `301` from the old repository URL to the
new one, followed by `200`. All four old `/releases/tag/v…` URLs also resolved to
the corresponding Pibulo release pages with `200`. The old API repository path
resolved to the same renamed repository ID. Do not recreate `talarurus/whoami`
while these redirects are needed.

## Local corrections and verification

Active repository URLs now use Pibulo in package metadata, README clone links,
the website documentation quick start and the release-check expectation. New
clones use `cd pibulo`; the existing checkout directory is unchanged. Migration,
current changelog and provenance text record the rename and transitional default
branch. Historical release notes, prior review records and prior audit artifacts
retain their original context.

`@talarurus/pibulo`, `0.3.2-dev.0` and `private: true` are unchanged. The lockfile,
package exports, npm publication settings, dependencies, source APIs, stable
revisions, recordings, avatar artwork/seed mappings, identity fixtures, notices,
homepage and Studio implementation/styles were not changed. All 277 pre-existing
tracked files outside the seven targeted corrections matched their baseline
SHA-256 hashes. No history or historical tag was rewritten.

| Verification | Result |
| --- | --- |
| `npm ci --offline --no-audit --no-fund` | PASS; exact locked dependencies |
| `npm run build` | PASS; package, declarations and website |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 46 tests, no failures or skips |
| `npm run check:release` | PASS; private package, new URL, pinned hashes/notices and lock hygiene |
| Focused Google Chrome 155 check with `npm start`, `PREVIEW_URL=http://127.0.0.1:4331` | PASS; docs clone/copy, homepage and Studio at 1440/390/320px, no overflow or page errors |
| `git diff --check` and preservation comparison | PASS |

The [browser report](../../assets/pibulo-repository-rename/browser-smoke.json)
records the focused check. No full browser/MP4 requalification is claimed for
this link correction. These are implementation-agent verification checks, not
independent review. No subagents were spawned.

## Integrations and next release boundary

GitHub reports no repository Actions workflows, webhooks, environments or Pages
site; the repository homepage field is unset. There are no tracked `.github`
workflows or reusable-action references to repair. Existing active repository
references were inventoried; legitimate historical URLs remain unchanged.

The organization installation inventory lists `cloudflare-workers-and-pages`
(selected repositories) and `chatgpt-codex-connector` (all repositories). The
available OAuth credential cannot list a GitHub App installation's selected
repositories via the app-token endpoints. Thus this check does not establish
whether the Cloudflare installation selects this repository, or audit external
service configuration/third-party references. No Cloudflare API, deployment or
hosting configuration was accessed or changed. Any external service migration
needs separate scope; it does not block the repository rename or local build.

Next: have someone other than the implementation agent review the exact local
branch tip and preserved evidence. Then obtain separate owner authorization to
prepare the first Pibulo source release, explicitly choosing its version/tag and
authorizing any push/merge to `talarurus/pibulo`. Requalify the exact prepared
release commit and tarball, prepare new Pibulo notes, and seek the required
authorization before creating/publishing its tag or GitHub Release. Do not
republish or edit historical releases. No release version has been chosen here.

No push, merge, remote-main modification, new tag/release, npm publication,
website deployment, Cloudflare action or visual redesign was performed. Stop for
owner review.
