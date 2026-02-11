import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

  const variants = {
    primary: 'bg-haru-500 text-white hover:bg-haru-600 shadow-lg shadow-haru-500/25 font-extrabold',
    secondary: 'bg-haru-50 text-haru-700 hover:bg-haru-100 shadow-sm font-semibold',
    outline:
      'border-2 border-slate-200 text-slate-700 hover:border-haru-300 hover:text-haru-700 bg-white font-semibold',
    ghost: 'text-slate-600 hover:text-haru-700 hover:bg-haru-50 font-semibold',
  }

  const sizes = {
    sm: 'px-4 py-2.5 text-[13px]',
    md: 'px-6 py-3.5 text-[15px]',
    lg: 'px-8 py-4 text-base',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
