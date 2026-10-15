import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useApp } from '../app/AppContext'
import { ChibaMap, type AreaStyle } from '../components/map/ChibaMap'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Ruby } from '../components/ui/Ruby'
import { MUNICIPALITIES, getMunicipality } from '../data/municipalities'
import { QUIZ_POOL } from '../data/quiz-pool'
import { REGION_BY_ID } from '../data/regions'
import { weakSpots } from '../lib/storage'

export function ZukanScreen({ onBack }: { onBack: () => void }) {
  const { geo, save, reducedMotion } = useApp()
  const discovered = QUIZ_POOL.filter((m) => m.code in save.discovered)
  const rate = Math.round((discovered.length / QUIZ_POOL.length) * 100)
  const weak = weakSpots(save, 5)

  const styles = useMemo(() => {
    const s: Partial<Record<string, AreaStyle>> = {}
    const pool = new Set(QUIZ_POOL.map((m) => m.code))
    for (const m of MUNICIPALITIES) {
      if (!pool.has(m.code)) s[m.code] = 'dim'
      else s[m.code] = m.code in save.discovered ? 'discovered' : 'undiscovered'
    }
    return s
  }, [save.discovered])

  return (
    <div className="safe-pad mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3" data-testid="zukan-screen">
      <div className="flex items-center gap-2 pt-1">
        <IconButton label="もどる" onClick={onBack}>←</IconButton>
        <h2 className="text-2xl font-black">ちばずかん</h2>
      </div>

      <Card tone="cream" className="p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm font-bold text-ink-soft">みつけた市</p>
          <p className="text-2xl font-black" data-testid="discovered-count">
            {discovered.length}
            <span className="text-sm"> / {QUIZ_POOL.length}</span>
          </p>
        </div>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100} aria-label="コンプリートりつ">
          <motion.div className="h-full rounded-full bg-correct" initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: reducedMotion ? 0 : 0.8 }} />
        </div>
        <p className="mt-1 text-right text-xs font-bold">コンプリートりつ {rate}%</p>
      </Card>

      <div className="h-[34vh] min-h-[200px] w-full">
        {geo && <ChibaMap geo={geo} styles={styles} colorMode="mono" />}
      </div>
      <p className="text-center text-xs text-ink-soft">せいかいした市から 色が ついていくよ！（いまは 20市、これから 54市町村に ふえるよ）</p>

      {weak.length > 0 && (
        <Card className="p-3">
          <p className="text-sm font-black">にがてな市（まちがえた かいすう）</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {weak.map(({ code, count }) => {
              const m = getMunicipality(code)
              return (
                <li key={code} className="rounded-full bg-wrong/60 px-3 py-1 text-sm font-bold">
                  <Ruby text={m.name} kana={m.kana} /> ×{count}
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <ul className="grid grid-cols-1 gap-2 pb-4 sm:grid-cols-2" data-testid="zukan-list">
        {QUIZ_POOL.map((m, i) => {
          const entry = save.discovered[m.code]
          const region = REGION_BY_ID[m.region]
          return (
            <motion.li
              key={m.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className={`rounded-2xl p-3 shadow-card ${entry ? 'bg-white' : 'bg-line/40'}`}
              data-testid="zukan-card"
              data-discovered={Boolean(entry)}
              data-code={m.code}
            >
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white" style={{ backgroundColor: entry ? region.color : '#cfc8bf' }} aria-hidden="true" />
                <p className={`text-lg font-black ${entry ? 'text-ink' : 'text-ink-soft'}`}>
                  {entry ? <Ruby text={m.name} kana={m.kana} /> : <span>？？？</span>}
                </p>
                <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold">
                  <Ruby text={region.label} kana={region.kana} />
                </span>
              </div>
              {entry ? (
                <>
                  <p className="mt-1 text-sm leading-relaxed">{m.trivia}</p>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    せいかい {entry.count}かい ・ <a className="underline" href={m.triviaSource.url} target="_blank" rel="noreferrer noopener">出典</a>
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-ink-soft">まだ みつけていないよ。クイズで せいかいすると とうろくされるよ！</p>
              )}
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
