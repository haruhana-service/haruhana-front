import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi } from '../features/auth/services/authService'
import { loginSchema, type LoginFormData } from '../lib/validations'
import { ROUTES } from '../constants'
import { isApiError } from '../services/api'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()

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
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 animate-fade-in bg-haru-900 relative overflow-hidden">
      {/* Soft Background Glows */}
      <div className="absolute top-[-15%] right-[-15%] w-96 h-96 bg-haru-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-96 h-96 bg-haru-700/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-haru-300/60 text-[15px] font-semibold tracking-tight mb-3">
            나를 지키는 작은 습관
          </p>
          <h1 className="text-7xl font-black text-white tracking-tighter italic">haru:</h1>
        </div>

        {/* Icon with Speech Bubble */}
        <div className="relative mb-16 mx-auto w-52 h-52 bg-haru-800/40 rounded-[40px] border border-white/10 flex items-center justify-center shadow-2xl overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[40px]"></div>
          <div className="text-8xl animate-float">🎯</div>

          <div className="absolute -top-6 -left-12 bg-haru-500 text-white text-[12px] font-bold px-4 py-2 rounded-full rounded-bl-none shadow-xl border border-white/10 animate-pulse">
            나랑 같이 챌린지 안할래??
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm">
              <p className="text-sm text-red-200 font-medium text-center">{apiError}</p>
            </div>
          )}

          {/* 로그인 ID */}
          <div className="space-y-2">
            <label htmlFor="loginId" className="text-[12px] font-bold text-white/40 uppercase tracking-widest ml-1">
              아이디
            </label>
            <input
              {...register('loginId')}
              type="text"
              id="loginId"
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/30"
              placeholder="아이디를 입력하세요"
            />
            {errors.loginId && (
              <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.loginId.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-[12px] font-bold text-white/40 uppercase tracking-widest ml-1">
              비밀번호
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/10 focus:border-haru-500 focus:bg-white/20 outline-none transition-all font-semibold text-white placeholder:text-white/30"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-300 ml-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            size="lg"
            className="h-16 text-base rounded-2xl bg-haru-500 hover:bg-haru-400 text-white font-bold shadow-2xl shadow-haru-500/20 active:scale-95 transition-all mt-8"
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
        </form>
      </div>
    </div>
  )
}
