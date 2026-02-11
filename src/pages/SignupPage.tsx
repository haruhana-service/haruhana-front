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

const STEPS = [
  { id: 1, title: '계정 정보', description: '아이디와 비밀번호를 입력해주세요' },
  { id: 2, title: '프로필 설정', description: '닉네임을 입력해주세요' },
  { id: 3, title: '학습 설정', description: '학습 주제와 난이도를 선택해주세요' },
]

export function SignupPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      loginId: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      categoryTopicId: undefined,
      difficulty: undefined,
    },
  })

  const handleNext = async () => {
    setApiError(undefined)

    if (currentStep === 1) {
      // Step 1: 계정 정보 검증
      const isValid = await trigger(['loginId', 'password', 'passwordConfirm'])

      console.log('Step 1 Validation:', {
        isValid,
        errors: {
          loginId: errors.loginId?.message,
          password: errors.password?.message,
          passwordConfirm: errors.passwordConfirm?.message,
        }
      })

      // 개별 필드 에러 확인
      if (errors.loginId) {
        setApiError(errors.loginId.message || '아이디를 확인해주세요')
        return
      }
      if (errors.password) {
        setApiError(errors.password.message || '비밀번호를 확인해주세요')
        return
      }
      if (errors.passwordConfirm) {
        setApiError(errors.passwordConfirm.message || '비밀번호 확인을 입력해주세요')
        return
      }

      // 수동으로 비밀번호 일치 확인 (Zod refine 대신)
      const password = getValues('password')
      const passwordConfirm = getValues('passwordConfirm')

      console.log('Password match check:', { password, passwordConfirm, match: password === passwordConfirm })

      if (password !== passwordConfirm) {
        setApiError('비밀번호가 일치하지 않습니다')
        return
      }

      // 검증 통과
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === 2) {
      // Step 2: 닉네임 검증
      const isValid = await trigger(['nickname'])

      console.log('Step 2 Validation:', { isValid, error: errors.nickname?.message })

      if (!isValid || errors.nickname) {
        setApiError(errors.nickname?.message || '닉네임을 확인해주세요')
        return
      }

      setCurrentStep(prev => prev + 1)
    } else if (currentStep === 3) {
      // Step 3: 학습 설정 검증
      const isValid = await trigger(['categoryTopicId', 'difficulty'])

      console.log('Step 3 Validation:', {
        isValid,
        errors: {
          categoryTopicId: errors.categoryTopicId?.message,
          difficulty: errors.difficulty?.message,
        }
      })

      if (!isValid) {
        const firstError = errors.categoryTopicId?.message
          || errors.difficulty?.message
          || '선택값을 다시 확인해주세요'
        setApiError(firstError)
        return
      }

      // 마지막 단계는 submit으로 진행
      setApiError(undefined)
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
    setApiError(undefined)
  }

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

      // API 에러 처리 - interceptor에서 가공된 에러
      if (isApiError(error)) {
        console.error('API Error:', { message: error.message, code: error.code })
        setApiError(error.message || '회원가입 중 오류가 발생했습니다')
      } else if (error instanceof Error) {
        console.error('Error:', error.message)
        setApiError(error.message || '회원가입 중 오류가 발생했습니다')
      } else {
        console.error('Unknown error:', error)
        setApiError('회원가입 중 예상치 못한 오류가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="flex flex-col h-screen max-w-md mx-auto px-6 py-6 animate-fade-in bg-white">
      {/* Step Indicator - bar style */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-1.5 mb-5">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                currentStep >= step.id ? 'bg-haru-500' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        <div className="min-h-[48px]">
          {currentStep === 1 && <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">반가워요!<br/>계정을 만들어주세요</h2>}
          {currentStep === 2 && <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">프로필을<br/>설정해볼까요?</h2>}
          {currentStep === 3 && <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">나에게 딱 맞는<br/>학습 설정</h2>}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        <form onSubmit={handleSubmit(onSubmit)} id="signup-form" className="h-full">
          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-fade-in mb-5">
              <p className="text-sm text-red-700 font-medium text-center">{apiError}</p>
            </div>
          )}

          {/* Step 1: 계정 정보 */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
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
                  autoFocus
                />
                {errors.loginId && (
                  <p className="text-xs text-red-500 ml-1 font-medium">{errors.loginId.message}</p>
                )}
              </div>

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
            </div>
          )}

          {/* Step 2: 프로필 설정 */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label htmlFor="nickname" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  닉네임
                </label>
                <input
                  {...register('nickname')}
                  type="text"
                  id="nickname"
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  placeholder="활동할 닉네임을 입력하세요"
                  autoFocus
                />
                {errors.nickname && (
                  <p className="text-xs text-red-500 ml-1 font-medium">{errors.nickname.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: 학습 설정 */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
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
          )}
        </form>
      </div>

      {/* Footer Navigation */}
      <div className="shrink-0 mt-6 space-y-3">
        {currentStep < STEPS.length ? (
          <Button
            type="button"
            onClick={handleNext}
            fullWidth
            size="lg"
            className="h-14 rounded-2xl text-[17px] font-black shadow-lg shadow-haru-100 active:scale-95 transition-transform"
          >
            다음 단계로
          </Button>
        ) : (
          <Button
            type="submit"
            form="signup-form"
            disabled={isSubmitting}
            fullWidth
            size="lg"
            className="h-14 rounded-2xl text-[17px] font-black shadow-lg shadow-haru-100 active:scale-95 transition-transform"
          >
            {isSubmitting ? '가입 중...' : '하루하루 시작하기'}
          </Button>
        )}
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="w-full py-1 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
          >
            이전 단계로
          </button>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-slate-500 font-medium pt-2">
          이미 계정이 있으신가요?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-black text-haru-600 hover:text-haru-500 transition-colors underline underline-offset-4"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
