import { MUNICIPALITIES, MUNICIPALITY_BY_CODE } from '../data/municipalities'
import { CHALLENGE_QUESTION_BUFFER, MODES } from '../app/modes'
import type { AnswerType, GeoMunicipality, LgCode, ModeConfig, ModeId, Question, QuizMunicipality } from '../types'
import { createRng, pickOne, shuffle, type Rng } from './random'

export const CHOICE_COUNT = 4

export interface QuestionGenOptions {
  pool: readonly QuizMunicipality[]
  /** 隣接関係の参照（選択肢生成に使う）。省略時は同じ地域だけで組む */
  geo?: readonly GeoMunicipality[]
  rng?: Rng
  seed?: number
}

/**
 * 4択の選択肢を作る。優先順位: 隣接市町村 → 同じ地域 → 出題プール → 全市町村。
 * 正解を必ず含み、重複しない。表示順はシャッフル済み。
 */
export function generateChoices(target: LgCode, opts: QuestionGenOptions): LgCode[] {
  const rng = opts.rng ?? createRng(opts.seed)
  const targetBase = MUNICIPALITY_BY_CODE.get(target)
  if (!targetBase) throw new Error(`Unknown target: ${target}`)

  const chosen = new Set<LgCode>([target])
  const addFrom = (candidates: readonly LgCode[]) => {
    for (const code of shuffle(candidates, rng)) {
      if (chosen.size >= CHOICE_COUNT) return
      if (!chosen.has(code) && MUNICIPALITY_BY_CODE.has(code)) chosen.add(code)
    }
  }

  const neighbors = opts.geo?.find((g) => g.code === target)?.neighbors ?? []
  // 隣接は全部入れると簡単すぎるので最大2つまで
  addFrom(shuffle(neighbors, rng).slice(0, 2))
  addFrom(MUNICIPALITIES.filter((m) => m.region === targetBase.region).map((m) => m.code))
  addFrom(opts.pool.map((m) => m.code))
  addFrom(MUNICIPALITIES.map((m) => m.code))

  return shuffle([...chosen], rng)
}

function questionType(mode: ModeConfig, rng: Rng): AnswerType {
  if (mode.answerType === 'mixed') return rng() < 0.5 ? 'map' : 'choice'
  return mode.answerType
}

/**
 * モードに応じた問題列を作る。
 * - 10問モード: プールから重複なしでランダムに選ぶ
 * - チャレンジ: プールをシャッフルして周回する（周回境界でも同じ市が連続しない）
 */
export function generateQuestions(modeId: ModeId, opts: QuestionGenOptions): Question[] {
  const mode = MODES[modeId]
  const rng = opts.rng ?? createRng(opts.seed)
  if (opts.pool.length === 0) throw new Error('出題プールが空です')

  const count = mode.questionCount ?? CHALLENGE_QUESTION_BUFFER
  const targets: LgCode[] = []
  let order = shuffle(opts.pool.map((m) => m.code), rng)
  while (targets.length < count) {
    if (order.length === 0) {
      order = shuffle(opts.pool.map((m) => m.code), rng)
      const last = targets[targets.length - 1]
      if (order.length > 1 && order[0] === last) {
        const swapWith = 1 + Math.floor(rng() * (order.length - 1))
        ;[order[0], order[swapWith]] = [order[swapWith]!, order[0]!]
      }
    }
    if (mode.questionCount !== null && targets.length >= opts.pool.length) break
    targets.push(order.shift()!)
  }

  return targets.map((targetCode) => {
    const type = questionType(mode, rng)
    return {
      targetCode,
      type,
      choices: type === 'choice' ? generateChoices(targetCode, { ...opts, rng }) : [],
    }
  })
}

/** ヒント: 4択から不正解を2つ消す（残す不正解は1つ） */
export function fiftyFifty(question: Question, rng: Rng = Math.random): LgCode[] {
  const wrong = question.choices.filter((c) => c !== question.targetCode)
  const keep = pickOne(wrong, rng)
  return wrong.filter((c) => c !== keep)
}
