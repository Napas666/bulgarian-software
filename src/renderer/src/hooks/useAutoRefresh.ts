import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

export function useAutoRefresh(onRefresh: () => void) {
  const interval = useStore(s => s.autoRefreshInterval)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    if (!interval) { setCountdown(0); return }

    setCountdown(interval)
    let remaining = interval

    countdownRef.current = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
    }, 1000)

    timerRef.current = setInterval(() => {
      onRefresh()
      remaining = interval
      setCountdown(interval)
    }, interval * 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [interval])

  return countdown
}
