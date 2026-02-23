import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi } from '../features/auth/services/authService'
import { loginSchema, type LoginFormData } from '../lib/validations'
import { ROUTES } from '../constants'
import { isApiError } from '../services/api'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export function LoginPage() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetValue, setResetValue] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isCtaHover, setIsCtaHover] = useState(false)
  const [illustrationIndex, setIllustrationIndex] = useState(0)

  const challengeQuotes = [
    '나랑 같이 챌린지 안할래??',
    '오늘도 한 걸음, 같이 가요',
    '작은 습관이 큰 변화를 만들어요',
    '지금 시작하면 내일이 달라져요',
    '하루 1%의 변화, 함께 해요',
    '오늘의 나를 조금만 더 돌봐요',
    '5분만 투자해볼래요?',
    '지금이 가장 빠른 시작이에요',
    '혼자보다 같이면 더 쉬워요',
    '작게 시작하고 크게 자라요',
    '꾸준함은 언제나 이겨요',
    '오늘 시작하면 내일이 가벼워요',
    '내일의 나에게 선물하기',
    '지금 한 번, 충분해요',
    '나를 위한 작은 약속',
    '다음 버전의 나를 만나봐요',
  ]

  const illustrationVariants = [
    { shirt: '#4A69FF', accent: '#9BB3FF', mood: 'smile' },
    { shirt: '#2E44CC', accent: '#668CFF', mood: 'smile' },
    { shirt: '#668CFF', accent: '#CCD8FF', mood: 'smile' },
  ]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % challengeQuotes.length)
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [challengeQuotes.length])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIllustrationIndex((prev) => (prev + 1) % illustrationVariants.length)
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [illustrationVariants.length])

  const activeIllustration = illustrationVariants[illustrationIndex]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      setApiError(undefined)

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
    <div className="flex flex-col min-h-[100svh] px-5 sm:px-8 pt-10 pb-8 sm:pt-10 sm:pb-10 animate-fade-in bg-haru-900 relative overflow-hidden">
      {/* Soft Background Glows */}
      <div className="absolute top-[-15%] right-[-15%] w-96 h-96 bg-haru-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-96 h-96 bg-haru-700/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-[430px] sm:max-w-sm mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="flex-1 flex items-start justify-center text-center">
          <div className="mt-4 sm:mt-0">
            <p className="text-haru-300 text-[12px] sm:text-[15px] font-semibold tracking-tight mb-2 sm:mb-3">
              나를 지키는 작은 습관
            </p>
            <h1 className="text-[72px] sm:text-7xl lg:text-8xl font-black text-white tracking-tighter italic">haru:</h1>
          </div>
        </div>

        {/* Icon with Speech Bubble */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative mx-auto w-48 h-48 sm:w-52 sm:h-52 bg-slate-50 sm:bg-haru-800/40 rounded-[28px] sm:rounded-[40px] border border-slate-200 sm:border-white/10 flex items-center justify-center shadow-xl sm:shadow-2xl overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 sm:from-white/5 to-transparent rounded-[40px]"></div>
            <div className="w-36 h-36 sm:w-40 sm:h-40">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g className="thinker-person">
                  <circle cx="100" cy="70" r="30" fill="#FFD6A5" />
                  <path d="M70 64a30 30 0 0 1 60 0v10h-60z" fill="#2E3A59" />
                  <circle cx="88" cy="78" r="4.5" fill="#1A1F36" />
                  <circle cx="112" cy="78" r="4.5" fill="#1A1F36" />
                  <path d="M90 90c6 6 14 6 20 0" stroke="#2E3A59" strokeWidth="4" strokeLinecap="round" />
                  <rect x="52" y="110" width="96" height="48" rx="24" fill={activeIllustration.shirt} />
                  <rect x="78" y="120" width="44" height="16" rx="8" fill={activeIllustration.accent} />
                  <path d="M64 130c10 6 18 16 22 28" stroke="#2E3A59" strokeWidth="6" strokeLinecap="round" />
                  <path d="M136 130c-10 6-18 16-22 28" stroke="#2E3A59" strokeWidth="6" strokeLinecap="round" />
                </g>
                <g className={`thinker-bulb ${isCtaHover ? 'thinker-bulb--active' : ''}`}>
                  <defs>
                    <radialGradient id="bulbGlow" cx="0.5" cy="0.4" r="0.7">
                      <stop offset="0" stopColor="#CCD8FF" />
                      <stop offset="1" stopColor="#4A69FF" />
                    </radialGradient>
                  </defs>
                  <circle cx="176" cy="40" r="26" className="thinker-bulb-glow" />
                  <circle cx="176" cy="40" r="16" fill="url(#bulbGlow)" />
                  <circle cx="176" cy="40" r="22" fill="#4A69FF" opacity="0.18" />
                  <rect x="170" y="54" width="12" height="10" rx="3" fill="#2E44CC" />
                  <rect x="168" y="64" width="16" height="6" rx="3" fill="#1E2C85" />
                  <path d="M170 38h12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                </g>
              </svg>
            </div>

            <div className="absolute -top-3 -left-4 sm:-top-6 sm:-left-12 bg-haru-500 text-white text-[10px] sm:text-[12px] font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-full rounded-bl-none shadow-xl border border-white/10 animate-pulse">
              {challengeQuotes[quoteIndex]}
            </div>
          </div>
        </div>

        {/* Area 3: Buttons or Login Form */}
        <div className="flex-1 flex flex-col justify-end">
          {!isFormVisible && (
            <div
              className="space-y-3 sm:space-y-4"
              onMouseEnter={() => setIsCtaHover(true)}
              onMouseLeave={() => setIsCtaHover(false)}
              onTouchStart={() => setIsCtaHover(true)}
              onTouchEnd={() => setIsCtaHover(false)}
              onTouchCancel={() => setIsCtaHover(false)}
              onFocus={() => setIsCtaHover(true)}
              onBlur={() => setIsCtaHover(false)}
            >
              <Button
                type="button"
                onClick={() => setIsFormVisible(true)}
                fullWidth
                size="lg"
                className="h-14 sm:h-16 text-[15px] sm:text-base rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-lg sm:shadow-2xl shadow-haru-500/20 active:scale-95 transition-all"
              >
                시작하기
              </Button>
              <Link to={ROUTES.SIGNUP} className="block">
                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  className="h-14 sm:h-16 text-[15px] sm:text-base rounded-2xl bg-transparent sm:bg-white/10 hover:bg-slate-50 sm:hover:bg-white/20 text-haru-600 sm:text-white font-bold border border-haru-200 sm:border-white/10 shadow-lg sm:shadow-2xl active:scale-95 transition-all"
                >
                  가입하기
                </Button>
              </Link>
            </div>
          )}

          {isFormVisible && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div
                className={`transition-[max-height,opacity,transform] duration-700 ease-out overflow-hidden ${
                  isFormVisible ? 'max-h-[900px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2'
                }`}
              >
                <div className="grid gap-6">
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
                    <input
                      {...register('loginId')}
                      type="text"
                      id="loginId"
                      className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50"
                      placeholder="아이디를 입력하세요"
                    />
                    {errors.loginId && (
                      <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.loginId.message}</p>
                    )}
                  </div>

                  {/* 비밀번호 */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">
                      비밀번호
                    </label>
                    <input
                      {...register('password')}
                      type="password"
                      id="password"
                      className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/50"
                      placeholder="비밀번호를 입력하세요"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.password.message}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="text-[12px] font-bold text-white/60 hover:text-white/80 transition-colors"
                      >
                        비밀번호 찾기
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    fullWidth
                    size="lg"
                    className="h-14 sm:h-16 text-[15px] sm:text-base rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-5 sm:mt-8"
                  >
                    {isSubmitting ? '로그인 중...' : '챌린지 시작하기'}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center justify-center gap-3 py-4 opacity-30">
                    <div className="h-[1px] w-8 bg-white"></div>
                    <p className="text-white text-[10px] font-extrabold uppercase tracking-[0.4em]">Persistence</p>
                    <div className="h-[1px] w-8 bg-white"></div>
                  </div>

                  {/* Signup Link */}
                  <p className="text-center text-[15px] text-white/60 font-medium">
                    아직 계정이 없으신가요?{' '}
                    <Link
                      to={ROUTES.SIGNUP}
                      className="font-bold text-haru-300 hover:text-haru-200 transition-colors underline underline-offset-4"
                    >
                      회원가입
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="비밀번호 찾기"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            가입한 이메일 또는 아이디를 입력해주세요. 비밀번호 재설정 안내를 보내드립니다.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="reset-target" className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              이메일 또는 아이디
            </label>
            <input
              id="reset-target"
              type="text"
              value={resetValue}
              onChange={(e) => setResetValue(e.target.value)}
              placeholder="example@haruharu.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-haru-500 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-500">
            현재 비밀번호 찾기 기능은 준비 중입니다.
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
            >
              닫기
            </button>
            <button
              type="button"
              disabled
              className="flex-1 px-4 py-3 text-white font-bold rounded-xl bg-slate-300 cursor-not-allowed"
            >
              재설정 링크 받기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
