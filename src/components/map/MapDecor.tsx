import { motion } from 'motion/react'
import { useApp } from '../../app/AppContext'

/** 地図のまわりの雲・星・海の波（HTML 側に置くのでズームの影響を受けない） */
export function MapDecor() {
  const { reducedMotion } = useApp()
  const float = (delay: number) =>
    reducedMotion ? undefined : { y: [0, -6, 0], transition: { duration: 4, repeat: Infinity, delay, ease: 'easeInOut' as const } }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-sky/50 via-sky/25 to-mint/30" />
      <svg className="absolute inset-x-0 bottom-0 h-10 w-full opacity-60" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0 20 Q25 8 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 V40 H0 Z" fill="#b8e4ff" />
        <path d="M0 30 Q25 18 50 30 T100 30 T150 30 T200 30 T250 30 T300 30 T350 30 T400 30 V40 H0 Z" fill="#9ad9f5" opacity="0.7" />
      </svg>
      <motion.div className="absolute left-[6%] top-[6%]" animate={float(0)}>
        <Cloud width={64} />
      </motion.div>
      <motion.div className="absolute right-[8%] top-[14%]" animate={float(1.2)}>
        <Cloud width={48} />
      </motion.div>
      <motion.div className="absolute left-[10%] bottom-[18%]" animate={float(2)}>
        <Cloud width={40} />
      </motion.div>
      <span className="absolute right-[14%] top-[6%] text-xl text-sun">★</span>
      <span className="absolute left-[18%] top-[22%] text-sm text-sun">✦</span>
      <span className="absolute right-[6%] bottom-[30%] text-base text-sun">✦</span>
    </div>
  )
}

function Cloud({ width }: { width: number }) {
  return (
    <svg width={width} height={width * 0.6} viewBox="0 0 100 60">
      <ellipse cx="30" cy="40" rx="24" ry="16" fill="#fff" />
      <ellipse cx="55" cy="30" rx="26" ry="20" fill="#fff" />
      <ellipse cx="75" cy="42" rx="20" ry="14" fill="#fff" />
    </svg>
  )
}
