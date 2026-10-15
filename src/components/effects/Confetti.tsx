import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useApp } from '../../app/AppContext'

const COLORS = ['#e94747', '#ffe066', '#a8e6cf', '#b8e4ff', '#ffb56b', '#c7b8f5', '#ff9daa']
const PIECES = 36

/** 紙吹雪。key を変えるたびに新しく降る。動きを減らす設定では表示しない */
export function Confetti({ burstKey }: { burstKey: number }) {
  const { reducedMotion } = useApp()
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: `${burstKey}-${i}`,
        x: Math.random() * 100,
        delay: Math.random() * 0.25,
        drift: (Math.random() - 0.5) * 120,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length]!,
        size: 8 + Math.random() * 8,
        round: Math.random() > 0.5,
      })),
    [burstKey],
  )
  if (reducedMotion || burstKey === 0) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * (p.round ? 1 : 0.6), backgroundColor: p.color, borderRadius: p.round ? '50%' : 2 }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: 1.8 + Math.random() * 0.6, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
