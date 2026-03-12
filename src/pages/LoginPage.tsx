import { type BaseSyntheticEvent, useEffect, useMemo, useState } from 'react'
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
  const [apiError, setApiError] = useState<string>()
  const [quotes, setQuotes] = useState<string[]>([])
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
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

      await login(tokenResponse)
    } catch (error) {
      console.error('Login failed:', error)
      if (isApiError(error)) {
        setApiError(error.message)
      } else {
        setApiError('로그인 중 오류가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 animate-fade-in bg-haru-900 relative overflow-hidden">
      {/* Soft Background Glows */}
      <div className="absolute top-[-15%] right-[-15%] w-96 h-96 bg-haru-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-96 h-96 bg-haru-700/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-haru-300 text-[13px] font-semibold tracking-tight mb-2">
              나를 지키는 작은 습관
            </p>
            <h1 className="text-5xl font-black text-white tracking-tighter italic">haru:</h1>
          </div>

          {/* Square Speech Bubble */}
          <div className="relative mb-10 mx-auto w-44 h-44">
            <div className="absolute inset-0 bg-haru-500 text-white rounded-[24px] border border-white/10 shadow-2xl p-4 flex items-center justify-center text-center">
              <p className="text-[13px] font-extrabold leading-snug break-keep animate-fade-in">
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
              buttonClassName="h-14 text-base rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-6"
          />
        </div>

        {/* Tablet + Desktop Layout */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-haru-300 text-[16px] font-semibold tracking-tight mb-3">
              나를 지키는 작은 습관
            </p>
            <h1 className="text-6xl lg:text-7xl font-black text-white tracking-tighter italic">haru:</h1>
          </div>

          <div className="flex items-center justify-center gap-10 lg:gap-16">
            <div className="flex-1 min-w-[320px] flex items-center justify-center">
              <div className="relative w-full max-w-md md:max-w-[420px] lg:w-72 lg:h-72">
                <div className="relative bg-haru-500 text-white rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl px-6 py-6 md:px-9 md:py-9 flex items-center justify-center text-center min-h-[180px] md:min-h-[300px] lg:absolute lg:inset-0">
                  <span className="absolute -top-5 left-5 md:-top-6 md:left-6 text-4xl md:text-5xl font-black text-white/25 select-none">
                    “
                  </span>
                  <p className="text-[14px] md:text-[17px] lg:text-[16px] font-extrabold leading-snug break-keep animate-fade-in">
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
                buttonClassName="h-16 text-base rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-8"
                showFooter={false}
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center">
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
}

function LoginForm({
  control,
  errors,
  apiError,
  isSubmitting,
  onSubmit,
  buttonClassName,
  showFooter = true,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* API Error */}
      {apiError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm">
          <p className="text-sm text-red-200 font-medium text-center">{apiError}</p>
        </div>
      )}

      {/* 로그인 ID */}
      <div className="space-y-2">
        <label htmlFor="loginId" className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">
          아이디
        </label>
        <Controller
          name="loginId"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="loginId"
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50"
              placeholder="아이디를 입력하세요"
            />
          )}
        />
        {errors.loginId && <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.loginId.message}</p>}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">
          비밀번호
        </label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              id="password"
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50"
              placeholder="비밀번호를 입력하세요"
            />
          )}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} fullWidth size="lg" className={buttonClassName}>
        {isSubmitting ? '로그인 중...' : '챌린지 시작하기'}
      </Button>

      {showFooter && <LoginFormFooter />}
    </form>
  )
}

function LoginFormFooter() {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center justify-center gap-3 py-4 opacity-30 mx-auto">
        <div className="h-[1px] w-8 bg-white"></div>
        <p className="text-white text-[10px] font-extrabold uppercase tracking-[0.4em]">Persistence</p>
        <div className="h-[1px] w-8 bg-white"></div>
      </div>

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
