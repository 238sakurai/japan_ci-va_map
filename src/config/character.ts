/**
 * キャラクター表示レイヤーの設定。
 *
 * 公式のチーバくん画像は千葉県の使用許諾が必要なため、リポジトリには含めていない。
 * 許諾を得たうえで public/images/ に画像を置き、officialImage を設定すると
 * 地図の上に重ねて表示される（座標は地図の viewBox 座標系: 幅 782 × 高さ 1000）。
 *
 * 未設定（null）のときは、公的データから描いた千葉県の形そのものをキャラクターとして扱う。
 */
export interface OfficialImageConfig {
  /** public/images/ からの相対パス（例: 'chibakun.png'） */
  src: string
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

export const characterConfig: { officialImage: OfficialImageConfig | null } = {
  officialImage: null,
}
