import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { login as loginApi } from '../features/auth/services/authService'
import { loginSchema, type LoginFormData } from '../lib/validations'
import { ROUTES } from '../constants'
import { isApiError } from '../services/api'

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

      // 1. 로그인 API 호출하여 토큰 받기
      const tokenResponse = await loginApi({
        loginId: data.loginId,
        password: data.password,
      })

      // 2. AuthContext의 login 메서드로 토큰 설정 + 프로필 가져오기
      await login(tokenResponse)
      // 성공 시 AuthContext에서 자동으로 /today로 리다이렉트
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            HaruHaru에 오신 것을 환영합니다
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

          {/* 로그인 ID */}
          <div>
            <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
              로그인 ID
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
              비밀번호
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link to={ROUTES.SIGNUP} className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
