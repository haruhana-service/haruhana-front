import { type HTMLAttributes } from 'react'

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'white' | 'slate'
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
}

const variantClasses = {
  primary: 'border-haru-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  slate: 'border-slate-300 border-t-transparent',
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary',
  text,
  className = '',
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || '로딩 중'}
      {...props}
    >
      <div
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm font-medium text-slate-600">
          {text}
        </p>
      )}
    </div>
  )
}

// 전체 화면 로딩 스피너
interface FullScreenLoadingProps {
  text?: string
}

export function FullScreenLoading({ text = '로딩 중...' }: FullScreenLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// 페이지 로딩 스피너
export function PageLoading({ text }: { text?: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
