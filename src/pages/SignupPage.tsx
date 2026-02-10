import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../features/auth/services/authService'
import { signupSchema, type SignupFormData } from '../lib/validations'
import { DifficultySelector } from '../components/problem/DifficultySelector'
import { CategorySelector } from '../components/problem/CategorySelector'
import { ROUTES, SUCCESS_MESSAGES } from '../constants'
import { isApiError } from '../services/api'
import { Button } from '../components/ui/Button'

export function SignupPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true)
      setApiError(undefined)

      await signup({
        loginId: data.loginId,
        password: data.password,
        nickname: data.nickname,
        categoryTopicId: data.categoryTopicId,
        difficulty: data.difficulty,
      })

      alert(SUCCESS_MESSAGES.SIGNUP_SUCCESS)
      navigate(ROUTES.LOGIN)
    } catch (error) {
      console.error('Signup failed:', error)
      if (isApiError(error)) {
        setApiError(error.message)
      } else {
        setApiError('회원가입 중 오류가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic mb-3">haru:</h1>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            환영합니다!
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            꾸준함을 기르는 첫 걸음을 시작하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium text-center">{apiError}</p>
            </div>
          )}

          {/* 계정 정보 섹션 */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
              계정 정보
            </h3>

            {/* 로그인 ID */}
            <div className="space-y-1.5">
              <label htmlFor="loginId" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                아이디
              </label>
              <input
                {...register('loginId')}
                type="text"
                id="loginId"
                className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="아이디를 입력하세요"
              />
              {errors.loginId && (
                <p className="text-xs text-red-500 ml-1 font-medium">{errors.loginId.message}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                비밀번호
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="8자 이상, 대소문자+숫자 포함"
              />
              {errors.password && (
                <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label htmlFor="passwordConfirm" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                비밀번호 확인
              </label>
              <input
                {...register('passwordConfirm')}
                type="password"
                id="passwordConfirm"
                className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500 ml-1 font-medium">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="space-y-1.5">
              <label htmlFor="nickname" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                닉네임
              </label>
              <input
                {...register('nickname')}
                type="text"
                id="nickname"
                className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="text-xs text-red-500 ml-1 font-medium">{errors.nickname.message}</p>
              )}
            </div>
          </div>

          {/* 학습 설정 섹션 */}
          <div className="space-y-5">
            <div>
              <h3 className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1 mb-1">
                학습 설정
              </h3>
              <p className="text-xs text-slate-400 font-medium ml-1">
                나에게 맞는 문제 주제와 난이도를 선택해주세요
              </p>
            </div>

            {/* 카테고리 선택 */}
            <Controller
              name="categoryTopicId"
              control={control}
              render={({ field }) => (
                <CategorySelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryTopicId?.message}
                />
              )}
            />

            {/* 난이도 선택 */}
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <DifficultySelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.difficulty?.message}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="space-y-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
              size="lg"
              className="h-14 rounded-2xl font-black shadow-lg shadow-haru-100"
            >
              {isSubmitting ? '가입 중...' : '하루하루 시작하기'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-500 font-medium">
              이미 계정이 있으신가요?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-black text-haru-600 hover:text-haru-500 transition-colors underline underline-offset-4"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
