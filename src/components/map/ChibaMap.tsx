import { animate, motion, useAnimationControls } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react'
import { useApp } from '../../app/AppContext'
import { MUNICIPALITY_BY_CODE } from '../../data/municipalities'
import { REGION_BY_ID } from '../../data/regions'
import {
  clampViewBox,
  clientToSvgPoint,
  findMunicipality,
  hitTest,
  polygonsToPath,
  viewBoxForMunicipality,
  viewBoxFromGeo,
  viewBoxToString,
  zoomViewBox,
  type ViewBox,
} from '../../lib/geo'
import type { GeoData, LgCode, Point } from '../../types'
import { CharacterLayer } from './CharacterLayer'
import { MapDecor } from './MapDecor'

export type AreaStyle = 'target' | 'correct' | 'wrong' | 'hint' | 'candidate' | 'discovered' | 'undiscovered' | 'dim'

export interface ChibaMapProps {
  geo: GeoData
  styles?: Partial<Record<LgCode, AreaStyle>>
  /** region: 地域ごとのパステルカラー / mono: 統一色（図鑑の未発見表示など） */
  colorMode?: 'region' | 'mono'
  interactive?: boolean
  onTap?: (code: LgCode | null, point: Point) => void
  zoomable?: boolean
  /** 指定した市町村にズームする。null で全体表示に戻す */
  focusCode?: LgCode | null
  /** フォーカス時に対象を表示領域の上寄りに置く（下部にカードが重なるとき用、0〜0.4） */
  focusShiftY?: number
  /** 名前ラベルを出す市町村 */
  labels?: LgCode[]
  /** 値が変わるたびにジャンプする */
  bounceKey?: number
  /** タップした位置に置くピン */
  pin?: Point | null
  className?: string
  decorations?: boolean
}

const TAP_MOVE_THRESHOLD = 10
const MAX_SCALE = 6

const FILL: Record<Exclude<AreaStyle, 'dim' | 'discovered' | 'hint'>, { fill: string; stroke: string }> = {
  target: { fill: '#ffe066', stroke: '#f5b800' },
  correct: { fill: '#58c78e', stroke: '#2f9d66' },
  wrong: { fill: '#ffb56b', stroke: '#d9842f' },
  candidate: { fill: '#fff1b8', stroke: '#e94747' },
  undiscovered: { fill: '#e8e3dc', stroke: '#ffffff' },
}

export function ChibaMap({
  geo,
  styles = {},
  colorMode = 'region',
  interactive = false,
  onTap,
  zoomable = false,
  focusCode = null,
  focusShiftY = 0,
  labels = [],
  bounceKey = 0,
  pin = null,
  className = '',
  decorations = true,
}: ChibaMapProps) {
  const { reducedMotion, play } = useApp()
  const base = useMemo(() => viewBoxFromGeo(geo), [geo])
  const [view, setView] = useState<ViewBox>(base)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ startView: ViewBox; startDist: number; startCenter: Point; moved: boolean; startClient: Point } | null>(null)
  const controls = useAnimationControls()

  const paths = useMemo(
    () => geo.municipalities.map((m) => ({ code: m.code, d: polygonsToPath(m.polygons) })),
    [geo],
  )

  // フォーカス先が変わったら viewBox をなめらかに補間する
  const viewRef = useRef(view)
  viewRef.current = view
  useEffect(() => {
    let target = base
    if (focusCode) {
      const m = findMunicipality(geo, focusCode)
      if (m) {
        const v = viewBoxForMunicipality(base, m, 1.8, 1.4, 4)
        target = clampViewBox({ ...v, y: v.y + v.h * focusShiftY }, base)
      }
    }
    if (reducedMotion) {
      setView(target)
      return
    }
    const from = viewRef.current
    const controls = animate(0, 1, {
      duration: 0.45,
      ease: 'easeInOut',
      onUpdate: (t) =>
        setView({
          x: from.x + (target.x - from.x) * t,
          y: from.y + (target.y - from.y) * t,
          w: from.w + (target.w - from.w) * t,
          h: from.h + (target.h - from.h) * t,
        }),
    })
    return () => controls.stop()
    // viewRef は最新値を読むだけなので依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCode, focusShiftY, geo, base, reducedMotion])

  useEffect(() => {
    if (bounceKey === 0 || reducedMotion) return
    void controls.start({
      y: [0, -18, 0, -6, 0],
      scale: [1, 1.04, 1, 1.02, 1],
      transition: { duration: 0.7, ease: 'easeOut' },
    })
  }, [bounceKey, controls, reducedMotion])

  const scale = base.w / view.w

  const zoomBy = useCallback(
    (factor: number, center?: Point) => {
      setView((v) => {
        const cx = center?.[0] ?? v.x + v.w / 2
        const cy = center?.[1] ?? v.y + v.h / 2
        const next = Math.max(1, Math.min(MAX_SCALE, (base.w / v.w) * factor))
        return zoomViewBox(base, next, cx, cy)
      })
    },
    [base],
  )

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!interactive && !zoomable) return
    const svg = svgRef.current
    if (!svg) return
    try {
      svg.setPointerCapture(e.pointerId)
    } catch {
      // 合成イベントなどで capture できない場合は無視する
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      gesture.current = { startView: view, startDist: 0, startCenter: [e.clientX, e.clientY], moved: false, startClient: [e.clientX, e.clientY] }
    } else if (pts.length === 2) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }]
      gesture.current = {
        startView: view,
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startCenter: [(a.x + b.x) / 2, (a.y + b.y) / 2],
        moved: true,
        startClient: [e.clientX, e.clientY],
      }
    }
  }

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current
    const svg = svgRef.current
    if (!g || !svg || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    const rect = svg.getBoundingClientRect()
    const unitsPerPx = g.startView.w / rect.width

    if (pts.length >= 2 && zoomable) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const ratio = g.startDist > 0 ? dist / g.startDist : 1
      const centerNow: Point = [(a.x + b.x) / 2, (a.y + b.y) / 2]
      const startScale = base.w / g.startView.w
      const nextScale = Math.max(1, Math.min(MAX_SCALE, startScale * ratio))
      const w = base.w / nextScale
      const h = base.h / nextScale
      // ピンチ開始点が指の中心に留まるように平行移動する
      const anchor = clientToSvgPointIn(g.startView, rect, g.startCenter)
      const fx = (g.startCenter[0] - rect.left) / rect.width
      const fy = (g.startCenter[1] - rect.top) / rect.height
      const dx = (centerNow[0] - g.startCenter[0]) * (w / rect.width)
      const dy = (centerNow[1] - g.startCenter[1]) * (h / rect.height)
      setView(clampViewBox({ x: anchor[0] - fx * w - dx, y: anchor[1] - fy * h - dy, w, h }, base))
      g.moved = true
      return
    }

    const dx = e.clientX - g.startClient[0]
    const dy = e.clientY - g.startClient[1]
    if (!g.moved && Math.hypot(dx, dy) < TAP_MOVE_THRESHOLD) return
    g.moved = true
    if (zoomable && scale > 1.01) {
      setView(clampViewBox({ ...g.startView, x: g.startView.x - dx * unitsPerPx, y: g.startView.y - dy * unitsPerPx }, base))
    }
  }

  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    const svg = svgRef.current
    if (!g || !svg) return
    if (pointers.current.size === 0) {
      gesture.current = null
      if (!g.moved && interactive) {
        const point = clientToSvgPoint(svg, e.clientX, e.clientY)
        if (!point) return
        onTap?.(hitTest(point, geo.municipalities), point)
      }
    }
  }

  const onWheel = (e: WheelEvent<SVGSVGElement>) => {
    if (!zoomable) return
    const svg = svgRef.current
    if (!svg) return
    const p = clientToSvgPoint(svg, e.clientX, e.clientY)
    zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2, p ?? undefined)
  }

  const onKeyActivate = (e: KeyboardEvent<SVGPathElement>, code: LgCode) => {
    if (!interactive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const m = findMunicipality(geo, code)
      onTap?.(code, m?.centroid ?? [0, 0])
    }
  }

  const labelSet = new Set(labels)
  const dimming = Object.values(styles).includes('hint')

  return (
    <div className={`relative h-full w-full ${className}`}>
      {decorations && <MapDecor />}
      <motion.div animate={controls} className="relative h-full w-full">
        <svg
          ref={svgRef}
          className="map-svg relative block h-full w-full"
          viewBox={viewBoxToString(view)}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="千葉県の地図"
          data-testid="chiba-map"
          data-scale={scale.toFixed(2)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <defs>
            <filter id="map-shadow" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#453830" floodOpacity="0.18" />
            </filter>
          </defs>
          <g filter="url(#map-shadow)">
            {paths.map(({ code, d }) => {
              const m = MUNICIPALITY_BY_CODE.get(code)
              const style = styles[code]
              const regionColor = m ? REGION_BY_ID[m.region].color : '#ddd'
              const baseFill = colorMode === 'mono' ? '#e8e3dc' : regionColor
              let fill = baseFill
              let stroke = '#ffffff'
              let opacity = 1
              let cls = 'map-area'
              if (style === 'target') {
                cls += ' map-glow'
                fill = FILL.target.fill
                stroke = FILL.target.stroke
              } else if (style === 'hint') {
                cls += ' map-hint'
                fill = regionColor
              } else if (style === 'candidate') {
                cls += ' map-candidate'
                fill = FILL.candidate.fill
              } else if (style === 'discovered') {
                fill = regionColor
              } else if (style === 'undiscovered') {
                fill = FILL.undiscovered.fill
              } else if (style === 'dim') {
                opacity = 0.35
              } else if (style) {
                fill = FILL[style].fill
                stroke = FILL[style].stroke
              }
              if (dimming && !style) opacity = 0.4
              return (
                <path
                  key={code}
                  d={d}
                  className={cls}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2 / Math.sqrt(scale)}
                  strokeLinejoin="round"
                  opacity={opacity}
                  data-code={code}
                  data-style={style ?? 'normal'}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : -1}
                  aria-label={m?.name}
                  onKeyDown={(e) => onKeyActivate(e, code)}
                  onFocus={() => interactive && play('tap')}
                />
              )
            })}
          </g>
          <CharacterLayer />
          {/* ラベル・マーカー（当たり判定に影響しないよう pointer-events を切る） */}
          <g pointerEvents="none">
            {geo.municipalities
              .filter((m) => styles[m.code] === 'wrong')
              .map((m) => (
                <text
                  key={`x-${m.code}`}
                  x={m.centroid[0]}
                  y={m.centroid[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={34 / Math.sqrt(scale)}
                  fontWeight="900"
                  fill="#d9842f"
                  className="text-halo"
                >
                  ✕
                </text>
              ))}
            {geo.municipalities
              .filter((m) => styles[m.code] === 'correct')
              .map((m) => (
                <text
                  key={`o-${m.code}`}
                  x={m.centroid[0]}
                  y={m.centroid[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={38 / Math.sqrt(scale)}
                  fontWeight="900"
                  fill="#2f9d66"
                  className="text-halo"
                >
                  ★
                </text>
              ))}
            {geo.municipalities
              .filter((m) => labelSet.has(m.code))
              .map((m) => {
                const base = MUNICIPALITY_BY_CODE.get(m.code)
                return (
                  <text
                    key={`l-${m.code}`}
                    x={m.centroid[0]}
                    y={m.centroid[1] + 26 / Math.sqrt(scale)}
                    textAnchor="middle"
                    fontSize={22 / Math.sqrt(scale)}
                    fontWeight="700"
                    fill="#453830"
                    className="text-halo"
                  >
                    {base?.name ?? m.name}
                  </text>
                )
              })}
            {pin && (
              <g transform={`translate(${pin[0]} ${pin[1]}) scale(${1 / Math.sqrt(scale)})`}>
                <ellipse cx="0" cy="2" rx="9" ry="4" fill="#453830" opacity="0.2" />
                <path d="M0 0 C-10 -14 -14 -20 -14 -28 A14 14 0 1 1 14 -28 C14 -20 10 -14 0 0 Z" fill="#e94747" stroke="#fff" strokeWidth="3" />
                <circle cx="0" cy="-28" r="5" fill="#fff" />
              </g>
            )}
          </g>
        </svg>
      </motion.div>
      {zoomable && (
        <div className="absolute right-2 bottom-2 flex flex-col gap-1.5" role="group" aria-label="地図のズーム">
          <ZoomButton label="拡大" onClick={() => zoomBy(1.5)}>＋</ZoomButton>
          <ZoomButton label="縮小" onClick={() => zoomBy(1 / 1.5)}>－</ZoomButton>
          <ZoomButton label="全体を表示" onClick={() => setView(base)}>⟲</ZoomButton>
        </div>
      )}
    </div>
  )
}

function clientToSvgPointIn(view: ViewBox, rect: DOMRect, client: Point): Point {
  // preserveAspectRatio="xMidYMid meet" の実効領域を計算する
  const scale = Math.min(rect.width / view.w, rect.height / view.h)
  const offsetX = (rect.width - view.w * scale) / 2
  const offsetY = (rect.height - view.h * scale) / 2
  return [view.x + (client[0] - rect.left - offsetX) / scale, view.y + (client[1] - rect.top - offsetY) / scale]
}

function ZoomButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  const { play } = useApp()
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="btn-pop focus-ring h-11 w-11 rounded-full border-2 border-line bg-white text-lg font-bold text-ink"
      onClick={() => {
        play('tap')
        onClick()
      }}
    >
      {children}
    </button>
  )
}
