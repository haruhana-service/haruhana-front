import type { ReactNode } from 'react'

interface ViewportScrollProps {
  children: ReactNode
  className?: string
}

export function ViewportScroll({ children, className = '' }: ViewportScrollProps) {
  return (
    <div className="min-h-[100dvh] h-screen bg-[#F8FAFC] overflow-hidden">
      <div
        data-scroll-container="true"
        className={`h-full overflow-y-auto overscroll-none no-scrollbar [@supports(-webkit-overflow-scrolling:touch)]:[-webkit-overflow-scrolling:touch] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
