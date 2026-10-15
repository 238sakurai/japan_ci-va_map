import { motion } from 'motion/react'
import { useApp } from '../../app/AppContext'
import { getMunicipality } from '../../data/municipalities'
import type { LgCode, Question } from '../../types'
import { Ruby } from '../ui/Ruby'

interface ChoiceGridProps {
  question: Question
  removed: LgCode[]
  disabled: boolean
  answered: LgCode | null
  onChoose: (code: LgCode) => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function ChoiceGrid({ question, removed, disabled, answered, onChoose }: ChoiceGridProps) {
  const { play, reducedMotion } = useApp()
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="こたえをえらぶ" data-testid="choices">
      {question.choices.map((code, i) => {
        const m = getMunicipality(code)
        const isRemoved = removed.includes(code)
        const isCorrect = answered !== null && code === question.targetCode
        const isWrongPick = answered === code && code !== question.targetCode
        let tone = 'bg-white text-ink border-line'
        if (isCorrect) tone = 'bg-correct text-white border-correct-dark'
        else if (isWrongPick) tone = 'bg-wrong text-ink border-wrong-dark'
        else if (isRemoved) tone = 'bg-line/50 text-ink-soft line-through border-line'
        return (
          <motion.button
            key={code}
            type="button"
            disabled={disabled || isRemoved}
            whileTap={reducedMotion || disabled ? undefined : { scale: 0.95 }}
            className={`btn-pop focus-ring flex min-h-14 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-lg font-bold leading-tight ${tone}`}
            onClick={() => {
              play('tap')
              onChoose(code)
            }}
            data-code={code}
            aria-label={`${LETTERS[i]} ${m.name}（${m.kana}）`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${isCorrect ? 'bg-white/30' : 'bg-cream'}`} aria-hidden="true">
              {isCorrect ? '○' : isWrongPick ? '✕' : LETTERS[i]}
            </span>
            <Ruby text={m.name} kana={m.kana} />
          </motion.button>
        )
      })}
    </div>
  )
}
