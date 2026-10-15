import { describe, expect, it } from 'vitest'
import { displaySeconds, isUrgent, remainingMs } from '../../src/lib/timer'
import { buildShareText, shareResult } from '../../src/lib/share'
import { createRng, debugOptionsFromLocation, seedFromLocation, shuffle } from '../../src/lib/random'
import { titleForChallengeScore, titleForCorrectCount } from '../../src/data/titles'

describe('timer', () => {
  it('counts down and never goes negative', () => {
    expect(remainingMs(1000, 60000, 1000)).toBe(60000)
    expect(remainingMs(1000, 60000, 31000)).toBe(30000)
    expect(remainingMs(1000, 60000, 99999)).toBe(0)
  })

  it('rounds display seconds up and flags the last 10 seconds', () => {
    expect(displaySeconds(300)).toBe(1)
    expect(displaySeconds(10000)).toBe(10)
    expect(isUrgent(10000)).toBe(true)
    expect(isUrgent(10001)).toBe(false)
    expect(isUrgent(0)).toBe(false)
  })
})

describe('share', () => {
  const summary = {
    mode: 'normal' as const,
    score: 950,
    correct: 8,
    answered: 10,
    maxCombo: 4,
    wrongCodes: [],
    correctCodes: [],
    title: 'ちばものしり博士',
    isNewRecord: false,
  }

  it('builds text without personal data', () => {
    const text = buildShareText(summary, 'https://example.com/')
    expect(text).toContain('8/10問正解')
    expect(text).toContain('ちばものしり博士')
    expect(text).toContain('https://example.com/')
  })

  it('uses Web Share when available and copies otherwise', async () => {
    const calls: string[] = []
    expect(await shareResult('t', { share: async () => void calls.push('share') })).toBe('shared')
    expect(await shareResult('t', { copy: async () => void calls.push('copy') })).toBe('copied')
    expect(await shareResult('t', {})).toBe('failed')
    expect(calls).toEqual(['share', 'copy'])
  })
})

describe('random', () => {
  it('shuffles deterministically with a seed', () => {
    const a = shuffle([1, 2, 3, 4, 5], createRng(9))
    const b = shuffle([1, 2, 3, 4, 5], createRng(9))
    expect(a).toEqual(b)
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('reads seed and timeLimit from the query string', () => {
    expect(seedFromLocation('?seed=12')).toBe(12)
    expect(seedFromLocation('?seed=abc')).toBeUndefined()
    expect(seedFromLocation('')).toBeUndefined()
    expect(debugOptionsFromLocation('?seed=3&timeLimit=5')).toEqual({ seed: 3, timeLimit: 5 })
    expect(debugOptionsFromLocation('?timeLimit=0')).toEqual({ seed: undefined, timeLimit: undefined })
  })
})

describe('titles', () => {
  it('maps correct counts to titles', () => {
    expect(titleForCorrectCount(0).title).toBe('ちばたまご')
    expect(titleForCorrectCount(3).title).toBe('ちばたまご')
    expect(titleForCorrectCount(4).title).toBe('ちばたんけんか')
    expect(titleForCorrectCount(6).title).toBe('ちばたんけんか')
    expect(titleForCorrectCount(7).title).toBe('ちばものしり博士')
    expect(titleForCorrectCount(9).title).toBe('ちばものしり博士')
    expect(titleForCorrectCount(10).title).toBe('チーバくんマスター！')
    expect(titleForChallengeScore(2500).title).toBe('ちばスピード博士')
  })
})
