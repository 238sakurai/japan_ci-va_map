import { motion } from 'motion/react'
import { useApp } from '../app/AppContext'
import { ChibaMap } from '../components/map/ChibaMap'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { Mascot } from '../components/ui/Mascot'
import { QUIZ_POOL } from '../data/quiz-pool'
import type { AreaStyle } from '../components/map/ChibaMap'

interface TitleScreenProps {
  onPlay: () => void
  onHowTo: () => void
  onZukan: () => void
}

export function TitleScreen({ onPlay, onHowTo, onZukan }: TitleScreenProps) {
  const { geo, geoError, soundEnabled, toggleSound, reducedMotion, save } = useApp()
  const discoveredCount = QUIZ_POOL.filter((m) => m.code in save.discovered).length
  const styles: Partial<Record<string, AreaStyle>> = {}
  for (const m of QUIZ_POOL) if (!(m.code in save.discovered) && discoveredCount > 0) styles[m.code] = 'undiscovered'

  return (
    <div className="safe-pad relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center gap-3" data-testid="title-screen">
      <div className="flex w-full items-center justify-end pt-1">
        <IconButton label={soundEnabled ? '音をけす' : '音をだす'} onClick={toggleSound} aria-pressed={soundEnabled} data-testid="sound-toggle">
          {soundEnabled ? '🔊' : '🔇'}
        </IconButton>
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center"
      >
        <h1 className="text-[2.1rem] font-black leading-tight text-primary drop-shadow-[0_3px_0_rgba(255,255,255,0.9)] sm:text-5xl">
          <span className="block text-2xl text-ink sm:text-3xl">チーバくんの</span>
          <span className="block">ど〜こだ？</span>
        </h1>
        <p className="mt-1 rounded-full bg-cream px-4 py-1 text-sm font-bold text-ink shadow-pop-sm">千葉県まるごと！ご当地タップクイズ</p>
      </motion.div>

      <motion.div
        className="relative h-[36vh] min-h-[220px] w-full max-w-sm"
        animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {geo ? (
          <ChibaMap geo={geo} styles={styles} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[2rem] bg-sky/30 text-sm font-bold text-ink-soft" aria-live="polite">
            {geoError ? `地図を読み込めませんでした: ${geoError}` : '地図を じゅんびちゅう…'}
          </div>
        )}
        <div className="pointer-events-none absolute -bottom-2 -left-2 sm:-left-6">
          <Mascot size={78} />
        </div>
        <div className="pointer-events-none absolute -right-1 top-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-bold shadow-card">
          チーバくんの体を<br />タップしてね！
        </div>
      </motion.div>

      <p className="text-center text-sm font-bold text-ink-soft">チーバくんの体をタップして、千葉県マスターになろう！</p>

      <div className="flex w-full max-w-xs flex-col gap-3 pb-2">
        <Button size="lg" onClick={onPlay} disabled={!geo} className="w-full text-2xl" data-testid="play-button">
          あそぶ！
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="sky" onClick={onHowTo} data-testid="howto-button" className="whitespace-nowrap">
            あそびかた
          </Button>
          <Button variant="mint" onClick={onZukan} data-testid="zukan-button" className="relative whitespace-nowrap">
            ちばずかん
            {discoveredCount > 0 && (
              <span className="absolute -right-1 -top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold shadow-pop-sm">
                {discoveredCount}/{QUIZ_POOL.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <footer className="mt-auto pb-1 text-center text-[11px] leading-relaxed text-ink-soft">
        地図: 国土数値情報（行政区域データ）国土交通省 を加工
        {geo && <>（{geo.source.referenceDate} 時点）</>}
      </footer>
    </div>
  )
}
