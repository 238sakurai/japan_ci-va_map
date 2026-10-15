import { motion } from 'motion/react'
import { useApp } from '../app/AppContext'
import { MODE_LIST } from '../app/modes'
import { IconButton } from '../components/ui/IconButton'
import type { ModeConfig, ModeId } from '../types'

interface ModeSelectScreenProps {
  onSelect: (mode: ModeId) => void
  onBack: () => void
}

const STARS: Record<ModeId, number> = { easy: 1, normal: 2, challenge: 3 }
const TONES: Record<ModeId, string> = { easy: 'bg-mint', normal: 'bg-sky', challenge: 'bg-cream' }
const ICONS: Record<ModeId, string> = { easy: '🗺️', normal: '✨', challenge: '⏱️' }

export function ModeSelectScreen({ onSelect, onBack }: ModeSelectScreenProps) {
  const { save, play, reducedMotion } = useApp()
  return (
    <div className="safe-pad mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3" data-testid="mode-screen">
      <div className="flex items-center gap-2 pt-1">
        <IconButton label="タイトルへもどる" onClick={onBack}>←</IconButton>
        <h2 className="text-2xl font-black">どのモードで あそぶ？</h2>
      </div>
      <ul className="flex flex-col gap-3">
        {MODE_LIST.map((mode, i) => (
          <motion.li
            key={mode.id}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
          >
            <ModeCard
              mode={mode}
              highScore={save.highScores[mode.id]}
              reducedMotion={reducedMotion}
              onClick={() => {
                play('tap')
                onSelect(mode.id)
              }}
            />
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function ModeCard({ mode, highScore, reducedMotion, onClick }: { mode: ModeConfig; highScore: number; reducedMotion: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      className={`btn-pop focus-ring flex w-full items-center gap-3 rounded-3xl p-4 text-left ${TONES[mode.id]}`}
      data-testid={`mode-${mode.id}`}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-pop-sm" aria-hidden="true">
        {ICONS[mode.id]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="text-xl font-black">{mode.label}</span>
          <span className="text-sm font-bold text-primary" aria-label={`むずかしさ ${STARS[mode.id]}`}>
            {'★'.repeat(STARS[mode.id])}
            <span className="text-line">{'★'.repeat(3 - STARS[mode.id])}</span>
          </span>
        </span>
        <span className="block text-lg font-bold">{mode.title}</span>
        <span className="block text-sm text-ink-soft">{mode.description}</span>
        {highScore > 0 && <span className="mt-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">ハイスコア {highScore}てん</span>}
      </span>
      <span className="text-2xl text-ink-soft" aria-hidden="true">▶</span>
    </motion.button>
  )
}
