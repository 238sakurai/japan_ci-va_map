import { AnimatePresence, motion } from 'motion/react'

export function Toast({ message, tone = 'wrong' }: { message: string | null; tone?: 'wrong' | 'info' }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className={`pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-base font-black shadow-card ${tone === 'wrong' ? 'bg-wrong text-ink' : 'bg-ink text-white'}`}
          role="status"
          aria-live="polite"
          data-testid="toast"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
