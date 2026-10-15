import { describe, expect, it } from 'vitest'
import { createGame, currentQuestion, gameReducer, summarize } from '../../src/lib/engine'
import { BASE_POINTS, COMBO_STEP, accuracy, calcPoints, comboBonus } from '../../src/lib/scoring'
import type { Question } from '../../src/types'

const q = (target: string): Question => ({ targetCode: target, type: 'map', choices: [] })
const questions = [q('12100'), q('12204'), q('12203')]

describe('scoring', () => {
  it('gives base points plus combo bonus on first-try answers', () => {
    expect(calcPoints({ correct: true, attempt: 1, combo: 1, hintUsed: false })).toBe(BASE_POINTS)
    expect(calcPoints({ correct: true, attempt: 1, combo: 2, hintUsed: false })).toBe(BASE_POINTS + COMBO_STEP)
    expect(calcPoints({ correct: true, attempt: 1, combo: 10, hintUsed: false })).toBe(BASE_POINTS + 100)
  })

  it('gives no bonus with a hint or on later attempts, and nothing when wrong', () => {
    expect(calcPoints({ correct: true, attempt: 1, combo: 5, hintUsed: true })).toBe(BASE_POINTS)
    expect(calcPoints({ correct: true, attempt: 2, combo: 5, hintUsed: false })).toBe(BASE_POINTS)
    expect(calcPoints({ correct: false, attempt: 1, combo: 5, hintUsed: false })).toBe(0)
  })

  it('caps the combo bonus', () => {
    expect(comboBonus(1)).toBe(0)
    expect(comboBonus(3)).toBe(40)
    expect(comboBonus(99)).toBe(100)
  })

  it('computes accuracy', () => {
    expect(accuracy(7, 10)).toBe(70)
    expect(accuracy(0, 0)).toBe(0)
  })
})

describe('gameReducer (easy mode: 3 attempts)', () => {
  it('scores a correct first answer and moves to feedback', () => {
    let s = createGame('easy', questions)
    s = gameReducer(s, { type: 'answer', code: '12100' })
    expect(s.phase).toBe('feedback')
    expect(s.score).toBe(100)
    expect(s.combo).toBe(1)
    expect(s.lastResult?.correct).toBe(true)
    expect(s.records).toHaveLength(1)
  })

  it('allows up to 3 attempts, then marks the question wrong', () => {
    let s = createGame('easy', questions)
    s = gameReducer(s, { type: 'answer', code: '12204' })
    expect(s.phase).toBe('question')
    expect(s.attemptsLeft).toBe(2)
    expect(s.wrongCodes).toEqual(['12204'])
    s = gameReducer(s, { type: 'answer', code: '12203' })
    expect(s.attemptsLeft).toBe(1)
    s = gameReducer(s, { type: 'answer', code: '12207' })
    expect(s.phase).toBe('feedback')
    expect(s.lastResult).toMatchObject({ correct: false, exhausted: true })
    expect(s.records[0]).toMatchObject({ correct: false, attempts: 3, points: 0 })
    expect(s.combo).toBe(0)
  })

  it('gives base points only when correct on the second try', () => {
    let s = createGame('easy', questions)
    s = gameReducer(s, { type: 'answer', code: '12204' })
    s = gameReducer(s, { type: 'answer', code: '12100' })
    expect(s.score).toBe(100)
    expect(s.combo).toBe(0)
  })

  it('builds combos and resets them on a miss', () => {
    let s = createGame('easy', questions)
    s = gameReducer(s, { type: 'answer', code: '12100' })
    s = gameReducer(s, { type: 'next' })
    s = gameReducer(s, { type: 'answer', code: '12204' })
    expect(s.combo).toBe(2)
    expect(s.score).toBe(100 + 120)
    s = gameReducer(s, { type: 'next' })
    for (const wrong of ['12100', '12204', '12207']) s = gameReducer(s, { type: 'answer', code: wrong })
    expect(s.combo).toBe(0)
    expect(s.maxCombo).toBe(2)
  })

  it('finishes after the last question', () => {
    let s = createGame('easy', questions)
    for (const code of ['12100', '12204', '12203']) {
      s = gameReducer(s, { type: 'answer', code })
      s = gameReducer(s, { type: 'next' })
    }
    expect(s.phase).toBe('finished')
    const summary = summarize(s, 0)
    expect(summary.correct).toBe(3)
    expect(summary.answered).toBe(3)
    expect(summary.score).toBe(100 + 120 + 140)
    expect(summary.title).toBe('ちばたまご')
    expect(summary.isNewRecord).toBe(true)
  })

  it('hint removes the bonus and ignores answers outside the question phase', () => {
    let s = createGame('easy', questions)
    s = gameReducer(s, { type: 'hint' })
    expect(s.hintUsed).toBe(true)
    s = gameReducer(s, { type: 'answer', code: '12100' })
    expect(s.score).toBe(100)
    const again = gameReducer(s, { type: 'answer', code: '12100' })
    expect(again).toBe(s)
    expect(currentQuestion(s).targetCode).toBe('12100')
  })
})

describe('gameReducer (normal / challenge)', () => {
  it('ends the question after a single wrong answer in normal mode', () => {
    let s = createGame('normal', questions)
    s = gameReducer(s, { type: 'answer', code: '12204' })
    expect(s.phase).toBe('feedback')
    expect(s.lastResult?.exhausted).toBe(true)
  })

  it('ignores hint in challenge mode and stops on timeUp', () => {
    let s = createGame('challenge', questions)
    s = gameReducer(s, { type: 'hint' })
    expect(s.hintUsed).toBe(false)
    s = gameReducer(s, { type: 'answer', code: '12100' })
    s = gameReducer(s, { type: 'timeUp' })
    expect(s.phase).toBe('finished')
    expect(summarize(s, 500).isNewRecord).toBe(false)
  })
})
