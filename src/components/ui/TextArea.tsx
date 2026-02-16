import { forwardRef, type TextareaHTMLAttributes, useState } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled'
  showCharCount?: boolean
  maxLength?: number
  autoResize?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      showCharCount = false,
      maxLength,
      autoResize = false,
      className = '',
      disabled,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(() =>
      value && typeof value === 'string' ? value.length : 0
    )
    const displayCount = value && typeof value === 'string' ? value.length : charCount

    const baseStyles = 'w-full px-4 py-3 rounded-xl font-medium transition-all outline-none resize-none'
    
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      
      // Auto-resize
      if (autoResize && e.target) {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
      }

      onChange?.(e)
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* TextArea */}
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={`
            ${baseStyles}
            ${variantStyles[variant]}
            ${errorStyles}
            ${disabledStyles}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />

        {/* Footer: Error/Helper Text + Character Count */}
        <div className="flex items-start justify-between gap-2 mt-1.5">
          {/* Error or Helper Text */}
          <div className="flex-1 min-w-0">
            {error && (
              <p 
                id={`${props.id}-error`}
                className="text-sm text-red-600 font-medium flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </p>
            )}

            {!error && helperText && (
              <p 
                id={`${props.id}-helper`}
                className="text-sm text-slate-500"
              >
                {helperText}
              </p>
            )}
          </div>

          {/* Character Count */}
          {showCharCount && (
            <p className={`text-sm font-medium flex-shrink-0 ${
              maxLength && displayCount > maxLength ? 'text-red-600' : 'text-slate-400'
            }`}>
              {displayCount}{maxLength && ` / ${maxLength}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
