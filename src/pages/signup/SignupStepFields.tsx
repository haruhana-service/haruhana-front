import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { SignupLearningSetup } from './SignupLearningSetup'
import { SignupAccountFields } from './SignupAccountFields'
import { SignupProfileFields } from './SignupProfileFields'
import type { SignupFormData } from '../../lib/validations'

interface SignupStepFieldsProps {
  currentStep: number
  register: UseFormRegister<SignupFormData>
  errors: FieldErrors<SignupFormData>
  control: Control<SignupFormData>
  loginIdValue: string
  isLoginIdChecked: boolean
  isLoginIdAvailable: boolean | null
  isCheckingLoginId: boolean
  isPasswordMismatch: boolean
  nicknameValue: string
  isNicknameChecked: boolean
  isNicknameAvailable: boolean | null
  isCheckingNickname: boolean
  handleCheckNickname: (reason?: 'manual' | 'auto') => void
}

export function SignupStepFields({
  currentStep,
  register,
  errors,
  control,
  loginIdValue,
  isLoginIdChecked,
  isLoginIdAvailable,
  isCheckingLoginId,
  isPasswordMismatch,
  nicknameValue,
  isNicknameChecked,
  isNicknameAvailable,
  isCheckingNickname,
  handleCheckNickname,
}: SignupStepFieldsProps) {
  if (currentStep === 1) {
    return (
      <SignupAccountFields
        register={register}
        errors={errors}
        loginIdValue={loginIdValue}
        isLoginIdChecked={isLoginIdChecked}
        isLoginIdAvailable={isLoginIdAvailable}
        isCheckingLoginId={isCheckingLoginId}
        isPasswordMismatch={isPasswordMismatch}
      />
    )
  }

  if (currentStep === 2) {
    return (
      <SignupProfileFields
        register={register}
        errors={errors}
        nicknameValue={nicknameValue}
        isNicknameChecked={isNicknameChecked}
        isNicknameAvailable={isNicknameAvailable}
        isCheckingNickname={isCheckingNickname}
        handleCheckNickname={handleCheckNickname}
      />
    )
  }

  return (
    <SignupLearningSetup control={control} errors={errors} />
  )
}
