import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  title?: string
  subtitle?: string
  variant?: 'default' | 'glass' | 'dark'
}

export function Card({ children, className = '', onClick, title, subtitle, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    glass: 'glass shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    dark: 'mesh-gradient text-white border-white/5 shadow-2xl',
  }

  return (
    <div
      className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
        onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] active:scale-[0.98]' : ''
      } ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-2">
          {title && <h3 className="text-[13px] font-extrabold text-slate-700 tracking-tight leading-tight uppercase">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1.5 font-medium">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}
