# whoami release boundaries

This standalone repository contains the owner-authorized whoami v0.1.0 source release. Read docs/provenance.md and docs/api.md before edits. Preserve the pinned upstream renderer bytes, notices and identity fixtures. Generation changes require a separately authorized migration; never rewrite fixtures to hide failures.

Build: npm ci, npm run build. Checks: npm run typecheck, npm test, npm run check:release. Browser checks require npm start and Google Chrome; use PREVIEW_URL for another port. Never publish to npm, deploy a website, make the repository public or begin future versions without owner authorization. Independent review must be by someone other than the implementation agent; do not claim it from automated tests or spawn agents without owner authorization.
