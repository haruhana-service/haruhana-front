import { type ReactNode } from 'react'

interface ErrorMessageProps {
  title?: string
  message: string
  icon?: ReactNode
  variant?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  className?: string
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'bg-red-100 text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'bg-yellow-100 text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-700',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
}

const defaultIcons = {
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function ErrorMessage({
  title,
  message,
  icon,
  variant = 'error',
  onRetry,
  className = '',
}: ErrorMessageProps) {
  const styles = variantStyles[variant]
  const displayIcon = icon || defaultIcons[variant]

  return (
    <div
      className={`rounded-2xl border p-6 ${styles.container} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${styles.icon}`}>
          {displayIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-bold mb-1 ${styles.title}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${styles.button}`}
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 페이지 에러 (전체 페이지 중앙)
interface PageErrorProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function PageError({ title = '오류가 발생했습니다', message, onRetry }: PageErrorProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          title={title}
          message={message}
          onRetry={onRetry}
          variant="error"
        />
      </div>
    </div>
  )
}

// 인라인 폼 에러
interface FormErrorProps {
  message: string
}

export function FormError({ message }: FormErrorProps) {
  return (
    <p className="text-sm text-red-600 font-medium mt-1 flex items-center gap-1">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </p>
  )
}
