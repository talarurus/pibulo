# Homepage restoration — owner visual review

**Subsequent owner decision:** the restored homepage at `0d6e0f7` was approved at
1440, 390 and 320 pixels. [v0.3.1 release preparation](../releases/preparation-v0.3.1.md)
is authorized; publication remains a separate gate. The review below retains its
original pre-approval context.

Work branch: `design/v0.3.1-visual-parity`. Starting commit: `96af0a3`.
Reference: published v0.3.0, `629c32397057eba7719ab8fe8bb3544a1f985d47`.
Verified locally on 2026-10-15. Awaiting owner visual approval; no push, tag,
publication, deployment or release preparation. This is implementation-agent
verification, not an independent review.

## What was restored

The homepage uses the original v0.3.0 composition and typography from `style.css`:
large whoami wordmark, generous space, unframed interactive avatar on the left,
and local setup plus the synchronized React/core example on the right. Mobile
returns to the original simple vertical sequence. The desktop wordmark is again
112px, with a 300px avatar surface (260px on mobile).

The oversized marketing headline, CTA cluster, statistics, gradient identity card
and separate developer marketing section are removed. Existing editor and
integration links remain; the installation example is back in the hero. The
recording preview follows the hero with breathing room, no enclosing panel and
quiet underlined state choices. Its single contextual **Open Studio** link opens
Motion mode. Standard header/footer navigation remains available.

The three-way comparisons show the restored page much closer to v0.3.0: the same
left-hand wordmark/seed/avatar sequence, two balanced desktop columns, and an
avatar visible well within the first mobile screen. Optional expression and
identity disclosures account for the modest extra height below the avatar.

## v0.3.1 improvements retained

- Editor expression tiles, palette order, hue selection/Auto, section navigation,
  mobile customization jump and recoverable incomplete palette input.
- Hero expression thumbnails and six identity shortcuts, now behind disclosures;
  deterministic seeds, pointer gaze, click/keyboard/touch reactions, burst cleanup,
  synchronized examples and config-preserving editor links.
- Recorded three-agent preview: idle → thinking → working → completed, manual
  seeking, play/pause, offscreen/hidden pause and reduced-motion states.
- Source downloads, gallery improvements, contrast and responsive fixes, code
  scrolling/copy controls, and accurate local-only/npm-unpublished statements.
- Existing Activity/Motion Studio, recording import/export/replay, MP4 exporter,
  avatar wall, component demonstrations and experimental agent scenes.
- Original GIF, MP4, poster and recording JSON, byte-for-byte unchanged. Library
  implementations, pinned artwork, fixtures, APIs and release metadata unchanged.

## Screenshots and comparisons

| Width | Final viewport | Original / first pass / restored |
| --- | --- | --- |
| 1440px | [Desktop](../../assets/visual-parity-v0.3.1/restored/home-1440.png) | [Three-way comparison](../../assets/visual-parity-v0.3.1/restored/compare-home-1440.png) |
| 390px | [Mobile](../../assets/visual-parity-v0.3.1/restored/home-390.png) | [Three-way comparison](../../assets/visual-parity-v0.3.1/restored/compare-home-390.png) |
| 320px | [Narrow mobile](../../assets/visual-parity-v0.3.1/restored/home-320.png) | [Three-way comparison](../../assets/visual-parity-v0.3.1/restored/compare-home-320.png) |

[Full desktop page](../../assets/visual-parity-v0.3.1/restored/home-full-1440.png),
[full mobile page](../../assets/visual-parity-v0.3.1/restored/home-full-390.png),
[secondary preview](../../assets/visual-parity-v0.3.1/restored/recorded-preview-1440.png)
and [narrow preview](../../assets/visual-parity-v0.3.1/restored/recorded-preview-320.png).
The `before/` v0.3.0 and `after/` first-pass images are preserved, not overwritten.
README now displays the restored homepage. Stable screenshots use reduced motion;
the disabled Play control is accompanied by manual state choices and an explanation.

## Verification

[Recorded results](../../assets/visual-parity-v0.3.1/restored/verification.json) and
[capture report](../../assets/visual-parity-v0.3.1/restored/capture.json).

| Check | Result |
| --- | --- |
| Build, typecheck, release integrity | Pass; renderer/font hashes, attribution, lockfile and source hygiene preserved. |
| Unit tests | 46/46 pass; existing identity and geometry fixtures unchanged. |
| Browser, polish, refinement suites | 30 groups pass; actual gaze/morph/idle motion, keyboard/touch, editor controls, code copy, navigation, wall and component interactions. SVG bytes match the renderer; PNG comparison has zero differing channels. |
| Visual-parity suite | 9 groups pass; four recorded states, playback/pause, reduced motion, editor palette recovery, real source downloads and all seven route widths. |
| Studio suite | 16 groups pass; valid/invalid import, export, replay/seek, timeline keyboard navigation, mobile touch and stable identities. |
| Focused Motion flow | Retained README recording imports; all four states, restart/play/pause and reduced-motion manual seeking work. A real 512px, 5.5s MP4 exports, downloads and decodes in Chrome (124,863 bytes). |
| Separate tarball consumer | Pass; installed package SVG/identity, React SSR, activity/motion/scenes, TypeScript, browser bundle and optional MP4 API. |
| Viewports | 1440, 390 and 320px: no page overflow; important controls and status text remain visible. Long code scrolls within its own container. |
| Historical boundaries | No changes to public library, vendor artwork, identity fixtures, package metadata/lock, notices, demo media or historical screenshots. |

Chrome 155.0.8059.79 with emulated mobile/touch contexts. No new cross-browser or
physical-device certification is claimed. The source-hygiene check initially found
an ignored Finder `.DS_Store`; it was moved out of the checkout and the check passed.
No unresolved functional regression was found. Final visual acceptance remains
with the owner; no further release action is authorized by this review.
