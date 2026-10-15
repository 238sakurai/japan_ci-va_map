#!/usr/bin/env node
/**
 * SNS シェア用のアイキャッチ画像（OGP, 1200×630）を生成する。
 *
 * 地図は public/data/chiba-municipalities.json（国土数値情報 N03 を加工）から描き、
 * マスコットはオリジナルの「ピーちゃん」（落花生）。公式キャラクター画像は使わない。
 * HTML を組み立てて Playwright の Chromium でスクリーンショットを撮る。
 *
 * 出力: public/og-image.png
 */
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'public', 'og-image.png')
const WIDTH = 1200
const HEIGHT = 630

const geo = JSON.parse(await readFile(join(ROOT, 'public', 'data', 'chiba-municipalities.json'), 'utf8'))

// 地域ごとのパステルカラー（src/data/regions.ts と同じ配色）
const REGION_COLORS = {
  higashikatsushika: '#C7B8F5', katsunan: '#FFC2D1', chiba: '#FFA3A3', inba: '#FFE28A',
  katori: '#B5E8B0', kaiso: '#9AD9F5', sanbu: '#B8E4FF', chosei: '#A8E6CF',
  isumi: '#FFD6A5', awa: '#FFB3A7', kimitsu: '#CDEAA6', ichihara: '#FFF1B8',
}
// コード → 地域（src/data/municipalities.ts から抽出）
const muniSrc = await readFile(join(ROOT, 'src', 'data', 'municipalities.ts'), 'utf8')
const regionByCode = Object.fromEntries(
  [...muniSrc.matchAll(/code: '(\d{5})'.*?region: '(\w+)'/g)].map((m) => [m[1], m[2]]),
)

const pathD = (polygons) =>
  polygons.map((rings) => rings.map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + 'Z').join('')).join('')

const [, , vw, vh] = geo.viewBox
const paths = geo.municipalities
  .map((m) => `<path d="${pathD(m.polygons)}" fill="${REGION_COLORS[regionByCode[m.code]] ?? '#eee'}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>`)
  .join('')

// ハイライト（光っている市）として成田市を黄色に
const narita = geo.municipalities.find((m) => m.code === '12211')
const highlight = `<path d="${pathD(narita.polygons)}" fill="#FFE066" stroke="#F5B800" stroke-width="6" stroke-linejoin="round"/>`
// ピンは鎌ケ谷市あたり
const pin = geo.municipalities.find((m) => m.code === '12224').centroid

const fontCss = pathToFileURL(join(ROOT, 'node_modules', '@fontsource', 'zen-maru-gothic', '700.css')).href
const fontCss500 = pathToFileURL(join(ROOT, 'node_modules', '@fontsource', 'zen-maru-gothic', '500.css')).href

const mascot = `
<svg viewBox="0 0 100 110" width="150" height="165">
  <ellipse cx="50" cy="104" rx="26" ry="5" fill="#453830" opacity="0.12"/>
  <path d="M50 8 C28 8 22 26 26 40 C29 50 24 56 24 70 C24 90 36 102 50 102 C64 102 76 90 76 70 C76 56 71 50 74 40 C78 26 72 8 50 8 Z" fill="#F2C27B" stroke="#D89B4E" stroke-width="3"/>
  <path d="M34 46 Q50 40 66 46" stroke="#E0AE63" stroke-width="2" fill="none"/>
  <path d="M32 24 Q50 18 68 24" stroke="#E0AE63" stroke-width="2" fill="none"/>
  <circle cx="40" cy="54" r="4" fill="#453830"/><circle cx="60" cy="54" r="4" fill="#453830"/>
  <circle cx="41.5" cy="52.5" r="1.4" fill="#fff"/><circle cx="61.5" cy="52.5" r="1.4" fill="#fff"/>
  <circle cx="31" cy="62" r="4.5" fill="#FF9DAA" opacity="0.8"/><circle cx="69" cy="62" r="4.5" fill="#FF9DAA" opacity="0.8"/>
  <path d="M40 62 Q50 72 60 62" stroke="#8a3b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 72 Q14 78 18 88" stroke="#D89B4E" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M74 72 Q86 62 84 50" stroke="#D89B4E" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M44 4 Q50 -2 56 4" stroke="#7CB342" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`

const cloud = (w) => `<svg width="${w}" height="${w * 0.6}" viewBox="0 0 100 60"><ellipse cx="30" cy="40" rx="24" ry="16" fill="#fff"/><ellipse cx="55" cy="30" rx="26" ry="20" fill="#fff"/><ellipse cx="75" cy="42" rx="20" ry="14" fill="#fff"/></svg>`

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fontCss}"><link rel="stylesheet" href="${fontCss500}">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Zen Maru Gothic',sans-serif;color:#453830;
    background:#FFFDF7;
    background-image:radial-gradient(circle at 8% 15%,rgba(184,228,255,.75) 0,transparent 32%),
      radial-gradient(circle at 92% 6%,rgba(255,241,184,.95) 0,transparent 30%),
      radial-gradient(circle at 70% 100%,rgba(168,230,207,.7) 0,transparent 35%);}
  .wrap{position:relative;width:100%;height:100%;display:flex;align-items:center;padding:0 56px 0 72px}
  .text{flex:1;position:relative;z-index:2}
  .lead{font-size:46px;font-weight:700;letter-spacing:.02em}
  .title{font-size:112px;font-weight:700;color:#E94747;line-height:1.05;letter-spacing:.01em;
    text-shadow:0 6px 0 #fff, 0 10px 18px rgba(233,71,71,.18)}
  .sub{display:inline-block;margin-top:22px;background:#FFF1B8;border-radius:999px;padding:10px 26px;
    font-size:34px;font-weight:700;box-shadow:0 5px 0 rgba(69,56,48,.15)}
  .catch{margin-top:26px;font-size:28px;font-weight:500;color:#7d6b5f}
  .badges{margin-top:22px;display:flex;gap:12px}
  .badge{border-radius:999px;padding:8px 20px;font-size:24px;font-weight:700;box-shadow:0 4px 0 rgba(69,56,48,.14)}
  .mapbox{position:relative;width:440px;height:560px;flex:none}
  .mapbox svg.map{width:100%;height:100%;filter:drop-shadow(0 14px 14px rgba(69,56,48,.18))}
  .bubble{position:absolute;top:24px;right:-6px;background:#fff;border-radius:24px;padding:12px 20px;
    font-size:24px;font-weight:700;box-shadow:0 8px 20px -6px rgba(69,56,48,.3);line-height:1.35}
  .mascot{position:absolute;left:-36px;bottom:6px}
  .star{position:absolute;color:#FFD43B}
  .cloud{position:absolute}
</style></head><body><div class="wrap">
  <div class="cloud" style="left:40px;top:28px">${cloud(110)}</div>
  <div class="cloud" style="left:560px;bottom:30px;opacity:.9">${cloud(90)}</div>
  <span class="star" style="left:600px;top:40px;font-size:40px">★</span>
  <span class="star" style="left:690px;top:520px;font-size:28px">✦</span>
  <span class="star" style="right:40px;top:300px;font-size:30px">✦</span>
  <div class="text">
    <div class="lead">チーバくんの</div>
    <div class="title">ど〜こだ？</div>
    <div class="sub">千葉県まるごと！ご当地タップクイズ</div>
    <div class="catch">地図をタップして、千葉県マスターになろう！</div>
    <div class="badges">
      <span class="badge" style="background:#A8E6CF">どこにあるかな？</span>
      <span class="badge" style="background:#B8E4FF">ここは何市？</span>
      <span class="badge" style="background:#FFE066">60びょう</span>
    </div>
  </div>
  <div class="mapbox">
    <svg class="map" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">${paths}${highlight}
      <g transform="translate(${pin[0]} ${pin[1]}) scale(2.2)">
        <ellipse cx="0" cy="2" rx="9" ry="4" fill="#453830" opacity="0.2"/>
        <path d="M0 0 C-10 -14 -14 -20 -14 -28 A14 14 0 1 1 14 -28 C14 -20 10 -14 0 0 Z" fill="#E94747" stroke="#fff" stroke-width="3"/>
        <circle cx="0" cy="-28" r="5" fill="#fff"/>
      </g>
    </svg>
    <div class="bubble">ここは<br>どこかな？</div>
    <div class="mascot">${mascot}</div>
  </div>
</div></body></html>`

const dir = await mkdtemp(join(tmpdir(), 'ogp-'))
const htmlPath = join(dir, 'og.html')
await writeFile(htmlPath, html)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(htmlPath).href)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: OUT, type: 'png' })
} finally {
  await browser.close()
  await rm(dir, { recursive: true, force: true })
}
console.log(`Wrote ${OUT}`)
