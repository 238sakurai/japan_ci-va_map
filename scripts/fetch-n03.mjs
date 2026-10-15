#!/usr/bin/env node
import { mkdir, writeFile, access } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const RAW_DIR = join(ROOT, 'data', 'raw', 'n03')
const ZIP_PATH = join(RAW_DIR, 'N03-chiba.zip')

const N03_URLS = [
  'https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2024/N03-20240101_12_GML.zip',
  'https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2023/N03-20230101_12_GML.zip',
]

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function download(url, dest) {
  console.log(`Downloading ${url} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  await pipeline(res.body, createWriteStream(dest))
}

function extractZip(zipPath, destDir) {
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(destDir, true)
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true })

  if (await exists(join(RAW_DIR, 'N03.geojson'))) {
    console.log('N03 geojson already exists, skipping fetch.')
    return
  }

  let downloaded = false
  for (const url of N03_URLS) {
    try {
      await download(url, ZIP_PATH)
      extractZip(ZIP_PATH, RAW_DIR)
      downloaded = true
      console.log(`Extracted to ${RAW_DIR}`)
      break
    } catch (err) {
      console.warn(`Failed: ${url} — ${err.message}`)
    }
  }

  if (!downloaded) {
    console.error(
      'Could not download N03 data. Place shapefile/geojson under data/raw/n03/ manually.',
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
