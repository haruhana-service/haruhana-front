import { type BaseSyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, type Control, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi } from '../features/auth/services/authService'
import { getQuotes } from '../services/quoteService'
import { loginSchema, type LoginFormData } from '../lib/validations'
import { ROUTES } from '../constants'
import { isApiError } from '../services/api'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const [quotes, setQuotes] = useState<string[]>([])
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: '',
      password: '',
    },
    shouldUnregister: false,
  })

  useEffect(() => {
    let mounted = true

    const loadQuotes = async () => {
      try {
        const normalized = await getQuotes()
        if (!mounted) return

        const loadedQuotes = normalized.ids
          .map((id) => normalized.entities[id]?.text)
          .filter((quote): quote is string => Boolean(quote))

        setQuotes(loadedQuotes)
      } catch (error) {
        console.error('Failed to load quotes:', error)
      }
    }

    loadQuotes()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (quotes.length <= 1) return

    const intervalId = window.setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 2800)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [quotes])

  const activeQuoteText = useMemo(() => {
    if (quotes.length === 0) return '나랑 같이 챌린지 안할래??'
    return quotes[activeQuoteIndex] ?? quotes[0]
  }, [activeQuoteIndex, quotes])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      setApiError(undefined)

      // 알림 권한은 사용자 제스처에서 요청해야 브라우저에서 허용됨
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch (error) {
          console.warn('Notification permission request failed:', error)
        }
      }

      const tokenResponse = await loginApi({
        loginId: data.loginId,
        password: data.password,
      })

      setIsLeaving(true)
      await new Promise((resolve) => window.setTimeout(resolve, 220))
      await login(tokenResponse)
    } catch (error) {
      console.error('Login failed:', error)
      if (isApiError(error)) {
        setApiError(error.message)
      } else {
        setApiError('로그인 중 오류가 발생했습니다')
      }
      setIsLeaving(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loginIdValue = watch('loginId')
  const showPassword = Boolean(loginIdValue?.trim())

  useEffect(() => {
    if (!showPassword) return
    window.requestAnimationFrame(() => {
      passwordInputRef.current?.focus()
    })
  }, [showPassword])

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen px-[var(--page-px)] pt-[var(--page-py-top)] pb-[var(--page-py-bottom)] animate-fade-in bg-haru-900 relative overflow-hidden transition-all duration-200 ease-in ${
        isLeaving ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg opacity-10 pointer-events-none"></div>
      {/* Soft Background Glows */}
      <div className="absolute top-[-15%] right-[-15%] w-96 h-96 bg-haru-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-96 h-96 bg-haru-700/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-haru-300 text-[12px] font-semibold tracking-tight mb-1.5">
              나를 지키는 작은 습관
            </p>
            <h1
              className={`text-4xl font-black tracking-tighter italic logo-glass animate-logo-glass ${isLeaving ? 'logo-glass-exit' : ''}`}
            >
              haru:
            </h1>
          </div>

          {/* Square Speech Bubble */}
          <div className="relative mb-6 mx-auto w-36 h-36">
            <div className="absolute inset-0 bg-haru-500 text-white rounded-[24px] border border-white/10 shadow-2xl p-4 flex items-center justify-center text-center">
              <p className="text-[12px] font-extrabold leading-snug break-keep animate-fade-in">
                {activeQuoteText}
              </p>
            </div>
            <div className="absolute -bottom-2 left-7 w-4 h-4 bg-haru-500 rotate-45 border-r border-b border-white/10"></div>
          </div>

            <LoginForm
              control={control}
              errors={errors}
              apiError={apiError}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
              buttonClassName="h-12 text-[15px] rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-4"
              showPassword={showPassword}
              passwordInputRef={passwordInputRef}
          />
        </div>

        {/* Tablet + Desktop Layout */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-haru-300 text-[14px] font-semibold tracking-tight mb-2">
              나를 지키는 작은 습관
            </p>
            <h1
              className={`text-5xl lg:text-6xl font-black tracking-tighter italic logo-glass animate-logo-glass ${isLeaving ? 'logo-glass-exit' : ''}`}
            >
              haru:
            </h1>
          </div>

          <div className="flex items-center justify-center gap-8 lg:gap-12">
            <div className="flex-1 min-w-[320px] flex items-center justify-center">
              <div className="relative w-full max-w-md md:max-w-[380px] lg:w-64 lg:h-64">
                <div className="relative bg-haru-500 text-white rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl px-5 py-5 md:px-7 md:py-7 flex items-center justify-center text-center min-h-[160px] md:min-h-[260px] lg:absolute lg:inset-0">
                  <span className="absolute -top-5 left-5 md:-top-6 md:left-6 text-3xl md:text-4xl font-black text-white/25 select-none">
                    “
                  </span>
                  <p className="text-[13px] md:text-[15px] lg:text-[14px] font-extrabold leading-snug break-keep animate-fade-in">
                    {activeQuoteText}
                  </p>
                </div>
                <div className="hidden lg:block absolute -bottom-3 left-10 w-5 h-5 bg-haru-500 rotate-45 border-r border-b border-white/10"></div>
              </div>
            </div>

            <div className="w-full max-w-md">
              <LoginForm
                control={control}
                errors={errors}
                apiError={apiError}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
                buttonClassName="h-12 text-[15px] rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-5"
                showFooter={false}
                showPassword={showPassword}
                passwordInputRef={passwordInputRef}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <LoginFormFooter />
          </div>
        </div>
      </div>
    </div>
  )
}

type LoginFormProps = {
  control: Control<LoginFormData>
  errors: FieldErrors<LoginFormData>
  apiError?: string
  isSubmitting: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
  buttonClassName: string
  showFooter?: boolean
  showPassword?: boolean
  passwordInputRef?: React.RefObject<HTMLInputElement | null>
}

function LoginForm({
  control,
  errors,
  apiError,
  isSubmitting,
  onSubmit,
  buttonClassName,
  showFooter = true,
  showPassword = true,
  passwordInputRef,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* API Error */}
      {apiError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm">
          <p className="text-sm text-red-200 font-medium text-center">{apiError}</p>
        </div>
      )}

      {/* 로그인 ID */}
      <div className="space-y-1.5">
        <label htmlFor="loginId" className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">
          아이디
        </label>
        <Controller
          name="loginId"
          control={control}
          render={({ field }) => {
            const errorMessage = errors.loginId?.message
            return (
              <div className="relative">
                <input
                  {...field}
                  type="text"
                  id="loginId"
                  aria-invalid={Boolean(errorMessage)}
                  className={`w-full px-4 py-2.5 ${errorMessage ? 'pr-10 border-red-400 focus:border-red-400' : 'border-white/10 focus:border-haru-500'} bg-white/10 backdrop-blur-sm rounded-xl border-2 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50`}
                  placeholder={errorMessage || '아이디를 입력하세요'}
                />
                {errorMessage && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300 text-base font-black"
                    aria-hidden="true"
                  >
                    !
                  </span>
                )}
              </div>
            )
          }}
        />
      </div>

      <div
        className={`transition-all duration-200 ease-out ${
          showPassword
            ? 'max-h-[240px] opacity-100 translate-y-0 pointer-events-auto mt-3'
            : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
        }`}
        aria-hidden={!showPassword}
      >
        {/* 비밀번호 */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">
            비밀번호
          </label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => {
              const errorMessage = errors.password?.message
              return (
                <div className="relative">
                  <input
                    {...field}
                    ref={(element) => {
                      field.ref(element)
                      if (passwordInputRef) {
                        passwordInputRef.current = element
                      }
                    }}
                    type="password"
                    id="password"
                    aria-invalid={Boolean(errorMessage)}
                    className={`w-full px-4 py-2.5 ${errorMessage ? 'pr-10 border-red-400 focus:border-red-400' : 'border-white/10 focus:border-haru-500'} bg-white/10 backdrop-blur-sm rounded-xl border-2 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50`}
                    placeholder={errorMessage || '비밀번호를 입력하세요'}
                  />
                  {errorMessage && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300 text-base font-black"
                      aria-hidden="true"
                    >
                      !
                    </span>
                  )}
                </div>
              )
            }}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} fullWidth size="lg" className={buttonClassName}>
          {isSubmitting ? '로그인 중...' : '챌린지 시작하기'}
        </Button>

        {showFooter && <div className="mt-4"><LoginFormFooter /></div>}
      </div>

      {!showPassword && showFooter && <div className="mt-4"><LoginFormFooter /></div>}
    </form>
  )
}

function LoginFormFooter() {
  return (
    <>
      {/* Signup Link */}
      <p className="text-center text-[15px] text-white/60 font-medium mx-auto">
        아직 계정이 없으신가요?{' '}
        <Link
          to={ROUTES.SIGNUP}
          className="font-bold text-haru-300 hover:text-haru-200 transition-colors underline underline-offset-4"
        >
          회원가입
        </Link>
      </p>
    </>
  )
}
