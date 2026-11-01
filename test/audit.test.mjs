import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { licenseAudit } from '../src/audit.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
test('classifies root and dependencies and reviews GPL/unknown', async () => {
  const r = await licenseAudit(join(ROOT, 'test/fixtures/demo'))
  assert.equal(r.verdict, 'REVIEW')
  assert.equal(r.summary.total, 4)
  assert.equal(r.summary['strong-copyleft'], 1)
  assert.equal(r.summary.unknown, 1)
})
test('CLI exits 1 on REVIEW and supports --json', () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'bin/dsh-license-audit.mjs'), join(ROOT, 'test/fixtures/demo'), '--json'], { encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stdout, /strong-copyleft/)
})
test('plugin registers license_audit and license-audit', async () => {
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'license_audit')
  const result = await tools[0].execute({ path: join(ROOT, 'test/fixtures/demo') })
  assert.equal(result.verdict, 'REVIEW')
  const provider = factory()
  assert.equal((await provider.list())[0].name, 'license-audit')
  assert.equal(await provider.get({ name: 'missing' }), undefined)
})
