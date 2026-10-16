import type { ModeConfig, ModeId } from '../types'

export const MODES: Record<ModeId, ModeConfig> = {
  easy: {
    id: 'easy',
    label: 'かんたん',
    kana: 'かんたん',
    title: 'どこにあるかな？',
    description: '市町村の名前を見て、地図の場所をタップしよう',
    questionCount: 10,
    attempts: 3,
    answerType: 'map',
    hintAvailable: true,
    timeLimit: null,
    autoAdvanceMs: null,
  },
  normal: {
    id: 'normal',
    label: 'ふつう',
    kana: 'ふつう',
    title: 'ここは何市？',
    description: '光っている場所の名前を4つから選ぼう',
    questionCount: 10,
    attempts: 1,
    answerType: 'choice',
    hintAvailable: true,
    timeLimit: null,
    autoAdvanceMs: null,
  },
  challenge: {
    id: 'challenge',
    label: 'チャレンジ',
    kana: 'ちゃれんじ',
    title: '千葉県マスター！',
    description: '60びょうで何問とけるかな？ハイスコアにちょうせん！',
    questionCount: null,
    attempts: 1,
    answerType: 'mixed',
    hintAvailable: false,
    timeLimit: 60,
    autoAdvanceMs: 900,
  },
}

export const MODE_LIST: readonly ModeConfig[] = [MODES.easy, MODES.normal, MODES.challenge]

/** チャレンジモードで事前生成しておく問題数（60秒で解ける数より十分多い） */
export const CHALLENGE_QUESTION_BUFFER = 80
