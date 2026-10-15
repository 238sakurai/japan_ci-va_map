/** 地方公共団体コード（5桁、例: "12224"） */
export type LgCode = string

export type Point = [number, number]
/** 外周リング + 穴リング。各リングは閉じている（先頭と末尾が同じ点） */
export type PolygonRings = Point[][]

export interface GeoMunicipality {
  code: LgCode
  name: string
  county: string | null
  area: number
  centroid: Point
  bbox: [number, number, number, number]
  neighbors: LgCode[]
  polygons: PolygonRings[]
}

export interface GeoData {
  version: number
  generatedAt: string
  source: {
    name: string
    provider: string
    url: string
    file: string
    referenceDate: string
    note: string
  }
  viewBox: [number, number, number, number]
  municipalities: GeoMunicipality[]
}

export type RegionId =
  | 'katsunan'
  | 'higashikatsushika'
  | 'chiba'
  | 'inba'
  | 'katori'
  | 'kaiso'
  | 'sanbu'
  | 'chosei'
  | 'isumi'
  | 'awa'
  | 'kimitsu'
  | 'ichihara'

export interface Region {
  id: RegionId
  label: string
  kana: string
  /** 子ども向けの場所の説明（ヒントに使う） */
  hint: string
  color: string
}

export type MunicipalityKind = 'city' | 'town' | 'village'

/** 54市町村すべてに共通する基本情報 */
export interface MunicipalityBase {
  id: string
  code: LgCode
  name: string
  kana: string
  kind: MunicipalityKind
  region: RegionId
}

export interface TriviaSource {
  title: string
  url: string
  accessedAt: string
}

/** 出題対象の市町村（豆知識つき） */
export interface QuizMunicipality extends MunicipalityBase {
  /** 1 = やさしい, 2 = ふつう, 3 = むずかしい */
  difficulty: 1 | 2 | 3
  trivia: string
  triviaSource: TriviaSource
}

export type ModeId = 'easy' | 'normal' | 'challenge'
export type AnswerType = 'map' | 'choice'

export interface ModeConfig {
  id: ModeId
  label: string
  kana: string
  title: string
  description: string
  /** null = 時間制限まで無制限 */
  questionCount: number | null
  /** 1問あたりの回答回数 */
  attempts: number
  answerType: AnswerType | 'mixed'
  hintAvailable: boolean
  /** 秒。null = 制限なし */
  timeLimit: number | null
  /** 正解後に自動で次の問題へ進むまでのミリ秒。null = 手動 */
  autoAdvanceMs: number | null
}

export interface Question {
  targetCode: LgCode
  type: AnswerType
  /** 4択モードの選択肢（正解を含む、表示順） */
  choices: LgCode[]
}

export interface AnswerRecord {
  targetCode: LgCode
  correct: boolean
  attempts: number
  hintUsed: boolean
  points: number
}

export interface LastResult {
  correct: boolean
  targetCode: LgCode
  answeredCode: LgCode
  points: number
  /** 回答回数を使い切った（= この問題は終了） */
  exhausted: boolean
}

export type GamePhase = 'question' | 'feedback' | 'finished'

export interface GameState {
  mode: ModeId
  questions: Question[]
  index: number
  phase: GamePhase
  score: number
  combo: number
  maxCombo: number
  attemptsLeft: number
  hintUsed: boolean
  wrongCodes: LgCode[]
  removedChoices: LgCode[]
  lastResult: LastResult | null
  records: AnswerRecord[]
}

export type GameAction =
  | { type: 'answer'; code: LgCode }
  | { type: 'hint'; removed?: LgCode[] }
  | { type: 'next' }
  | { type: 'timeUp' }

export interface GameSummary {
  mode: ModeId
  score: number
  correct: number
  answered: number
  maxCombo: number
  wrongCodes: LgCode[]
  correctCodes: LgCode[]
  title: string
  isNewRecord: boolean
}

export interface DiscoveryEntry {
  count: number
  firstAt: string
  lastAt: string
}

export interface PlayRecord {
  at: string
  mode: ModeId
  score: number
  correct: number
  answered: number
}

export interface SaveData {
  version: 1
  highScores: Record<ModeId, number>
  discovered: Record<LgCode, DiscoveryEntry>
  wrong: Record<LgCode, number>
  history: PlayRecord[]
  lastPlayedAt: string | null
  settings: {
    sound: boolean
  }
}
