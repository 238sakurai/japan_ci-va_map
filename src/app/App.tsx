import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { applySummary } from '../lib/storage'
import { debugOptionsFromLocation } from '../lib/random'
import { HowToScreen } from '../screens/HowToScreen'
import { ModeSelectScreen } from '../screens/ModeSelectScreen'
import { QuizScreen } from '../screens/QuizScreen'
import { ResultScreen } from '../screens/ResultScreen'
import { TitleScreen } from '../screens/TitleScreen'
import { ZukanScreen } from '../screens/ZukanScreen'
import type { GameSummary, ModeId } from '../types'
import { AppProvider, useApp } from './AppContext'

type Screen =
  | { name: 'title' }
  | { name: 'howto' }
  | { name: 'modes' }
  | { name: 'quiz'; mode: ModeId; run: number }
  | { name: 'result'; summary: GameSummary }
  | { name: 'zukan'; from: 'title' | 'result' }

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}

function Router() {
  const { geo, updateSave, play } = useApp()
  const [screen, setScreen] = useState<Screen>({ name: 'title' })
  const [lastSummary, setLastSummary] = useState<GameSummary | null>(null)
  const debug = useMemo(() => (typeof window === 'undefined' ? {} : debugOptionsFromLocation(window.location.search)), [])
  const seed = debug.seed

  // 何回目のプレイかを数える。seed 指定時は seed + run で出題順が決まる（同じ問題の連続を避ける）
  const runRef = useRef(0)
  const startMode = useCallback((mode: ModeId) => {
    runRef.current += 1
    const run = runRef.current
    setScreen({ name: 'quiz', mode, run })
  }, [])

  const finish = useCallback(
    (summary: GameSummary) => {
      updateSave((prev) => applySummary(prev, summary))
      if (summary.correctCodes.length > 0) play('discover')
      setLastSummary(summary)
      setScreen({ name: 'result', summary })
    },
    [updateSave, play],
  )

  const key = screen.name === 'quiz' ? `quiz-${screen.run}` : screen.name

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22 }}
        className="min-h-dvh"
      >
        {screen.name === 'title' && (
          <TitleScreen onPlay={() => setScreen({ name: 'modes' })} onHowTo={() => setScreen({ name: 'howto' })} onZukan={() => setScreen({ name: 'zukan', from: 'title' })} />
        )}
        {screen.name === 'howto' && <HowToScreen onBack={() => setScreen({ name: 'title' })} onPlay={() => setScreen({ name: 'modes' })} />}
        {screen.name === 'modes' && <ModeSelectScreen onSelect={startMode} onBack={() => setScreen({ name: 'title' })} />}
        {screen.name === 'quiz' && geo && (
          <QuizScreen
            geo={geo}
            mode={screen.mode}
            seed={seed === undefined ? undefined : seed + screen.run}
            timeLimitOverride={debug.timeLimit}
            onFinish={finish}
            onQuit={() => setScreen({ name: 'title' })}
          />
        )}
        {screen.name === 'quiz' && !geo && <p className="safe-pad text-center">地図を じゅんびちゅう…</p>}
        {screen.name === 'result' && (
          <ResultScreen
            summary={screen.summary}
            onReplay={() => startMode(screen.summary.mode)}
            onModes={() => setScreen({ name: 'modes' })}
            onZukan={() => setScreen({ name: 'zukan', from: 'result' })}
            onTitle={() => setScreen({ name: 'title' })}
          />
        )}
        {screen.name === 'zukan' && (
          <ZukanScreen
            onBack={() => setScreen(screen.from === 'result' && lastSummary ? { name: 'result', summary: lastSummary } : { name: 'title' })}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
