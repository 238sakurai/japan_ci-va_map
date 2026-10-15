import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  applySummary,
  createDefaultSave,
  loadSave,
  migrate,
  persistSave,
  weakSpots,
} from '../../src/lib/storage'
import type { GameSummary } from '../../src/types'

class MemoryStorage {
  map = new Map<string, string>()
  getItem(k: string) {
    return this.map.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.map.set(k, v)
  }
}

const summary: GameSummary = {
  mode: 'easy',
  score: 320,
  correct: 3,
  answered: 4,
  maxCombo: 2,
  wrongCodes: ['12224'],
  correctCodes: ['12100', '12204', '12203'],
  title: 'ちばたまご',
  isNewRecord: true,
}

describe('storage', () => {
  it('round-trips through a storage object', () => {
    const storage = new MemoryStorage()
    const save = applySummary(createDefaultSave(), summary, new Date('2026-10-16T00:00:00Z'))
    persistSave(storage, save)
    expect(storage.map.has(STORAGE_KEY)).toBe(true)
    expect(loadSave(storage)).toEqual(save)
  })

  it('applies results: high score, discoveries, wrong counts, history', () => {
    const now = new Date('2026-10-16T00:00:00Z')
    let save = applySummary(createDefaultSave(), summary, now)
    expect(save.highScores.easy).toBe(320)
    expect(save.discovered['12100']).toEqual({ count: 1, firstAt: now.toISOString(), lastAt: now.toISOString() })
    expect(save.wrong['12224']).toBe(1)
    expect(save.history).toHaveLength(1)
    expect(save.lastPlayedAt).toBe(now.toISOString())

    const later = new Date('2026-10-17T00:00:00Z')
    save = applySummary(save, { ...summary, score: 100 }, later)
    expect(save.highScores.easy).toBe(320)
    expect(save.discovered['12100']!.count).toBe(2)
    expect(save.discovered['12100']!.firstAt).toBe(now.toISOString())
    expect(save.wrong['12224']).toBe(2)
    expect(weakSpots(save)).toEqual([{ code: '12224', count: 2 }])
  })

  it('falls back to defaults on corrupt or missing data', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(loadSave(storage)).toEqual(createDefaultSave())
    expect(loadSave(null)).toEqual(createDefaultSave())
    expect(migrate(null)).toEqual(createDefaultSave())
    expect(migrate({ version: 99, highScores: { easy: -5, normal: 'x' }, settings: { sound: false } })).toMatchObject({
      version: 1,
      highScores: { easy: 0, normal: 0, challenge: 0 },
      settings: { sound: false },
    })
  })
})
