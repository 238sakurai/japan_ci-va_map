import { characterConfig } from '../../config/character'

/**
 * キャラクター表示レイヤー。
 * 許諾済みの公式画像が設定されている場合だけ地図に重ねる。未設定なら何も描かない。
 */
export function CharacterLayer() {
  const img = characterConfig.officialImage
  if (!img) return null
  return (
    <image
      href={`${import.meta.env.BASE_URL}images/${img.src}`}
      x={img.x}
      y={img.y}
      width={img.width}
      height={img.height}
      opacity={img.opacity}
      pointerEvents="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    />
  )
}
