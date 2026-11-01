import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { licenseAudit, renderMarkdown } from '../src/audit.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'license-audit', 'SKILL.md')
const PROVIDER = 'dsh-license-audit'
export const name = 'license-audit'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'license-audit', description: 'Read package.json and installed node_modules licenses, classify them, and flag strong-copyleft/unknown for review. Not legal advice.', whenToUse: 'Before publishing or distributing a plugin and its dependencies.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'license-audit') }, rank: 600, locator: 'license-audit', metadata: { domain: 'compliance', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'license_audit', description: 'Static license inventory for a package and its installed top-level node_modules. Flags strong-copyleft and unknown licenses for review. Not legal advice.',
    parameters: { type: 'object', additionalProperties: false, properties: { path: { type: 'string', description: 'Package directory.' }, format: { type: 'string', enum: ['markdown', 'json'] } }, required: ['path'] },
    output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, verdict: { type: 'string' }, packages: { type: 'integer' }, review: { type: 'integer' } }, required: ['markdown', 'verdict', 'packages', 'review'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] },
    timeoutMs: 30_000,
    async execute(args = {}) { const r = await licenseAudit(args.path); return { markdown: args.format === 'json' ? JSON.stringify(r, null, 2) : renderMarkdown(r), verdict: r.verdict, packages: r.summary.total, review: r.summary['strong-copyleft'] + r.summary.unknown } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'license-audit') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
