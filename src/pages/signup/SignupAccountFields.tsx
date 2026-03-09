import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { SignupFormData } from '../../lib/validations'

interface SignupAccountFieldsProps {
  register: UseFormRegister<SignupFormData>
  errors: FieldErrors<SignupFormData>
  loginIdValue: string
  isLoginIdChecked: boolean
  isLoginIdAvailable: boolean | null
  isCheckingLoginId: boolean
  isPasswordMismatch: boolean
}

export function SignupAccountFields({
  register,
  errors,
  loginIdValue,
  isLoginIdChecked,
  isLoginIdAvailable,
  isCheckingLoginId,
  isPasswordMismatch,
}: SignupAccountFieldsProps) {
  const shouldPromptCheck = loginIdValue.trim().length > 0 && !isLoginIdChecked

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1.5">
        <label htmlFor="loginId" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
          아이디
        </label>
        <input
          {...register('loginId')}
          type="text"
          id="loginId"
          className={`w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 ${
            shouldPromptCheck
              ? 'border-amber-300/70 bg-amber-50/60 focus:border-amber-400 focus:bg-amber-50'
              : 'border-transparent focus:border-haru-500 focus:bg-white'
          }`}
          placeholder="아이디를 입력하세요"
          autoFocus
        />
        {shouldPromptCheck && !isCheckingLoginId && (
          <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700">아이디는 입력 후 자동으로 확인됩니다</p>
          </div>
        )}
        {errors.loginId && <p className="text-xs text-red-500 ml-1 font-medium">{errors.loginId.message}</p>}
        {!errors.loginId && isCheckingLoginId && (
          <p className="text-xs text-slate-400 ml-1 font-medium">아이디 확인 중...</p>
        )}
        {!errors.loginId && isLoginIdChecked && isLoginIdAvailable && (
          <p className="text-xs text-emerald-600 ml-1 font-medium">사용 가능한 아이디입니다</p>
        )}
        {!errors.loginId && isLoginIdChecked && isLoginIdAvailable === false && (
          <p className="text-xs text-red-500 ml-1 font-medium">이미 사용 중인 아이디입니다</p>
        )}
        {!errors.loginId && !isLoginIdChecked && (
          <p className="text-xs text-slate-400 ml-1 font-medium">아이디 입력 후 자동으로 확인됩니다</p>
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
        {errors.password && <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>}
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
        {!errors.passwordConfirm && isPasswordMismatch && (
          <p className="text-xs text-red-500 ml-1 font-medium">비밀번호가 일치하지 않습니다</p>
        )}
      </div>
    </div>
  )
}
