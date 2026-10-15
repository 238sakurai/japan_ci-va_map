import { motion } from 'motion/react'
import { getMunicipality } from '../../data/municipalities'
import { QUIZ_POOL_BY_CODE } from '../../data/quiz-pool'
import { REGION_BY_ID } from '../../data/regions'
import type { LastResult } from '../../types'
import { Sparkles } from '../effects/Sparkles'
import { Button } from '../ui/Button'
import { Ruby } from '../ui/Ruby'

interface FeedbackCardProps {
  result: LastResult
  isLast: boolean
  onNext: () => void
  /** 自動で進むモードでは「つぎへ」ボタンを出さない */
  showNext: boolean
}

export function FeedbackCard({ result, isLast, onNext, showNext }: FeedbackCardProps) {
  const target = getMunicipality(result.targetCode)
  const quiz = QUIZ_POOL_BY_CODE.get(result.targetCode)
  const answered = result.answeredCode !== result.targetCode ? getMunicipality(result.answeredCode) : null
  const region = REGION_BY_ID[target.region]

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`relative rounded-3xl border-4 p-4 shadow-card ${result.correct ? 'border-correct bg-white' : 'border-wrong bg-white'}`}
      role="status"
      aria-live="assertive"
      data-testid="feedback"
      data-correct={result.correct}
    >
      {result.correct && <Sparkles />}
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white ${result.correct ? 'bg-correct' : 'bg-wrong'}`} aria-hidden="true">
          {result.correct ? '○' : '△'}
        </span>
        <div>
          <p className={`text-xl font-black leading-tight sm:text-2xl ${result.correct ? 'text-correct-dark' : 'text-wrong-dark'}`}>
            {result.correct ? 'だいせいかい！' : 'おしい！もうちょっと！'}
          </p>
          <p className="text-sm font-bold text-ink-soft">
            {result.correct ? (
              <>+{result.points}てん！</>
            ) : (
              <>
                せいかいは <Ruby text={target.name} kana={target.kana} className="text-ink" /> だったよ
              </>
            )}
          </p>
        </div>
      </div>

      {answered && (
        <p className="mt-2 rounded-2xl bg-cream/70 px-3 py-2 text-sm font-bold">
          えらんだ <Ruby text={answered.name} kana={answered.kana} /> は オレンジの ✕ のところ。
          <Ruby text={target.name} kana={target.kana} /> は みどりの ★ のところだよ。
        </p>
      )}

      <div className="mt-3 rounded-2xl bg-sky/40 px-3 py-2">
        <p className="text-xs font-bold text-ink-soft">
          <Ruby text={target.name} kana={target.kana} /> は <Ruby text={`${region.label}地域`} kana={`${region.kana}ちいき`} />
        </p>
        {quiz && (
          <p className="mt-1 text-base font-bold leading-relaxed" data-testid="trivia">
            <span className="mr-1" aria-hidden="true">💡</span>
            {quiz.trivia}
          </p>
        )}
        {quiz && (
          <a className="mt-1 inline-block text-[11px] text-ink-soft underline" href={quiz.triviaSource.url} target="_blank" rel="noreferrer noopener">
            出典: {quiz.triviaSource.title}
          </a>
        )}
      </div>

      {showNext && (
        <div className="mt-3 flex justify-end">
          <Button size="lg" variant={result.correct ? 'correct' : 'primary'} onClick={onNext} data-testid="next-button" autoFocus>
            {isLast ? 'けっかを見る ▶' : 'つぎへ ▶'}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
