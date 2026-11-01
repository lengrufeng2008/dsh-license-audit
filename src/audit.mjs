import { readFile, readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const PERMISSIVE = /^(?:MIT|ISC|BSD-2-Clause|BSD-3-Clause|Apache-2.0|0BSD|Unlicense|CC0-1.0|BlueOak-1.0.0)$/i
const WEAK = /^(?:LGPL|MPL|EPL|CDDL)/i
const STRONG = /^(?:GPL|AGPL)/i

export function classify(license) {
  const value = String(license || '').trim()
  if (!value) return 'unknown'
  if (STRONG.test(value)) return 'strong-copyleft'
  if (WEAK.test(value)) return 'weak-copyleft'
  if (PERMISSIVE.test(value)) return 'permissive'
  if (/^CC0|^Unlicense|^WTFPL/i.test(value)) return 'public-domain'
  return 'unknown'
}

async function readPackage(path) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return undefined }
}

export async function licenseAudit(input) {
  const root = await resolve(input)
  const info = await stat(root).catch(() => null)
  if (!info?.isDirectory()) throw new Error(`not a directory: ${input}`)
  const rootPkg = await readPackage(join(root, 'package.json'))
  if (!rootPkg) throw new Error('package.json not found')
  const packages = []
  const add = (name, version, license, relation) => packages.push({ name, version, license: license || '', class: classify(license), relation })
  add(rootPkg.name, rootPkg.version, rootPkg.license, 'root')
  const nodeModules = join(root, 'node_modules')
  if (await stat(nodeModules).catch(() => null)) {
    for (const entry of await readdir(nodeModules, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue
      const dirs = entry.name.startsWith('@') ? (await readdir(join(nodeModules, entry.name), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => join(entry.name, e.name)) : [entry.name]
      for (const dir of dirs) {
        const pkg = await readPackage(join(nodeModules, dir, 'package.json'))
        if (pkg) add(pkg.name || dir, pkg.version, pkg.license, 'dependency')
        if (packages.length > 2000) break
      }
    }
  }
  const summary = { total: packages.length, permissive: 0, 'weak-copyleft': 0, 'strong-copyleft': 0, unknown: 0, 'public-domain': 0 }
  for (const p of packages) summary[p.class] = (summary[p.class] || 0) + 1
  const verdict = summary['strong-copyleft'] ? 'REVIEW' : summary.unknown ? 'REVIEW' : 'PASS'
  return { root, packages, summary, verdict }
}
export function renderMarkdown(report) {
  const lines = [`# License audit: ${report.verdict}`, '', `- packages: ${report.summary.total}`, `- strong copyleft: ${report.summary['strong-copyleft']}`, `- unknown: ${report.summary.unknown}`, '']
  if (!report.packages.length) lines.push('No packages found.')
  else {
    lines.push('| Package | Version | License | Class | Relation |', '| --- | --- | --- | --- | --- |')
    for (const p of report.packages) lines.push(`| ${p.name} | ${p.version || ''} | ${p.license || '(none)'} | ${p.class} | ${p.relation} |`)
  }
  lines.push('', 'Not legal advice. Review strong-copyleft/unknown licenses against your distribution model.')
  return lines.join('\n')
}
