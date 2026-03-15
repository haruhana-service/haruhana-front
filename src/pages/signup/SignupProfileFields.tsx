import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { SignupFormData } from '../../lib/validations'

interface SignupProfileFieldsProps {
  register: UseFormRegister<SignupFormData>
  errors: FieldErrors<SignupFormData>
  nicknameValue: string
  isNicknameChecked: boolean
  isNicknameAvailable: boolean | null
  isCheckingNickname: boolean
}

export function SignupProfileFields({
  register,
  errors,
  nicknameValue,
  isNicknameChecked,
  isNicknameAvailable,
  isCheckingNickname,
}: SignupProfileFieldsProps) {
  return (
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
        {errors.nickname && <p className="text-xs text-red-500 ml-1 font-medium">{errors.nickname.message}</p>}
        {!errors.nickname && isCheckingNickname && (
          <p className="text-xs text-slate-400 ml-1 font-medium">닉네임 확인 중...</p>
        )}
        {!errors.nickname && !isCheckingNickname && isNicknameChecked && isNicknameAvailable && (
          <p className="text-xs text-emerald-600 ml-1 font-medium">사용 가능한 닉네임입니다</p>
        )}
        {!errors.nickname && !isCheckingNickname && isNicknameChecked && isNicknameAvailable === false && (
          <p className="text-xs text-red-500 ml-1 font-medium">이미 사용 중인 닉네임입니다</p>
        )}
        {!errors.nickname && !isCheckingNickname && nicknameValue.trim().length > 0 && !isNicknameChecked && (
          <p className="text-xs text-slate-400 ml-1 font-medium">닉네임 입력 후 자동으로 확인됩니다</p>
        )}
      </div>
    </div>
  )
}
