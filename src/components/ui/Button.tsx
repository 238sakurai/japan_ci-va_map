import { motion } from 'motion/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useApp } from '../../app/AppContext'

type Variant = 'primary' | 'secondary' | 'mint' | 'sky' | 'ghost' | 'correct'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: Variant
  size?: Size
  children: ReactNode
  silent?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-white text-ink border-2 border-line',
  mint: 'bg-mint text-ink',
  sky: 'bg-sky text-ink',
  ghost: 'bg-transparent text-ink-soft shadow-none',
  correct: 'bg-correct text-white',
}

const SIZES: Record<Size, string> = {
  sm: 'min-h-11 px-4 text-base rounded-2xl',
  md: 'min-h-12 px-5 text-lg rounded-3xl',
  lg: 'min-h-14 px-7 text-xl rounded-full',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, onClick, silent, ...rest }: ButtonProps) {
  const { play, reducedMotion } = useApp()
  return (
    <motion.button
      type="button"
      whileTap={reducedMotion || rest.disabled ? undefined : { scale: 0.95 }}
      whileHover={reducedMotion || rest.disabled ? undefined : { scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={`btn-pop focus-ring inline-flex items-center justify-center gap-2 font-bold leading-tight ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      onClick={(e) => {
        if (!silent) play('tap')
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
