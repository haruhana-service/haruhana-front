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

      // API 호출
      await signup({
        loginId: data.loginId,
        password: data.password,
        nickname: data.nickname,
        categoryTopicId: data.categoryTopicId,
        difficulty: data.difficulty,
      })

      // 회원가입 성공 - 로그인 페이지로 이동
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            꾸준함을 기르는 첫 걸음을 시작하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-8 shadow-md">
          {/* API Error */}
          {apiError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          {/* 계정 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">계정 정보</h3>

            {/* 로그인 ID */}
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                로그인 ID <span className="text-red-500">*</span>
              </label>
              <input
                {...register('loginId')}
                type="text"
                id="loginId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="로그인 ID를 입력하세요"
              />
              {errors.loginId && (
                <p className="mt-1 text-sm text-red-600">{errors.loginId.message}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="8자 이상, 대소문자+숫자 포함"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('passwordConfirm')}
                type="password"
                id="passwordConfirm"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nickname')}
                type="text"
                id="nickname"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>
          </div>

          {/* 학습 설정 섹션 */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">학습 설정</h3>
            <p className="text-sm text-gray-600">
              나에게 맞는 문제 주제와 난이도를 선택해주세요
            </p>

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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
