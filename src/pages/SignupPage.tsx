import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { signup } from '../features/auth/services/authService'
import { signupSchema, type SignupFormData } from '../lib/validations'
import { ROUTES, SUCCESS_MESSAGES } from '../constants'
import { isApiError } from '../services/api'
import { SignupStepFields } from './signup/SignupStepFields'
import { SignupStepHeader } from './signup/SignupStepHeader'
import { SignupFooter } from './signup/SignupFooter'
import { SignupAgreementModal } from './signup/SignupAgreementModal'
import { useSignupState } from './signup/useSignupState'

const STEPS = [
  { id: 1, title: '계정 정보', description: '아이디와 비밀번호를 입력해주세요' },
  { id: 2, title: '프로필 설정', description: '닉네임을 입력해주세요' },
  { id: 3, title: '학습 설정', description: '학습 주제와 난이도를 선택해주세요' },
]

export function SignupPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false)
  const [isLoginIdChecked, setIsLoginIdChecked] = useState(false)
  const [isLoginIdAvailable, setIsLoginIdAvailable] = useState<boolean | null>(null)
  const [checkedLoginId, setCheckedLoginId] = useState('')
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const [checkedNickname, setCheckedNickname] = useState('')
  const [isAgreementOpen, setIsAgreementOpen] = useState(false)
  const [isAgreementChecked, setIsAgreementChecked] = useState(false)
  const [apiError, setApiError] = useState<string>()

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    watch,
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

  const loginIdValue = watch('loginId')
  const passwordValue = watch('password')
  const passwordConfirmValue = watch('passwordConfirm')
  const nicknameValue = watch('nickname')
  const categoryTopicIdValue = watch('categoryTopicId')
  const difficultyValue = watch('difficulty')

  const { isPasswordMismatch, canProceedStep1, isStep3Incomplete, handleCheckNickname } = useSignupState({
    loginIdValue,
    passwordValue,
    passwordConfirmValue,
    nicknameValue,
    categoryTopicIdValue,
    difficultyValue,
    checkedLoginId,
    setCheckedLoginId,
    checkedNickname,
    setCheckedNickname,
    trigger,
    getValues,
    setApiError,
    setIsLoginIdChecked,
    setIsLoginIdAvailable,
    setIsCheckingLoginId,
    isLoginIdChecked,
    isLoginIdAvailable,
    setIsNicknameChecked,
    setIsNicknameAvailable,
    setIsCheckingNickname,
    isNicknameChecked,
    isNicknameAvailable,
    isCheckingLoginId,
  })

  const handleOpenAgreement = () => {
    if (isStep3Incomplete || isSubmitting) return
    setIsAgreementChecked(false)
    setIsAgreementOpen(true)
  }

  const handleCloseAgreement = () => {
    setIsAgreementOpen(false)
  }

  const handleConfirmAgreement = () => {
    setIsAgreementOpen(false)
    void handleSubmit(onSubmit)()
  }

  const handleNext = async () => {
    setApiError(undefined)

    if (currentStep === 1) {
      // Step 1: 계정 정보 검증
      const isValid = await trigger(['loginId', 'password', 'passwordConfirm'])

      if (!isValid) return

      // 수동으로 비밀번호 일치 확인 (Zod refine 대신)
      const password = getValues('password')
      const passwordConfirm = getValues('passwordConfirm')

      if (password !== passwordConfirm) {
        setApiError('비밀번호가 일치하지 않습니다')
        return
      }

      const normalizedLoginId = getValues('loginId').trim()
      if (!isLoginIdChecked || checkedLoginId !== normalizedLoginId) {
        setApiError('아이디 중복 확인을 해주세요')
        return
      }

      if (!isLoginIdAvailable) {
        setApiError('이미 사용 중인 아이디입니다')
        return
      }

      // 검증 통과
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === 2) {
      // Step 2: 닉네임 검증
      const isValid = await trigger(['nickname'])

      if (!isValid) return

      const normalizedNickname = getValues('nickname').trim()
      if (!isNicknameChecked || checkedNickname !== normalizedNickname) {
        setApiError('닉네임 중복 확인을 해주세요')
        return
      }

      if (!isNicknameAvailable) {
        setApiError('이미 사용 중인 닉네임입니다')
        return
      }

      setCurrentStep(prev => prev + 1)
    } else if (currentStep === 3) {
      // Step 3: 학습 설정 검증
      const isValid = await trigger(['categoryTopicId', 'difficulty'])

      if (!isValid) return

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-haru-50/50 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-0 lg:flex lg:items-center">
        <div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[1fr_520px] lg:gap-8">
          <aside className="hidden lg:flex lg:flex-col lg:justify-between rounded-3xl bg-haru-900 text-white p-8 shadow-2xl">
            <div>
              <p className="text-haru-200 text-sm font-semibold tracking-wide">HARUHARU</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">매일 하나씩, 확실한 성장</h1>
              <p className="mt-4 text-sm text-haru-100/80 leading-relaxed">
                회원가입 후 바로 오늘의 문제를 받아보고 꾸준한 학습 루틴을 만들어보세요.
              </p>
            </div>
            <div className="space-y-3">
              {STEPS.map((step) => (
                <div key={step.id} className="rounded-2xl bg-white/10 border border-white/15 p-4">
                  <p className="text-xs font-bold text-haru-100">{step.id}단계</p>
                  <p className="mt-1 text-base font-black text-white">{step.title}</p>
                  <p className="mt-1 text-xs text-haru-100/80">{step.description}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex flex-col min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] lg:min-h-0 lg:max-h-[860px] lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-white lg:p-8 lg:shadow-xl bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 animate-fade-in">
            <SignupStepHeader currentStep={currentStep} steps={STEPS} />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
              <form onSubmit={handleSubmit(onSubmit)} id="signup-form" className="h-full">
                {/* API Error */}
                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-fade-in mb-5">
                    <p className="text-sm text-red-700 font-medium text-center">{apiError}</p>
                  </div>
                )}

                <SignupStepFields
                  currentStep={currentStep}
                  register={register}
                  errors={errors}
                  control={control}
                  loginIdValue={loginIdValue}
                isLoginIdChecked={isLoginIdChecked}
                isLoginIdAvailable={isLoginIdAvailable}
                isCheckingLoginId={isCheckingLoginId}
                isPasswordMismatch={isPasswordMismatch}
                nicknameValue={nicknameValue}
                isNicknameChecked={isNicknameChecked}
                isNicknameAvailable={isNicknameAvailable}
                  isCheckingNickname={isCheckingNickname}
                  handleCheckNickname={handleCheckNickname}
                />
              </form>
            </div>

            <SignupFooter
              currentStep={currentStep}
              stepsLength={STEPS.length}
              canProceedStep1={canProceedStep1}
              handleNext={handleNext}
              handlePrev={handlePrev}
              isSubmitting={isSubmitting}
              isStep3Incomplete={isStep3Incomplete}
              onFinalClick={handleOpenAgreement}
            />
          </div>
        </div>
      </div>
      <SignupAgreementModal
        isOpen={isAgreementOpen}
        isChecked={isAgreementChecked}
        isSubmitting={isSubmitting}
        onClose={handleCloseAgreement}
        onToggle={() => setIsAgreementChecked((prev) => !prev)}
        onConfirm={handleConfirmAgreement}
      />
    </>
  )
}
