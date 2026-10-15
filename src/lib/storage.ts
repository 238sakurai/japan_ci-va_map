import type { GameSummary, LgCode, ModeId, SaveData } from '../types'

export const STORAGE_KEY = 'chibakun-dokoda:save'
export const SAVE_VERSION = 1 as const
const HISTORY_LIMIT = 50

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    highScores: { easy: 0, normal: 0, challenge: 0 },
    discovered: {},
    wrong: {},
    history: [],
    lastPlayedAt: null,
    settings: { sound: true },
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/** 保存データを現在のバージョンに変換する。壊れていれば初期値 */
export function migrate(raw: unknown): SaveData {
  const base = createDefaultSave()
  if (!isRecord(raw)) return base
  // version 1 以外（未来のバージョンや不正値）は、読める範囲だけ引き継ぐ
  const highScores = isRecord(raw.highScores) ? raw.highScores : {}
  const settings = isRecord(raw.settings) ? raw.settings : {}
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0)
  const discovered: SaveData['discovered'] = {}
  if (isRecord(raw.discovered)) {
    for (const [code, entry] of Object.entries(raw.discovered)) {
      if (!isRecord(entry)) continue
      discovered[code] = {
        count: Math.max(1, num(entry.count)),
        firstAt: typeof entry.firstAt === 'string' ? entry.firstAt : new Date(0).toISOString(),
        lastAt: typeof entry.lastAt === 'string' ? entry.lastAt : new Date(0).toISOString(),
      }
    }
  }
  const wrong: SaveData['wrong'] = {}
  if (isRecord(raw.wrong)) {
    for (const [code, n] of Object.entries(raw.wrong)) wrong[code] = num(n)
  }
  const history = Array.isArray(raw.history)
    ? raw.history
        .filter(isRecord)
        .filter((h) => typeof h.at === 'string' && typeof h.mode === 'string')
        .slice(-HISTORY_LIMIT)
        .map((h) => ({
          at: h.at as string,
          mode: h.mode as ModeId,
          score: num(h.score),
          correct: num(h.correct),
          answered: num(h.answered),
        }))
    : []
  return {
    version: SAVE_VERSION,
    highScores: {
      easy: num(highScores.easy),
      normal: num(highScores.normal),
      challenge: num(highScores.challenge),
    },
    discovered,
    wrong,
    history,
    lastPlayedAt: typeof raw.lastPlayedAt === 'string' ? raw.lastPlayedAt : null,
    settings: { sound: typeof settings.sound === 'boolean' ? settings.sound : base.settings.sound },
  }
}

export function loadSave(storage: StorageLike | null): SaveData {
  if (!storage) return createDefaultSave()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultSave()
    return migrate(JSON.parse(raw))
  } catch {
    return createDefaultSave()
  }
}

export function persistSave(storage: StorageLike | null, save: SaveData): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // プライベートモードなどで保存できない場合は無視する
  }
}

/** ゲーム結果を保存データに反映する（純粋関数） */
export function applySummary(save: SaveData, summary: GameSummary, now: Date = new Date()): SaveData {
  const at = now.toISOString()
  const discovered = { ...save.discovered }
  for (const code of summary.correctCodes) {
    const prev = discovered[code]
    discovered[code] = prev
      ? { ...prev, count: prev.count + 1, lastAt: at }
      : { count: 1, firstAt: at, lastAt: at }
  }
  const wrong = { ...save.wrong }
  for (const code of summary.wrongCodes) wrong[code] = (wrong[code] ?? 0) + 1
  return {
    ...save,
    highScores: {
      ...save.highScores,
      [summary.mode]: Math.max(save.highScores[summary.mode], summary.score),
    },
    discovered,
    wrong,
    history: [
      ...save.history,
      { at, mode: summary.mode, score: summary.score, correct: summary.correct, answered: summary.answered },
    ].slice(-HISTORY_LIMIT),
    lastPlayedAt: at,
  }
}

export function isDiscovered(save: SaveData, code: LgCode): boolean {
  return code in save.discovered
}

/** 苦手な市町村（間違えた回数が多い順、上位 n 件） */
export function weakSpots(save: SaveData, limit = 5): { code: LgCode; count: number }[] {
  return Object.entries(save.wrong)
    .filter(([, n]) => n > 0)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
    .slice(0, limit)
}
