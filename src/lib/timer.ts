/** 残り時間（ミリ秒）。0 未満にはならない */
export function remainingMs(startedAt: number, durationMs: number, now: number): number {
  return Math.max(0, startedAt + durationMs - now)
}

/** 表示用の秒数（切り上げ。残り 0.3 秒なら「1」） */
export function displaySeconds(ms: number): number {
  return Math.ceil(ms / 1000)
}

/** 残り時間がこの秒数以下になったら強調表示 */
export const URGENT_SECONDS = 10

export function isUrgent(ms: number): boolean {
  return ms > 0 && displaySeconds(ms) <= URGENT_SECONDS
}
