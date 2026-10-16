import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useApp } from '../app/AppContext'
import { MODES } from '../app/modes'
import { AnimatedNumber } from '../components/effects/AnimatedNumber'
import { Confetti } from '../components/effects/Confetti'
import { Sparkles } from '../components/effects/Sparkles'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Mascot } from '../components/ui/Mascot'
import { Ruby } from '../components/ui/Ruby'
import { getMunicipality } from '../data/municipalities'
import { titleFor } from '../data/titles'
import { accuracy } from '../lib/scoring'
import { browserShareEnv, buildShareText, shareResult } from '../lib/share'
import type { GameSummary } from '../types'

interface ResultScreenProps {
  summary: GameSummary
  onReplay: () => void
  onModes: () => void
  onZukan: () => void
  onTitle: () => void
}

export function ResultScreen({ summary, onReplay, onModes, onZukan, onTitle }: ResultScreenProps) {
  const { reducedMotion } = useApp()
  const mode = MODES[summary.mode]
  const rank = titleFor(summary.mode, summary.correct, summary.score)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const [confettiKey, setConfettiKey] = useState(0)

  useEffect(() => {
    if (summary.correct > 0) setConfettiKey(1)
  }, [summary.correct])

  const share = async () => {
    const url = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`
    const outcome = await shareResult(buildShareText(summary, url), browserShareEnv())
    setShareNote(outcome === 'copied' ? 'けっかを コピーしたよ！' : outcome === 'failed' ? 'シェアできなかったよ' : null)
  }

  return (
    <div className="safe-pad mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3" data-testid="result-screen">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="relative pt-2 text-center">
        <Sparkles />
        <p className="text-sm font-bold text-ink-soft">{mode.label}モード けっか</p>
        <h2 className="text-3xl font-black text-primary">けっかはっぴょう！</h2>
      </motion.div>

      <Card tone="cream" className="relative flex items-center gap-3 p-4">
        <Mascot size={56} mood={summary.correct >= 7 || summary.score >= 1000 ? 'wow' : 'happy'} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-soft">かくとく した しょうごう</p>
          <p className="text-xl font-black leading-tight sm:text-2xl" data-testid="rank-title">
            <Ruby text={rank.title} kana={rank.kana} />
          </p>
          <p className="mt-1 text-sm">{rank.message}</p>
        </div>
        {summary.isNewRecord && summary.score > 0 && (
          <motion.span
            className="absolute -right-1 -top-2 rounded-full bg-primary px-2 py-1 text-xs font-black text-white shadow-pop-sm"
            animate={reducedMotion ? undefined : { rotate: [-6, 6, -6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            data-testid="new-record"
          >
            ハイスコア！
          </motion.span>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="せいかい" value={summary.correct} suffix={summary.mode === 'challenge' ? 'もん' : `/${summary.answered}もん`} testId="stat-correct" />
        <Stat label="せいとうりつ" value={accuracy(summary.correct, summary.answered)} suffix="%" />
        <Stat label="スコア" value={summary.score} suffix="てん" testId="stat-score" />
        <Stat label="さいだいコンボ" value={summary.maxCombo} suffix="れんぞく" />
      </div>

      {summary.wrongCodes.length > 0 && (
        <Card className="p-3">
          <p className="text-sm font-black">まちがえた市町村（つぎは がんばろう！）</p>
          <ul className="mt-2 flex flex-wrap gap-2" data-testid="wrong-list">
            {summary.wrongCodes.map((code) => {
              const m = getMunicipality(code)
              return (
                <li key={code} className="rounded-full bg-wrong/60 px-3 py-1 text-sm font-bold">
                  <Ruby text={m.name} kana={m.kana} />
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <div className="mt-auto flex flex-col gap-2 pb-2">
        <Button size="lg" onClick={onReplay} data-testid="replay-button">もういちど あそぶ！</Button>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={onModes}>モード</Button>
          <Button variant="mint" size="sm" onClick={onZukan} data-testid="result-zukan-button">ずかん</Button>
          <Button variant="sky" size="sm" onClick={share} data-testid="share-button">シェア</Button>
        </div>
        {shareNote && <p className="text-center text-xs font-bold text-ink-soft" role="status">{shareNote}</p>}
        <Button variant="ghost" size="sm" onClick={onTitle}>タイトルへ</Button>
      </div>
      <Confetti burstKey={confettiKey} />
    </div>
  )
}

function Stat({ label, value, suffix, testId }: { label: string; value: number; suffix: string; testId?: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-card" data-testid={testId}>
      <p className="text-xs font-bold text-ink-soft">{label}</p>
      <p className="text-2xl font-black">
        <AnimatedNumber value={value} />
        <span className="ml-0.5 text-sm">{suffix}</span>
      </p>
    </div>
  )
}
