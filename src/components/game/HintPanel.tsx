import { REGION_BY_ID } from '../../data/regions'
import { getMunicipality } from '../../data/municipalities'
import type { Question } from '../../types'
import { Button } from '../ui/Button'
import { Ruby } from '../ui/Ruby'

interface HintPanelProps {
  question: Question
  used: boolean
  disabled: boolean
  onUse: () => void
}

export function HintPanel({ question, used, disabled, onUse }: HintPanelProps) {
  const target = getMunicipality(question.targetCode)
  const region = REGION_BY_ID[target.region]
  if (!used) {
    return (
      <Button variant="sky" size="sm" onClick={onUse} disabled={disabled} data-testid="hint-button" className="whitespace-nowrap">
        <span aria-hidden="true">💡</span> ヒント
      </Button>
    )
  }
  return (
    <p className="rounded-2xl bg-sky/60 px-3 py-2 text-sm font-bold leading-snug" data-testid="hint-text" aria-live="polite">
      <span aria-hidden="true">💡</span>{' '}
      {question.type === 'map' ? (
        <>
          <Ruby text={`${region.label}地域`} kana={`${region.kana}ちいき`} />：{region.hint}
        </>
      ) : (
        <>こたえは 2つに しぼったよ！{region.hint}</>
      )}
    </p>
  )
}
