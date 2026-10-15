import { motion } from 'motion/react'
import { getMunicipality } from '../../data/municipalities'
import type { Question } from '../../types'
import { Ruby } from '../ui/Ruby'

interface QuestionBannerProps {
  question: Question
  index: number
}

export function QuestionBanner({ question, index }: QuestionBannerProps) {
  const target = getMunicipality(question.targetCode)
  return (
    <motion.div
      key={`${index}-${question.targetCode}`}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="relative rounded-3xl bg-white px-4 py-3 text-center shadow-card"
      data-testid="question"
      data-target={question.targetCode}
      data-type={question.type}
      aria-live="polite"
    >
      <span className="absolute -top-2 left-4 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-ink">Q{index + 1}</span>
      {question.type === 'map' ? (
        <p className="text-xl font-black leading-snug sm:text-2xl">
          <Ruby text={target.name} kana={target.kana} className="text-primary" />
          <span className="ml-1">は</span>
          <span className="ml-1 whitespace-nowrap">ど〜こだ？</span>
        </p>
      ) : (
        <p className="text-xl font-black leading-snug sm:text-2xl">
          <span className="text-primary">ひかっている</span>のは どこかな？
        </p>
      )}
    </motion.div>
  )
}
