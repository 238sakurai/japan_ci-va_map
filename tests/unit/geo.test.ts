import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  clampViewBox,
  hitTest,
  pointInPolygon,
  pointInRing,
  polygonsToPath,
  viewBoxForMunicipality,
  zoomViewBox,
} from '../../src/lib/geo'
import type { GeoData, Point } from '../../src/types'

const square: Point[] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
const hole: Point[] = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]

async function loadGeo(): Promise<GeoData> {
  const raw = await readFile(join(process.cwd(), 'public', 'data', 'chiba-municipalities.json'), 'utf8')
  return JSON.parse(raw) as GeoData
}

describe('pointInRing / pointInPolygon', () => {
  it('detects inside and outside of a square', () => {
    expect(pointInRing([5, 5], square)).toBe(true)
    expect(pointInRing([11, 5], square)).toBe(false)
    expect(pointInRing([-1, -1], square)).toBe(false)
  })

  it('treats holes as outside', () => {
    expect(pointInPolygon([5, 5], [square, hole])).toBe(false)
    expect(pointInPolygon([2, 2], [square, hole])).toBe(true)
  })
})

describe('hitTest with real geometry', () => {
  it('maps each municipality centroid to itself', async () => {
    const geo = await loadGeo()
    let mismatches = 0
    for (const m of geo.municipalities) {
      const hit = hitTest(m.centroid, geo.municipalities)
      if (hit !== m.code) mismatches++
    }
    // 三日月形などで重心が自領域の外に出るケースがわずかにありうる
    expect(mismatches).toBeLessThanOrEqual(2)
  })

  it('returns null for the sea', async () => {
    const geo = await loadGeo()
    expect(hitTest([2, 2], geo.municipalities)).toBeNull()
  })

  it('never assigns one point to two municipalities', async () => {
    const geo = await loadGeo()
    for (const m of geo.municipalities) {
      const hits = geo.municipalities.filter((o) =>
        o.polygons.some((rings) => pointInPolygon(m.centroid, rings)),
      )
      expect(hits.length).toBeLessThanOrEqual(1)
    }
  })
})

describe('polygonsToPath', () => {
  it('emits one closed subpath per ring', () => {
    const d = polygonsToPath([[square, hole]])
    expect(d.startsWith('M0 0L10 0')).toBe(true)
    expect(d.match(/Z/g)).toHaveLength(2)
  })
})

describe('viewBox helpers', () => {
  const base = { x: 0, y: 0, w: 800, h: 1000 }

  it('zooms around a center and clamps within the base', () => {
    const v = zoomViewBox(base, 2, 400, 500)
    expect(v).toEqual({ x: 200, y: 250, w: 400, h: 500 })
    const edge = zoomViewBox(base, 2, 0, 0)
    expect(edge).toEqual({ x: 0, y: 0, w: 400, h: 500 })
  })

  it('does not zoom out beyond the base', () => {
    expect(zoomViewBox(base, 0.5, 400, 500)).toEqual(base)
    expect(clampViewBox({ x: -100, y: -100, w: 2000, h: 2000 }, base)).toEqual(base)
  })

  it('frames a municipality bbox', async () => {
    const geo = await loadGeo()
    const urayasu = geo.municipalities.find((m) => m.name === '浦安市')!
    const v = viewBoxForMunicipality({ x: 0, y: 0, w: geo.viewBox[2], h: geo.viewBox[3] }, urayasu)
    const [minX, minY, maxX, maxY] = urayasu.bbox
    expect(v.x).toBeLessThanOrEqual(minX)
    expect(v.y).toBeLessThanOrEqual(minY)
    expect(v.x + v.w).toBeGreaterThanOrEqual(maxX)
    expect(v.y + v.h).toBeGreaterThanOrEqual(maxY)
    expect(v.w).toBeLessThan(geo.viewBox[2])
  })
})
