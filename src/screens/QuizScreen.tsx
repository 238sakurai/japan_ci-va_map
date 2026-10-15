import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useApp } from '../app/AppContext'
import { MODES } from '../app/modes'
import { Confetti } from '../components/effects/Confetti'
import { ChoiceGrid } from '../components/game/ChoiceGrid'
import { FeedbackCard } from '../components/game/FeedbackCard'
import { HintPanel } from '../components/game/HintPanel'
import { QuestionBanner } from '../components/game/QuestionBanner'
import { QuizHud } from '../components/game/QuizHud'
import { Toast } from '../components/game/Toast'
import { ChibaMap, type AreaStyle } from '../components/map/ChibaMap'
import { Button } from '../components/ui/Button'
import { MUNICIPALITIES, getMunicipality } from '../data/municipalities'
import { QUIZ_POOL } from '../data/quiz-pool'
import { useCountdown } from '../hooks/useCountdown'
import { createGame, currentQuestion, gameReducer, summarize } from '../lib/engine'
import { fiftyFifty, generateQuestions } from '../lib/quiz'
import { createRng } from '../lib/random'
import { displaySeconds, isUrgent } from '../lib/timer'
import type { GameSummary, GeoData, LgCode, ModeId, Point } from '../types'

interface QuizScreenProps {
  geo: GeoData
  mode: ModeId
  seed?: number
  /** テスト用: 制限時間（秒）の上書き */
  timeLimitOverride?: number
  onFinish: (summary: GameSummary) => void
  onQuit: () => void
}


export function QuizScreen({ geo, mode, seed, timeLimitOverride, onFinish, onQuit }: QuizScreenProps) {
  const { play, save } = useApp()
  const config = MODES[mode]
  const rng = useMemo(() => createRng(seed === undefined ? undefined : seed + 1), [seed])
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createGame(mode, generateQuestions(mode, { pool: QUIZ_POOL, geo: geo.municipalities, seed })),
  )
  const question = currentQuestion(state)
  const [candidate, setCandidate] = useState<{ code: LgCode; point: Point } | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'wrong' | 'info' } | null>(null)
  const [confettiKey, setConfettiKey] = useState(0)
  const [bounceKey, setBounceKey] = useState(0)
  const [answeredChoice, setAnsweredChoice] = useState<LgCode | null>(null)
  const finishedRef = useRef(false)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((message: string, tone: 'wrong' | 'info' = 'wrong') => {
    setToast({ message, tone })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1400)
  }, [])

  // --- タイマー（チャレンジ） ---
  const timeLimit = config.timeLimit === null ? null : (timeLimitOverride ?? config.timeLimit)
  const timeLimitMs = (timeLimit ?? 0) * 1000
  const remaining = useCountdown(timeLimitMs, timeLimit !== null && state.phase !== 'finished', () =>
    dispatch({ type: 'timeUp' }),
  )
  const remainingMs = timeLimit !== null ? remaining : null
  const lastTickSecond = useRef<number | null>(null)
  useEffect(() => {
    if (remainingMs === null || !isUrgent(remainingMs)) return
    const sec = displaySeconds(remainingMs)
    if (lastTickSecond.current !== sec) {
      lastTickSecond.current = sec
      play('tick')
    }
  }, [remainingMs, play])

  // --- 終了処理 ---
  useEffect(() => {
    if (state.phase !== 'finished' || finishedRef.current) return
    finishedRef.current = true
    play('result')
    onFinish(summarize(state, save.highScores[mode]))
  }, [state, mode, onFinish, play, save.highScores])

  // --- 自動で次へ（チャレンジ） ---
  useEffect(() => {
    if (state.phase !== 'feedback' || config.autoAdvanceMs === null) return
    const id = window.setTimeout(() => dispatch({ type: 'next' }), config.autoAdvanceMs)
    return () => window.clearTimeout(id)
  }, [state.phase, state.index, config.autoAdvanceMs])

  // 問題が切り替わったらローカル状態をリセット
  useEffect(() => {
    setCandidate(null)
    setAnsweredChoice(null)
  }, [state.index])

  const answer = useCallback(
    (code: LgCode) => {
      const correct = code === question.targetCode
      const willExhaust = state.attemptsLeft <= 1
      dispatch({ type: 'answer', code })
      setCandidate(null)
      if (correct) {
        play(state.combo >= 2 && !state.hintUsed ? 'combo' : 'correct')
        setConfettiKey((k) => k + 1)
        setBounceKey((k) => k + 1)
      } else {
        play('wrong')
        if (!willExhaust) showToast(`おしい！もうちょっと！ あと${state.attemptsLeft - 1}かい`)
      }
    },
    [question.targetCode, state.attemptsLeft, state.combo, state.hintUsed, play, showToast],
  )

  const confirmTap = config.attempts > 1

  const handleTap = useCallback(
    (code: LgCode | null, point: Point) => {
      if (state.phase !== 'question' || question.type !== 'map') return
      if (code === null) {
        showToast('そこは うみだよ！ りくを タップしてね', 'info')
        return
      }
      if (!confirmTap || candidate?.code === code) {
        answer(code)
        return
      }
      play('tap')
      setCandidate({ code, point })
    },
    [state.phase, question.type, confirmTap, candidate, answer, play, showToast],
  )

  const handleChoose = useCallback(
    (code: LgCode) => {
      if (state.phase !== 'question') return
      setAnsweredChoice(code)
      answer(code)
    },
    [state.phase, answer],
  )

  const handleHint = useCallback(() => {
    if (question.type === 'choice') {
      dispatch({ type: 'hint', removed: fiftyFifty(question, rng) })
    } else {
      dispatch({ type: 'hint' })
    }
  }, [question, rng])

  // --- 地図の見た目 ---
  const styles = useMemo(() => {
    const s: Partial<Record<LgCode, AreaStyle>> = {}
    if (state.phase === 'question') {
      if (question.type === 'choice') s[question.targetCode] = 'target'
      if (state.hintUsed && question.type === 'map') {
        const region = getMunicipality(question.targetCode).region
        for (const m of MUNICIPALITIES) if (m.region === region) s[m.code] = 'hint'
      }
      for (const code of state.wrongCodes) s[code] = 'wrong'
      if (candidate) s[candidate.code] = 'candidate'
    } else if (state.lastResult) {
      for (const code of state.wrongCodes) s[code] = 'wrong'
      if (!state.lastResult.correct && state.lastResult.answeredCode !== question.targetCode) {
        s[state.lastResult.answeredCode] = 'wrong'
      }
      s[question.targetCode] = 'correct'
    }
    return s
  }, [state.phase, state.hintUsed, state.wrongCodes, state.lastResult, question, candidate])

  const labels = useMemo(() => {
    if (state.phase !== 'feedback' || !state.lastResult) return []
    const codes = [question.targetCode]
    if (!state.lastResult.correct) codes.push(state.lastResult.answeredCode)
    return codes
  }, [state.phase, state.lastResult, question.targetCode])

  // 回答後はカードが下に重なるので、正解の場所が上寄りに見えるようにズームする
  const focusCode = state.phase === 'feedback' && config.autoAdvanceMs === null ? question.targetCode : null

  const isLast = config.questionCount !== null && state.index + 1 >= state.questions.length
  const candidateName = candidate ? getMunicipality(candidate.code) : null

  return (
    <div className="safe-pad mx-auto flex h-dvh w-full max-w-lg flex-col gap-2" data-testid="quiz-screen" data-mode={mode}>
      <QuizHud state={state} remainingMs={remainingMs} onQuit={onQuit} />
      <QuestionBanner question={question} index={state.index} />

      <div className="relative min-h-0 flex-1">
        <ChibaMap
          geo={geo}
          styles={styles}
          interactive={state.phase === 'question' && question.type === 'map'}
          zoomable
          onTap={handleTap}
          focusCode={focusCode}
          focusShiftY={0.3}
          labels={labels}
          bounceKey={bounceKey}
          pin={candidate?.point ?? null}
        />
        <Toast message={toast?.message ?? null} tone={toast?.tone} />
        {state.combo >= 2 && state.phase === 'feedback' && state.lastResult?.correct && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-sm font-black text-white shadow-pop-sm" data-testid="combo">
            {state.combo}れんぞく！
          </div>
        )}
        <AnimatePresence>
          {state.phase === 'feedback' && state.lastResult && (
            <div className="absolute inset-x-0 bottom-0 z-30 max-h-full overflow-y-auto p-1 scrollbar-thin">
              <FeedbackCard
                result={state.lastResult}
                isLast={isLast}
                showNext={config.autoAdvanceMs === null}
                onNext={() => dispatch({ type: 'next' })}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {state.phase === 'question' && (
        <div className="flex flex-col gap-2">
          {question.type === 'choice' ? (
            <>
              <ChoiceGrid question={question} removed={state.removedChoices} disabled={false} answered={answeredChoice} onChoose={handleChoose} />
              {config.hintAvailable && (
                <div className="flex justify-end">
                  <HintPanel question={question} used={state.hintUsed} disabled={false} onUse={handleHint} />
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-14 items-center justify-between gap-2">
              {config.hintAvailable ? (
                <HintPanel question={question} used={state.hintUsed} disabled={false} onUse={handleHint} />
              ) : (
                <p className="text-sm font-bold text-ink-soft">地図を タップ！</p>
              )}
              {confirmTap && (
                <div className="flex shrink-0 items-center gap-2">
                  {candidateName ? (
                    <Button size="md" onClick={() => answer(candidate!.code)} data-testid="confirm-button" variant="primary">
                      ここで けってい！
                    </Button>
                  ) : (
                    <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-ink-soft">タップして えらんでね</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Confetti burstKey={confettiKey} />
    </div>
  )
}
