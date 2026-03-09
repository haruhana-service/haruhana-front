import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { SignupFormData } from '../../lib/validations'

interface SignupProfileFieldsProps {
  register: UseFormRegister<SignupFormData>
  errors: FieldErrors<SignupFormData>
  nicknameValue: string
  isNicknameChecked: boolean
  isNicknameAvailable: boolean | null
  isCheckingNickname: boolean
  handleCheckNickname: (reason?: 'manual' | 'auto') => void
}

export function SignupProfileFields({
  register,
  errors,
  nicknameValue,
  isNicknameChecked,
  isNicknameAvailable,
  isCheckingNickname,
  handleCheckNickname,
}: SignupProfileFieldsProps) {
  const shouldPromptCheck = nicknameValue.trim().length > 0 && !isNicknameChecked

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1.5">
        <label htmlFor="nickname" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
          닉네임
        </label>
        <div className="flex items-center gap-2">
          <input
            {...register('nickname')}
            type="text"
            id="nickname"
            className={`w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 ${
              shouldPromptCheck
                ? 'border-amber-300/70 bg-amber-50/60 focus:border-amber-400 focus:bg-amber-50'
                : 'border-transparent focus:border-haru-500 focus:bg-white'
            }`}
            placeholder="활동할 닉네임을 입력하세요"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleCheckNickname('manual')
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleCheckNickname('manual')}
            disabled={isCheckingNickname}
            className={`h-[52px] shrink-0 rounded-xl border px-4 text-sm font-bold transition-all ${
              shouldPromptCheck ? 'ring-2 ring-amber-300/70 shadow-amber-100 animate-pulse' : ''
            }`}
          >
            {isCheckingNickname ? '확인 중...' : '중복 확인'}
          </button>
        </div>
        {shouldPromptCheck && (
          <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700">닉네임 중복 확인이 필요합니다</p>
          </div>
        )}
        {errors.nickname && <p className="text-xs text-red-500 ml-1 font-medium">{errors.nickname.message}</p>}
        {!errors.nickname && isNicknameChecked && isNicknameAvailable && (
          <p className="text-xs text-emerald-600 ml-1 font-medium">사용 가능한 닉네임입니다</p>
        )}
        {!errors.nickname && isNicknameChecked && isNicknameAvailable === false && (
          <p className="text-xs text-red-500 ml-1 font-medium">이미 사용 중인 닉네임입니다</p>
        )}
        {!errors.nickname && !isNicknameChecked && (
          <p className="text-xs text-slate-400 ml-1 font-medium">닉네임 입력 후 중복 확인을 눌러주세요</p>
        )}
      </div>
    </div>
  )
}
