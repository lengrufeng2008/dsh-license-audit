---
name: license-audit
description: Inventory package and dependency licenses, classify permissive/weak/strong copyleft/unknown, and flag items for review. Use before publishing or distributing. Not legal advice.
whenToUse: "A plugin is about to be published or bundled with dependencies and the license surface needs a first pass."
---

# License audit

```text
Use license_audit on /path/to/package.
```

It reads the root `package.json` and installed top-level `node_modules/*/package.json` (including
scoped packages), classifies each license, and flags `strong-copyleft` or `unknown` as `REVIEW`.

## Limits

- Not legal advice; a license expression is not a compliance review.
- Only top-level installed modules; no full transitive tree, no bundled source detection.
- No SPDX expression parsing beyond a small known set; `MIT OR Apache-2.0` may be unknown.
- No network, no package-manager metadata, no copyright-file audit.

For distribution decisions, consult the actual license texts and a qualified reviewer.
