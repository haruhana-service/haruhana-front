import { useEffect, useRef, useState } from 'react'

interface UseCountUpOptions {
  target: number
  duration?: number
  delay?: number
}

export function useCountUp({ target, duration = 1200, delay = 150 }: UseCountUpOptions): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) {
      setCount(0)
      return
    }

    const timeoutId = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        setCount(Math.round(eased * target))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
    }
  }, [target, duration, delay])

  return count
}
