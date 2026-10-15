#!/usr/bin/env node
/**
 * 生成済みの public/data/chiba-municipalities.json を検証する。
 * 市町村数・コード形式・ポリゴンの有無・隣接関係の対称性を確認する。
 * 出題データ（TypeScript）との整合は tests/unit/data.test.ts で検証する。
 */
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EXPECTED_COUNT = 54

let errors = 0
const error = (msg) => {
  console.error(`ERROR: ${msg}`)
  errors++
}

const data = JSON.parse(await readFile(join(ROOT, 'public', 'data', 'chiba-municipalities.json'), 'utf8'))
const list = data.municipalities ?? []
if (list.length !== EXPECTED_COUNT) error(`municipality count ${list.length} (expected ${EXPECTED_COUNT})`)
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.source?.referenceDate ?? '')) error('source.referenceDate is missing')

const byCode = new Map()
for (const m of list) {
  if (!/^12\d{3}$/.test(m.code)) error(`bad code ${m.code}`)
  if (byCode.has(m.code)) error(`duplicate code ${m.code}`)
  byCode.set(m.code, m)
  if (!m.polygons?.length) error(`${m.name} has no polygons`)
  if (!(m.area > 0)) error(`${m.name} has no area`)
}
for (const m of list) {
  for (const n of m.neighbors) {
    if (!byCode.has(n)) error(`${m.name} neighbor ${n} unknown`)
    else if (!byCode.get(n).neighbors.includes(m.code)) error(`${m.name} -> ${n} not symmetric`)
  }
}

console.log(`municipalities: ${list.length}, reference date: ${data.source.referenceDate}, viewBox: ${data.viewBox.join(' ')}`)
console.log(`Validation complete: ${errors} errors`)
if (errors > 0) process.exit(1)
