# whoami → pibulo

The product is now **pibulo**, published by **Talarurus**.
**Little faces. Big personalities.**

An open-source toolkit for expressive AI-agent identities, activity visualization,
deterministic replay and motion export.

This owner-authorized local rebrand starts at whoami v0.3.1 commit
`5d5a9b3e11f8873e3541fabb7eae11dd05ac33c9`. Version `0.3.2-dev.0`
identifies unreleased development. Historical releases v0.1.0–v0.3.1 retain their
original names, tags, release notes, attribution and artifacts.

## Package migration

Replace `@talarurus/whoami` with `@talarurus/pibulo` in imports and dependency
keys, including all existing subpaths and CSS imports. For example:

```tsx
import {svgFor} from '@talarurus/pibulo';
import {Face} from '@talarurus/pibulo/react';
import {createActivityEngine} from '@talarurus/pibulo/activity';
import '@talarurus/pibulo/motion.css';
import '@talarurus/pibulo/gaze.css';
import '@talarurus/pibulo/react.css';
```

Build with `npm ci`, `npm run build`, then `npm pack`. In a separate application,
install the resulting local `talarurus-pibulo-0.3.2-dev.0.tgz` tarball. Remove the old
local dependency and update its imports together. All export subpaths, signatures,
behavior and peer requirements remain the same.

There was **no public npm publication** of `@talarurus/whoami`.
`@talarurus/pibulo` is also unpublished and `private: true` remains set.
No npm redirect, alias package or deprecated package is created.

## Compatibility

Existing version 1 recordings require no conversion. The literal format remains
`whoami-recording`; motion revision `whoami-motion-1` and MP4 frame revision
`whoami-mp4-grid-1` remain unchanged. These are compatibility contracts, not current
product branding. Pibulo exports the same envelope; a downloaded file may now be
named `pibulo-recording-v1.json` without changing its contents.

Blobatar generation 2, renderer revision, raw/canonical seed mapping, expressions,
SVG/PNG geometry, motion sampling and identity fixtures are unchanged. Existing
share links, browser storage keys and the public `whoami-motion-cue` CSS class
remain compatible. No data migration or new avatar generation occurs.

QA scripts prefer `PIBULO_*` environment variables and retain the corresponding
`WHOAMI_*` names as fallbacks. New QA output defaults avoid historical media.

## Repository and publication

The owner-authorized in-place repository rename is complete:
[talarurus/pibulo](https://github.com/talarurus/pibulo). The old
`talarurus/whoami` repository and historical release URLs redirect to the new name.
The existing local checkout directory remains `whoami`; its `origin` is now
`https://github.com/talarurus/pibulo.git`. New clones default to `pibulo`.
Do not reuse the old repository name while its redirects are needed.

This branch has not been pushed. The remote default branch remains `main`, at
published whoami v0.3.1, until a separately authorized Pibulo source release.
No tags, GitHub Releases, npm packages, website deployments or Cloudflare changes
were made. See [repository rename verification](reviews/pibulo-repository-rename.md).

See the [historical local rebrand verification and proposed GitHub plan](reviews/pibulo-rebrand.md).
