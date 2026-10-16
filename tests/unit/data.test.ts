import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { MUNICIPALITIES, MUNICIPALITY_BY_CODE } from '../../src/data/municipalities'
import { QUIZ_POOL } from '../../src/data/quiz-pool'
import { REGIONS, REGION_BY_ID } from '../../src/data/regions'
import type { GeoData } from '../../src/types'

async function loadGeo(): Promise<GeoData> {
  const raw = await readFile(join(process.cwd(), 'public', 'data', 'chiba-municipalities.json'), 'utf8')
  return JSON.parse(raw) as GeoData
}

describe('municipality master data', () => {
  it('has all 54 municipalities of Chiba with unique codes', () => {
    expect(MUNICIPALITIES).toHaveLength(54)
    expect(MUNICIPALITY_BY_CODE.size).toBe(54)
    for (const m of MUNICIPALITIES) {
      expect(m.code).toMatch(/^12\d{3}$/)
      expect(m.kana).toMatch(/^[ぁ-んー]+$/)
      expect(REGION_BY_ID[m.region]).toBeDefined()
    }
  })

  it('matches the public geo data exactly (code and name)', async () => {
    const geo = await loadGeo()
    expect(geo.municipalities).toHaveLength(54)
    expect(geo.source.referenceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const g of geo.municipalities) {
      const m = MUNICIPALITY_BY_CODE.get(g.code)
      expect(m, `geo code ${g.code} (${g.name}) missing in master`).toBeDefined()
      expect(m!.name).toBe(g.name)
      expect(g.polygons.length).toBeGreaterThan(0)
      expect(g.area).toBeGreaterThan(0)
      for (const n of g.neighbors) expect(MUNICIPALITY_BY_CODE.has(n)).toBe(true)
    }
  })

  it('has symmetric neighbor relations', async () => {
    const geo = await loadGeo()
    const byCode = new Map(geo.municipalities.map((m) => [m.code, m]))
    for (const m of geo.municipalities) {
      for (const n of m.neighbors) {
        expect(byCode.get(n)!.neighbors).toContain(m.code)
      }
    }
  })

  it('kind matches name suffix', () => {
    for (const m of MUNICIPALITIES) {
      const expected = m.name.endsWith('市') ? 'city' : m.name.endsWith('町') ? 'town' : 'village'
      expect(m.kind).toBe(expected)
    }
  })
})

describe('quiz pool (all 54 municipalities)', () => {
  it('covers every municipality exactly once', () => {
    expect(QUIZ_POOL).toHaveLength(54)
    expect(new Set(QUIZ_POOL.map((m) => m.code)).size).toBe(54)
    const codes = QUIZ_POOL.map((m) => m.code)
    expect([...codes].sort()).toEqual(MUNICIPALITIES.map((m) => m.code).sort())
  })

  it('mentions the municipality name in its own trivia', () => {
    for (const m of QUIZ_POOL) {
      expect(m.trivia, `${m.name} trivia should mention its own name`).toContain(m.name)
    }
  })

  it('has sourced trivia for every entry', () => {
    for (const m of QUIZ_POOL) {
      expect(m.trivia.length, `${m.name} trivia`).toBeGreaterThan(5)
      expect(m.trivia.length, `${m.name} trivia too long`).toBeLessThanOrEqual(80)
      expect(m.triviaSource.url, `${m.name} source url`).toMatch(/^https?:\/\//)
      expect(m.triviaSource.title.length).toBeGreaterThan(0)
      expect(m.triviaSource.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect([1, 2, 3]).toContain(m.difficulty)
    }
  })
})

describe('regions', () => {
  it('cover every municipality and have unique ids', () => {
    expect(new Set(REGIONS.map((r) => r.id)).size).toBe(REGIONS.length)
    const used = new Set(MUNICIPALITIES.map((m) => m.region))
    for (const r of REGIONS) expect(used.has(r.id)).toBe(true)
  })
})
