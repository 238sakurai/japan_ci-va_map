import { MODES } from '../app/modes'
import type { GameAction, GameState, GameSummary, LgCode, ModeId, Question } from '../types'
import { calcPoints } from './scoring'
import { titleFor } from '../data/titles'

export function createGame(mode: ModeId, questions: Question[]): GameState {
  if (questions.length === 0) throw new Error('問題がありません')
  return {
    mode,
    questions,
    index: 0,
    phase: 'question',
    score: 0,
    combo: 0,
    maxCombo: 0,
    attemptsLeft: MODES[mode].attempts,
    hintUsed: false,
    wrongCodes: [],
    removedChoices: [],
    lastResult: null,
    records: [],
  }
}

export const currentQuestion = (s: GameState): Question => s.questions[s.index]!

/** 純粋関数のゲーム状態遷移。UI はこれを dispatch するだけ */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'answer':
      return answer(state, action.code)
    case 'hint':
      return state.phase === 'question' && MODES[state.mode].hintAvailable && !state.hintUsed
        ? { ...state, hintUsed: true, removedChoices: action.removed ?? [] }
        : state
    case 'next':
      return next(state)
    case 'timeUp':
      return state.phase === 'finished' ? state : { ...state, phase: 'finished' }
  }
}

function answer(state: GameState, code: LgCode): GameState {
  if (state.phase !== 'question') return state
  const q = currentQuestion(state)
  const attemptsUsed = MODES[state.mode].attempts - state.attemptsLeft + 1
  const correct = code === q.targetCode

  if (correct) {
    const combo = state.hintUsed || attemptsUsed > 1 ? state.combo : state.combo + 1
    const points = calcPoints({ correct: true, attempt: attemptsUsed, combo, hintUsed: state.hintUsed })
    return {
      ...state,
      phase: 'feedback',
      score: state.score + points,
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      lastResult: { correct: true, targetCode: q.targetCode, answeredCode: code, points, exhausted: true },
      records: [
        ...state.records,
        { targetCode: q.targetCode, correct: true, attempts: attemptsUsed, hintUsed: state.hintUsed, points },
      ],
    }
  }

  const attemptsLeft = state.attemptsLeft - 1
  const exhausted = attemptsLeft <= 0
  const wrongCodes = state.wrongCodes.includes(code) ? state.wrongCodes : [...state.wrongCodes, code]
  if (!exhausted) {
    return {
      ...state,
      attemptsLeft,
      wrongCodes,
      lastResult: { correct: false, targetCode: q.targetCode, answeredCode: code, points: 0, exhausted: false },
    }
  }
  return {
    ...state,
    phase: 'feedback',
    attemptsLeft,
    wrongCodes,
    combo: 0,
    lastResult: { correct: false, targetCode: q.targetCode, answeredCode: code, points: 0, exhausted: true },
    records: [
      ...state.records,
      { targetCode: q.targetCode, correct: false, attempts: attemptsUsed, hintUsed: state.hintUsed, points: 0 },
    ],
  }
}

function next(state: GameState): GameState {
  if (state.phase !== 'feedback') return state
  const nextIndex = state.index + 1
  if (nextIndex >= state.questions.length) return { ...state, phase: 'finished' }
  return {
    ...state,
    index: nextIndex,
    phase: 'question',
    attemptsLeft: MODES[state.mode].attempts,
    hintUsed: false,
    wrongCodes: [],
    removedChoices: [],
    lastResult: null,
  }
}

export function summarize(state: GameState, previousHighScore: number): GameSummary {
  const correct = state.records.filter((r) => r.correct).length
  return {
    mode: state.mode,
    score: state.score,
    correct,
    answered: state.records.length,
    maxCombo: state.maxCombo,
    wrongCodes: [...new Set(state.records.filter((r) => !r.correct).map((r) => r.targetCode))],
    correctCodes: [...new Set(state.records.filter((r) => r.correct).map((r) => r.targetCode))],
    title: titleFor(state.mode, correct, state.score).title,
    isNewRecord: state.score > previousHighScore,
  }
}
