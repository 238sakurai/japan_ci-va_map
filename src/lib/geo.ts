import type { GeoData, GeoMunicipality, LgCode, Point, PolygonRings } from '../types'

/** 閉じたリングに対する点の内外判定（レイキャスティング法） */
export function pointInRing(point: Point, ring: readonly Point[]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/** 外周リングの内側かつ穴リングの外側なら true */
export function pointInPolygon(point: Point, rings: PolygonRings): boolean {
  const [outer, ...holes] = rings
  if (!outer || !pointInRing(point, outer)) return false
  return !holes.some((hole) => pointInRing(point, hole))
}

export function pointInMunicipality(point: Point, m: GeoMunicipality): boolean {
  const [x, y] = point
  const [minX, minY, maxX, maxY] = m.bbox
  if (x < minX || x > maxX || y < minY || y > maxY) return false
  return m.polygons.some((rings) => pointInPolygon(point, rings))
}

/** viewBox 座標の点がどの市町村に含まれるかを返す。どこにも含まれなければ null */
export function hitTest(point: Point, municipalities: readonly GeoMunicipality[]): LgCode | null {
  for (const m of municipalities) {
    if (pointInMunicipality(point, m)) return m.code
  }
  return null
}

/** MultiPolygon を SVG の path d 属性に変換する */
export function polygonsToPath(polygons: readonly PolygonRings[]): string {
  let d = ''
  for (const rings of polygons) {
    for (const ring of rings) {
      ring.forEach(([x, y], i) => {
        d += `${i === 0 ? 'M' : 'L'}${x} ${y}`
      })
      d += 'Z'
    }
  }
  return d
}

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

export const viewBoxFromGeo = (geo: Pick<GeoData, 'viewBox'>): ViewBox => ({
  x: geo.viewBox[0],
  y: geo.viewBox[1],
  w: geo.viewBox[2],
  h: geo.viewBox[3],
})

export const viewBoxToString = (v: ViewBox): string => `${v.x} ${v.y} ${v.w} ${v.h}`

/**
 * 画面上の座標（clientX/Y）を SVG の viewBox 座標に変換する。
 * getScreenCTM は viewBox と preserveAspectRatio を含む変換なので、スマホでもずれない。
 */
export function clientToSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
  return [pt.x, pt.y]
}

/** 基準 viewBox の中で (cx, cy) を中心に scale 倍に拡大した viewBox を返す（範囲外へはみ出さない） */
export function zoomViewBox(base: ViewBox, scale: number, cx: number, cy: number): ViewBox {
  const s = Math.max(1, Math.min(scale, 8))
  const w = base.w / s
  const h = base.h / s
  return clampViewBox({ x: cx - w / 2, y: cy - h / 2, w, h }, base)
}

export function clampViewBox(v: ViewBox, base: ViewBox): ViewBox {
  const w = Math.min(v.w, base.w)
  const h = Math.min(v.h, base.h)
  const x = Math.min(Math.max(v.x, base.x), base.x + base.w - w)
  const y = Math.min(Math.max(v.y, base.y), base.y + base.h - h)
  return { x, y, w, h }
}

/** 市町村の bbox が収まるように、余白つきで拡大した viewBox を返す */
export function viewBoxForMunicipality(base: ViewBox, m: GeoMunicipality, padding = 1.6, minScale = 1, maxScale = 5): ViewBox {
  const [minX, minY, maxX, maxY] = m.bbox
  const bw = (maxX - minX) * padding
  const bh = (maxY - minY) * padding
  const scale = Math.max(minScale, Math.min(maxScale, Math.min(base.w / bw, base.h / bh)))
  return zoomViewBox(base, scale, (minX + maxX) / 2, (minY + maxY) / 2)
}

export function findMunicipality(geo: GeoData, code: LgCode): GeoMunicipality | undefined {
  return geo.municipalities.find((m) => m.code === code)
}
