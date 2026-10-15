import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** 数字が目標値までカウントアップする */
export function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? value : 0)
  const prev = useRef(shown)

  useEffect(() => {
    if (reduced) {
      setShown(value)
      return
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    })
    prev.current = value
    return () => controls.stop()
  }, [value, reduced])

  return <span className={className}>{shown.toLocaleString('ja-JP')}</span>
}
