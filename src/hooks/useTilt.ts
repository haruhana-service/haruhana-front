import { useCallback, useRef } from 'react'

interface TiltOptions {
  maxTilt?: number
  scale?: number
  glare?: boolean
}

export function useTilt({ maxTilt = 8, scale = 1.01 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 ~ 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(1000px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) scale(${scale})`
    },
    [maxTilt, scale]
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
