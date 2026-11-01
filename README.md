# License Audit for DSH

> A quick license inventory for a plugin package and its installed dependencies. Flags strong
> copyleft and unknown licenses for review. Not legal advice.

## Use

```bash
node bin/dsh-license-audit.mjs .
node bin/dsh-license-audit.mjs . --json
```

In DSH:

```text
Use license_audit on this package.
```

## What it reads

- Root `package.json`
- Installed top-level `node_modules/*/package.json`, including `@scope/name`

## Limits

- No full transitive tree, bundled-source scan, or SPDX parser
- No network
- `REVIEW` is a prompt to inspect, not a legal conclusion

## Tests

```bash
npm test
```

## Provenance

A small independent audit. Not legal advice. License: MIT.
