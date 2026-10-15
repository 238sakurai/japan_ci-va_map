import { useEffect, useRef, useState } from 'react'
import { remainingMs } from '../lib/timer'

/**
 * カウントダウンタイマー。running の間だけ進み、0 になったら onExpire を一度だけ呼ぶ。
 * 経過は Date.now ベースなので、タブがバックグラウンドでも実時間で減る。
 */
export function useCountdown(durationMs: number, running: boolean, onExpire: () => void): number {
  const [remaining, setRemaining] = useState(durationMs)
  const startedAtRef = useRef<number | null>(null)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!running) return
    startedAtRef.current ??= Date.now()
    const startedAt = startedAtRef.current
    const tick = () => {
      const left = remainingMs(startedAt, durationMs, Date.now())
      setRemaining(left)
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current()
      }
    }
    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [running, durationMs])

  return remaining
}
