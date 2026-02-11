import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full px-4 py-3 rounded-xl font-medium transition-all outline-none'
    
    const variantStyles = {
      default: 'bg-white border-2 border-slate-200 focus:border-haru-600 focus:ring-2 focus:ring-haru-100',
      filled: 'bg-slate-50 border-2 border-slate-50 focus:border-haru-600 focus:bg-white',
    }

    const errorStyles = error 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-100' 
      : ''

    const disabledStyles = disabled
      ? 'opacity-50 cursor-not-allowed bg-slate-100'
      : ''

    const paddingStyles = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : ''

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              ${baseStyles}
              ${variantStyles[variant]}
              ${errorStyles}
              ${disabledStyles}
              ${paddingStyles}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p 
            id={`${props.id}-error`}
            className="text-sm text-red-600 font-medium mt-1.5 flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p 
            id={`${props.id}-helper`}
            className="text-sm text-slate-500 mt-1.5"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
