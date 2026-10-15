import { motion } from 'motion/react'
import { useApp } from '../../app/AppContext'
import { MODES } from '../../app/modes'
import { displaySeconds, isUrgent } from '../../lib/timer'
import type { GameState } from '../../types'
import { AnimatedNumber } from '../effects/AnimatedNumber'
import { ScorePop } from '../effects/ScorePop'
import { IconButton } from '../ui/IconButton'

interface QuizHudProps {
  state: GameState
  remainingMs: number | null
  onQuit: () => void
}

export function QuizHud({ state, remainingMs, onQuit }: QuizHudProps) {
  const mode = MODES[state.mode]
  const { soundEnabled, toggleSound, reducedMotion } = useApp()
  const urgent = remainingMs !== null && isUrgent(remainingMs)
  const seconds = remainingMs !== null ? displaySeconds(remainingMs) : null

  return (
    <header className="flex min-w-0 items-center justify-between gap-1 xs:gap-1.5" data-testid="quiz-hud">
      <div className="flex min-w-0 items-center gap-1 xs:gap-2">
        <IconButton label="やめてタイトルへもどる" onClick={onQuit} className="h-10 w-10 shrink-0 text-base xs:h-11 xs:w-11">
          ←
        </IconButton>
        <div className="whitespace-nowrap rounded-full bg-white/90 px-2 py-1.5 text-sm font-bold text-ink shadow-pop-sm xs:px-2.5">
          {mode.questionCount
            ? <span><span className="hidden xs:inline">もんだい </span><span className="text-lg text-primary">{Math.min(state.index + 1, mode.questionCount)}</span> / {mode.questionCount}</span>
            : <span><span className="hidden xs:inline">こたえた </span><span className="text-lg text-primary">{state.records.length}</span> もん</span>}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1 xs:gap-2">
        {mode.timeLimit !== null && seconds !== null ? (
          <motion.div
            className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold shadow-pop-sm ${urgent ? 'bg-primary text-white' : 'bg-white/90 text-ink'}`}
            animate={urgent && !reducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
            role="timer"
            aria-live={urgent ? 'assertive' : 'off'}
            aria-label={`のこり ${seconds} びょう`}
            data-testid="timer"
          >
            <span aria-hidden="true">⏱</span>
            <span className="text-lg tabular-nums">{seconds}</span>
            <span className="text-xs">びょう</span>
          </motion.div>
        ) : mode.attempts > 1 ? (
          <div className="flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-1.5 shadow-pop-sm" aria-label={`のこり ${state.attemptsLeft} かい`} data-testid="lives">
            {Array.from({ length: mode.attempts }, (_, i) => (
              <span key={i} className={`text-lg leading-none ${i < state.attemptsLeft ? 'text-primary' : 'text-line'}`} aria-hidden="true">
                ♥
              </span>
            ))}
          </div>
        ) : null}
        <div className="relative whitespace-nowrap rounded-full bg-cream px-2.5 py-1.5 text-sm font-bold text-ink shadow-pop-sm xs:px-3" data-testid="score">
          <span className="text-xs"><span className="hidden xs:inline">スコア</span><span className="xs:hidden" aria-hidden="true">★</span></span>{' '}
          <AnimatedNumber value={state.score} className="text-lg tabular-nums" />
          <ScorePop points={state.lastResult?.correct ? state.lastResult.points : 0} popKey={state.records.length} />
        </div>
        <IconButton label={soundEnabled ? '音をけす' : '音をだす'} onClick={toggleSound} className="h-10 w-10 shrink-0 text-base xs:h-11 xs:w-11" aria-pressed={soundEnabled}>
          {soundEnabled ? '🔊' : '🔇'}
        </IconButton>
      </div>
    </header>
  )
}
