# API and integration

Install the locally built tarball as shown in the README. The root ESM entry is `@talarurus/whoami`; React is `@talarurus/whoami/react`. Node 24 and React 19.2 are the tested versions. CommonJS is not included.

`svgFor(config?, size=512, {decorative=false, label}?)` returns static SVG. Sizes are integers 24..4096. `name` defaults to atlas. Informative SVG includes a title derived from name or label; decorative SVG omits it. Insert only the SVG returned by this renderer, never arbitrary untrusted markup.

`configFor(config?, name?)` validates and fills defaults. `identity(config?, name?)` returns raw/canonical seed, renderer revision, upstream generation 2, overrides and all resolved traits. `expressionFor`, `statusFor`, `shareHash` and `readConfig` expose the same editor contracts. Invalid inputs throw errors; invalid share links return defaults with `linkError`.

Configuration fields: `name`, `traits`, `expression`, `state`, `motion`, `theme`, `backdrop`, `normalization`, `pointerGaze`, `nextTime`, `timezone`, `recovery`, `palette`, `contrast`. Exported `EXPRESSIONS`, `SHAPES`, `TONES`, `TRAIT_KEYS`, `AGENT_STATES`, `REVISION` and `DEFAULTS` enumerate supported values. Traits accept finite normalized positions or lists of at most 32 entries; the upstream renderer clamps finite out-of-range values. Unknown trait keys fail. Default normalization is NFC, trim, lowercase; raw mode skips it. Names allow at most 256 well-formed UTF-16 units.

Palette overrides accept head/eye/bg six-digit hex colors. They and `contrast=false` bypass generated contrast guarantees. Theme changes the website surface. State labels are caller-supplied presentation; expression=auto derives a pose from state, while an explicit expression wins. Scheduled needs nextTime/timezone; error needs recovery text.

`Face` props: `name`, `config`, `size=64`, `motion=off`, `pointerGaze=false`, `target`, `label`, `decorative=true`, `travel=3.8`. Name is a separate prop and overrides config.name. Motion accepts off/hover/always; config.motion and config.pointerGaze are editor fields, so pass the matching Face props explicitly. Import all three package CSS entries for motion and pause rules. Target can be pointer, rest, null, a DOM Element, or a client-coordinate {x,y}. The component renders static SSR markup before attaching effects. Offscreen/hidden components pause and dispose gaze listeners on replacement/unmount. OS reduced motion/coarse pointers suppress tracking. Invalid config renders an alert.

A separate application needs React/ReactDOM 19.2, a bundler that handles CSS imports, and (for TypeScript) React declarations. Run `npm run example:react` for the source example. There is no runtime framework inside the SVG entry, no hosted API, and no PNG API in the package.

The website includes five existing composition examples in `website/preview/src/components/compositions.jsx`. Reuse those with their relative helper modules and styles, preserving notices; they are not package exports. The password helper is a synthetic demonstration and never submits or saves text. The optional six-state scene demo is website-only and experimental.

Saved links pin Blobatar revision a7fd546ebede49d0a9fa638945b9e534489782a2 and envelope version 2. No Blinkling generation data is migrated. Keep the seed non-sensitive: it appears in SVG titles, share fragments, local endpoint URLs and browser-local wall storage.
