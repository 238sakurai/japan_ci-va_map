import { motion } from 'motion/react'
import { useApp } from '../../app/AppContext'

interface MascotProps {
  size?: number
  mood?: 'happy' | 'wow' | 'think'
  className?: string
}

/**
 * オリジナルのマスコット「ピーちゃん」（千葉の名産・落花生がモチーフ）。
 * 公式キャラクターの画像・デザインは使用していない。
 */
export function Mascot({ size = 96, mood = 'happy', className = '' }: MascotProps) {
  const { reducedMotion } = useApp()
  const mouth =
    mood === 'wow'
      ? <ellipse cx="50" cy="66" rx="6" ry="8" fill="#8a3b2b" />
      : mood === 'think'
        ? <path d="M42 66 Q50 62 58 66" stroke="#8a3b2b" strokeWidth="3" fill="none" strokeLinecap="round" />
        : <path d="M40 62 Q50 72 60 62" stroke="#8a3b2b" strokeWidth="3" fill="none" strokeLinecap="round" />

  return (
    <motion.svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      className={className}
      aria-hidden="true"
      animate={reducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, -2, 2, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="50" cy="100" rx="26" ry="5" fill="#453830" opacity="0.12" />
      <path
        d="M50 8 C28 8 22 26 26 40 C29 50 24 56 24 70 C24 90 36 102 50 102 C64 102 76 90 76 70 C76 56 71 50 74 40 C78 26 72 8 50 8 Z"
        fill="#F2C27B"
        stroke="#D89B4E"
        strokeWidth="3"
      />
      <path d="M34 46 Q50 40 66 46" stroke="#E0AE63" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M32 24 Q50 18 68 24" stroke="#E0AE63" strokeWidth="2" fill="none" opacity="0.8" />
      <circle cx="40" cy="54" r="4" fill="#453830" />
      <circle cx="60" cy="54" r="4" fill="#453830" />
      <circle cx="41.5" cy="52.5" r="1.4" fill="#fff" />
      <circle cx="61.5" cy="52.5" r="1.4" fill="#fff" />
      <circle cx="31" cy="62" r="4.5" fill="#FF9DAA" opacity="0.8" />
      <circle cx="69" cy="62" r="4.5" fill="#FF9DAA" opacity="0.8" />
      {mouth}
      <path d="M26 72 Q14 78 18 88" stroke="#D89B4E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M74 72 Q86 66 82 56" stroke="#D89B4E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M44 4 Q50 -2 56 4" stroke="#7CB342" strokeWidth="4" fill="none" strokeLinecap="round" />
    </motion.svg>
  )
}
