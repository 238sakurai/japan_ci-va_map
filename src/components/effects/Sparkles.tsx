import { motion } from 'motion/react'
import { useApp } from '../../app/AppContext'

const SPOTS = [
  { left: '4%', top: '10%', size: 22, delay: 0 },
  { left: '92%', top: '14%', size: 16, delay: 0.3 },
  { left: '10%', top: '78%', size: 14, delay: 0.6 },
  { left: '88%', top: '74%', size: 20, delay: 0.15 },
  { left: '50%', top: '-6%', size: 18, delay: 0.45 },
]

/** カードのまわりでキラキラする星 */
export function Sparkles({ color = '#ffd43b' }: { color?: string }) {
  const { reducedMotion } = useApp()
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {SPOTS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: s.left, top: s.top, fontSize: s.size, color }}
          initial={{ scale: 0, opacity: 0 }}
          animate={reducedMotion ? { scale: 1, opacity: 1 } : { scale: [0, 1.3, 1], opacity: [0, 1, 0.8], rotate: [0, 20, 0] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}
