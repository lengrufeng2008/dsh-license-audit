#!/usr/bin/env node
import { licenseAudit, renderMarkdown } from '../src/audit.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-license-audit [dir] [--json]\\n\\nRead package.json/node_modules licenses. Not legal advice.'); process.exit(0) }
const target = args.find((a) => !a.startsWith('--')) || '.'
try {
  const report = await licenseAudit(target)
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else console.log(renderMarkdown(report))
  process.exitCode = report.verdict === 'PASS' ? 0 : 1
} catch (error) { console.error(`dsh-license-audit: ${error.message}`); process.exitCode = 2 }
