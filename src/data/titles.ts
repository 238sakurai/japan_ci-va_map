import type { ModeId } from '../types'

export interface RankTitle {
  title: string
  kana: string
  message: string
}

/** 10問モードの称号（正解数で判定） */
export function titleForCorrectCount(correct: number): RankTitle {
  if (correct >= 10) return { title: 'チーバくんマスター！', kana: 'ちーばくんますたー', message: 'ぜんもんせいかい！千葉県のことならおまかせだね！' }
  if (correct >= 7) return { title: 'ちばものしり博士', kana: 'ちばものしりはかせ', message: 'すごい！千葉県のことをたくさん知っているね！' }
  if (correct >= 4) return { title: 'ちばたんけんか', kana: 'ちばたんけんか', message: 'いいちょうし！もっとたんけんしてみよう！' }
  return { title: 'ちばたまご', kana: 'ちばたまご', message: 'これからどんどんおぼえていこう！' }
}

/** チャレンジモードの称号（スコアで判定） */
export function titleForChallengeScore(score: number): RankTitle {
  if (score >= 3000) return { title: 'でんせつのチーバくんマスター！', kana: 'でんせつのちーばくんますたー', message: 'はやさもせいかくさもかんぺき！' }
  if (score >= 2000) return { title: 'ちばスピード博士', kana: 'ちばすぴーどはかせ', message: 'すごいはやさ！千葉県マスターまであとすこし！' }
  if (score >= 1000) return { title: 'ちばダッシュたんけんか', kana: 'ちばだっしゅたんけんか', message: 'いいペース！つぎはもっといけるよ！' }
  return { title: 'ちばたまご', kana: 'ちばたまご', message: 'まずはゆっくりおぼえていこう！' }
}

export function titleFor(mode: ModeId, correct: number, score: number): RankTitle {
  return mode === 'challenge' ? titleForChallengeScore(score) : titleForCorrectCount(correct)
}
