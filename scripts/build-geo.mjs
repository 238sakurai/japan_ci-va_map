#!/usr/bin/env node
/**
 * 国土数値情報 N03（行政区域）の GeoJSON から、ゲーム用の軽量な市町村ポリゴンデータを生成する。
 *
 * 入力: data/raw/n03/*.geojson（`npm run data:fetch` で取得。UTF-8 GeoJSON）
 * 出力: public/data/chiba-municipalities.json
 *
 * 処理内容
 *   1. 政令市（千葉市）の区を市単位に統合し、所属未定地（12000）を除外する
 *   2. 経緯度を Web メルカトル投影で平面座標に変換し、SVG viewBox（高さ 1000）に収める
 *   3. TopoJSON 化して境界を共有したまま単純化（Visvalingam）し、小さな離島を除去する
 *   4. 隣接関係・面積・重心・bbox を計算して JSON に書き出す
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { topology } from 'topojson-server'
import { feature, neighbors } from 'topojson-client'
import { presimplify, simplify, filter, filterAttachedWeight } from 'topojson-simplify'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const RAW_DIR = join(ROOT, 'data', 'raw', 'n03')
const OUT_DIR = join(ROOT, 'public', 'data')
const OUT_PATH = join(OUT_DIR, 'chiba-municipalities.json')

/** 所属未定地など、市町村として扱わないコード */
const EXCLUDED_CODES = new Set(['12000'])
/** SVG viewBox の高さ（横幅は投影後の縦横比から決まる） */
const VIEW_HEIGHT = 1000
const PADDING = 24
/** 単純化の閾値（viewBox 座標系での三角形面積）。大きいほど粗くなる */
const SIMPLIFY_MIN_WEIGHT = 0.6
/** これより小さい離島（本体と接していないリング）は描画・当たり判定から除外する */
const MIN_ISLAND_AREA = 6
/** 座標の小数点以下桁数 */
const PRECISION = 1

const pick = (props, keys) => {
  for (const k of keys) {
    const v = props[k]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return null
}

async function findGeoJson(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const hit = entries.find((e) => e.isFile() && e.name.endsWith('.geojson'))
  return hit ? { path: join(dir, hit.name), name: hit.name } : null
}

/** 区（N03_005）を持つ地物は市コード（下2桁 00）にまとめる */
function municipalityCode(props) {
  const code = pick(props, ['N03_007'])
  const ward = pick(props, ['N03_005'])
  const name = pick(props, ['N03_004'])
  if (!code || !name || EXCLUDED_CODES.has(code)) return null
  return ward ? `${code.slice(0, 3)}00` : code
}

// --- 投影 -------------------------------------------------------------------

const toRad = (deg) => (deg * Math.PI) / 180
const mercatorY = (lat) => -Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2))

function walkCoords(geometry, fn) {
  const rec = (coords, depth) =>
    depth === 0 ? fn(coords) : coords.map((c) => rec(c, depth - 1))
  if (geometry.type === 'Polygon') return { ...geometry, coordinates: rec(geometry.coordinates, 2) }
  if (geometry.type === 'MultiPolygon')
    return { ...geometry, coordinates: rec(geometry.coordinates, 3) }
  throw new Error(`Unsupported geometry: ${geometry.type}`)
}

function buildProjection(features) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const f of features) {
    walkCoords(f.geometry, ([lon, lat]) => {
      const x = lon, y = mercatorY(lat)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      return [lon, lat]
    })
  }
  // メルカトルの横方向はラジアン換算で縦と同じ尺度になる
  const scaleX = (lon) => toRad(lon)
  const spanY = maxY - minY
  const spanX = scaleX(maxX) - scaleX(minX)
  const scale = (VIEW_HEIGHT - PADDING * 2) / spanY
  const width = Math.round(spanX * scale + PADDING * 2)
  const project = ([lon, lat]) => [
    (scaleX(lon) - scaleX(minX)) * scale + PADDING,
    (mercatorY(lat) - minY) * scale + PADDING,
  ]
  return {
    project,
    viewBox: [0, 0, width, VIEW_HEIGHT],
    bboxLonLat: [minX, maxX],
    meta: { type: 'web-mercator', scale, offsetLon: minX, offsetMercY: minY, padding: PADDING },
  }
}

// --- 幾何計算 ---------------------------------------------------------------

function ringArea(ring) {
  let a = 0
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return a / 2
}

function ringCentroid(ring) {
  let cx = 0, cy = 0, a = 0
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const cross = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    cx += (ring[i][0] + ring[i + 1][0]) * cross
    cy += (ring[i][1] + ring[i + 1][1]) * cross
    a += cross
  }
  a /= 2
  return a === 0 ? ring[0] : [cx / (6 * a), cy / (6 * a)]
}

const round = (v) => Number(v.toFixed(PRECISION))

// --- メイン -----------------------------------------------------------------

async function main() {
  const src = await findGeoJson(RAW_DIR)
  if (!src) throw new Error('data/raw/n03 に GeoJSON がありません。先に `npm run data:fetch` を実行してください。')

  const raw = JSON.parse(await readFile(src.path, 'utf8'))
  const grouped = new Map()
  for (const f of raw.features ?? []) {
    const code = municipalityCode(f.properties ?? {})
    if (!code) continue
    if (!grouped.has(code)) {
      grouped.set(code, {
        code,
        name: pick(f.properties, ['N03_004']),
        county: pick(f.properties, ['N03_003']),
        polygons: [],
      })
    }
    const g = f.geometry
    if (g.type === 'Polygon') grouped.get(code).polygons.push(g.coordinates)
    else if (g.type === 'MultiPolygon') grouped.get(code).polygons.push(...g.coordinates)
  }

  const features = [...grouped.values()]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((m) => ({
      type: 'Feature',
      id: m.code,
      properties: { code: m.code, name: m.name, county: m.county },
      geometry: { type: 'MultiPolygon', coordinates: m.polygons },
    }))

  const projection = buildProjection(features)
  const projected = features.map((f) => ({
    ...f,
    geometry: walkCoords(f.geometry, projection.project),
  }))

  // 境界を共有したまま単純化する
  let topo = topology({ municipalities: { type: 'FeatureCollection', features: projected } }, 1e5)
  topo = presimplify(topo)
  topo = simplify(topo, SIMPLIFY_MIN_WEIGHT)
  topo = filter(topo, filterAttachedWeight(topo, MIN_ISLAND_AREA))

  const geometries = topo.objects.municipalities.geometries
  const adjacency = neighbors(geometries)
  const fc = feature(topo, topo.objects.municipalities)

  const municipalities = fc.features.map((f, i) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    const polygons = polys
      .map((rings) =>
        rings
          .map((ring) => ring.map(([x, y]) => [round(x), round(y)]))
          .filter((ring) => ring.length >= 4),
      )
      .filter((rings) => rings.length > 0 && Math.abs(ringArea(rings[0])) >= MIN_ISLAND_AREA / 2)
    if (polygons.length === 0) throw new Error(`${f.properties.name} のポリゴンが空になりました`)

    let largest = polygons[0][0]
    let largestArea = 0
    let area = 0
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const rings of polygons) {
      const outer = Math.abs(ringArea(rings[0]))
      const holes = rings.slice(1).reduce((s, r) => s + Math.abs(ringArea(r)), 0)
      area += outer - holes
      if (outer > largestArea) {
        largestArea = outer
        largest = rings[0]
      }
      for (const [x, y] of rings[0]) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
    const [cx, cy] = ringCentroid(largest)
    return {
      code: f.properties.code,
      name: f.properties.name,
      county: f.properties.county ?? null,
      area: round(area),
      centroid: [round(cx), round(cy)],
      bbox: [round(minX), round(minY), round(maxX), round(maxY)],
      neighbors: adjacency[i].map((j) => geometries[j].properties.code).sort(),
      polygons,
    }
  })

  const output = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      name: '国土数値情報 行政区域データ（N03）',
      provider: '国土交通省',
      url: 'https://nlftp.mlit.go.jp/ksj/',
      file: src.name,
      referenceDate: (src.name.match(/N03-(\d{8})/)?.[1] ?? '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      note: '政令市の区を市に統合し、Web メルカトル投影・単純化・小離島除去の加工を行っています。',
    },
    projection: projection.meta,
    viewBox: projection.viewBox,
    municipalities,
  }

  await mkdir(OUT_DIR, { recursive: true })
  const json = JSON.stringify(output)
  await writeFile(OUT_PATH, json)
  const points = municipalities.reduce(
    (s, m) => s + m.polygons.reduce((t, rings) => t + rings.reduce((u, r) => u + r.length, 0), 0),
    0,
  )
  console.log(
    `municipalities: ${municipalities.length}, points: ${points}, size: ${(json.length / 1024).toFixed(1)} KB, viewBox: ${projection.viewBox.join(' ')}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
