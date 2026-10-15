import { MODES } from '../app/modes'
import type { GameSummary } from '../types'

export const APP_NAME = 'チーバくんのど〜こだ？'
export const HASHTAG = '#チーバくんのどこだ'

/** 個人情報や学習履歴を含まない、結果だけの共有テキスト */
export function buildShareText(summary: GameSummary, url: string): string {
  const mode = MODES[summary.mode]
  const lines =
    summary.mode === 'challenge'
      ? [`${APP_NAME}`, `${mode.label}モードで ${summary.score}点！（${summary.correct}問正解）`, `称号「${summary.title}」`]
      : [`${APP_NAME}`, `${mode.label}モードで ${summary.correct}/${summary.answered}問正解！ ${summary.score}点`, `称号「${summary.title}」`]
  return [...lines, HASHTAG, url].join('\n')
}

export type ShareOutcome = 'shared' | 'copied' | 'failed'

interface ShareEnv {
  share?: (data: { text: string; title?: string }) => Promise<void>
  copy?: (text: string) => Promise<void>
}

/** Web Share API があれば共有、なければクリップボードにコピー */
export async function shareResult(text: string, env: ShareEnv): Promise<ShareOutcome> {
  if (env.share) {
    try {
      await env.share({ text, title: APP_NAME })
      return 'shared'
    } catch (err) {
      // ユーザーがキャンセルした場合も含む。コピーにフォールバックする
      if (err instanceof Error && err.name === 'AbortError') return 'failed'
    }
  }
  if (env.copy) {
    try {
      await env.copy(text)
      return 'copied'
    } catch {
      return 'failed'
    }
  }
  return 'failed'
}

export function browserShareEnv(): ShareEnv {
  const nav = typeof navigator === 'undefined' ? undefined : navigator
  return {
    share: nav && typeof nav.share === 'function' ? (data) => nav.share(data) : undefined,
    copy: nav?.clipboard ? (text) => nav.clipboard.writeText(text) : undefined,
  }
}
