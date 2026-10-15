import { describe, expect, it } from 'vitest'
import { QUIZ_POOL } from '../../src/data/quiz-pool'
import { MUNICIPALITY_BY_CODE } from '../../src/data/municipalities'
import { createRng } from '../../src/lib/random'
import { fiftyFifty, generateChoices, generateQuestions } from '../../src/lib/quiz'

describe('generateQuestions', () => {
  it('produces 10 unique map questions for easy mode', () => {
    const qs = generateQuestions('easy', { pool: QUIZ_POOL, seed: 1 })
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.targetCode)).size).toBe(10)
    expect(qs.every((q) => q.type === 'map')).toBe(true)
  })

  it('produces 10 unique choice questions for normal mode', () => {
    const qs = generateQuestions('normal', { pool: QUIZ_POOL, seed: 2 })
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.targetCode)).size).toBe(10)
    for (const q of qs) {
      expect(q.type).toBe('choice')
      expect(q.choices).toHaveLength(4)
      expect(q.choices).toContain(q.targetCode)
      expect(new Set(q.choices).size).toBe(4)
    }
  })

  it('is deterministic for the same seed and differs for other seeds', () => {
    const a = generateQuestions('easy', { pool: QUIZ_POOL, seed: 42 })
    const b = generateQuestions('easy', { pool: QUIZ_POOL, seed: 42 })
    const c = generateQuestions('easy', { pool: QUIZ_POOL, seed: 43 })
    expect(a).toEqual(b)
    expect(a.map((q) => q.targetCode)).not.toEqual(c.map((q) => q.targetCode))
  })

  it('cycles the pool for challenge mode without immediate repeats', () => {
    const qs = generateQuestions('challenge', { pool: QUIZ_POOL, seed: 7 })
    expect(qs.length).toBeGreaterThan(QUIZ_POOL.length)
    for (let i = 1; i < qs.length; i++) {
      expect(qs[i]!.targetCode).not.toBe(qs[i - 1]!.targetCode)
    }
    const types = new Set(qs.map((q) => q.type))
    expect(types.has('map') && types.has('choice')).toBe(true)
  })

  it('caps 10-question modes at the pool size when the pool is small', () => {
    const qs = generateQuestions('easy', { pool: QUIZ_POOL.slice(0, 3), seed: 1 })
    expect(qs).toHaveLength(3)
  })
})

describe('generateChoices', () => {
  it('prefers neighbors and the same region', () => {
    const geo = [{ code: '12224', neighbors: ['12204', '12207', '12217', '12232', '12232'] }]
    const choices = generateChoices('12224', {
      pool: QUIZ_POOL,
      geo: geo as never,
      seed: 3,
    })
    expect(choices).toHaveLength(4)
    expect(choices).toContain('12224')
    const others = choices.filter((c) => c !== '12224')
    const neighborOrRegion = others.filter(
      (c) => geo[0]!.neighbors.includes(c) || MUNICIPALITY_BY_CODE.get(c)!.region === 'higashikatsushika',
    )
    expect(neighborOrRegion.length).toBeGreaterThanOrEqual(2)
  })
})

describe('fiftyFifty', () => {
  it('removes two wrong choices and keeps the target', () => {
    const q = { targetCode: '12100', type: 'choice' as const, choices: ['12100', '12204', '12203', '12207'] }
    const removed = fiftyFifty(q, createRng(5))
    expect(removed).toHaveLength(2)
    expect(removed).not.toContain('12100')
  })
})
