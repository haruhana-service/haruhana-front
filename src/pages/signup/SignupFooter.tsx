import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../constants'

interface SignupFooterProps {
  currentStep: number
  stepsLength: number
  canProceedStep1: boolean
  handleNext: () => void
  handlePrev: () => void
  isSubmitting: boolean
  isStep3Incomplete: boolean
  onFinalClick: () => void
}

export function SignupFooter({
  currentStep,
  stepsLength,
  canProceedStep1,
  handleNext,
  handlePrev,
  isSubmitting,
  isStep3Incomplete,
  onFinalClick,
}: SignupFooterProps) {
  return (
    <div className="shrink-0 mt-6 space-y-3">
      {currentStep < stepsLength ? (
        <Button
          type="button"
          onClick={handleNext}
          disabled={currentStep === 1 ? !canProceedStep1 : false}
          fullWidth
          size="lg"
          className="h-14 rounded-2xl text-[17px] font-black shadow-lg shadow-haru-100 active:scale-95 transition-transform"
        >
          다음 단계로
        </Button>
      ) : (
        <>
          <Button
            type="button"
            onClick={onFinalClick}
            disabled={isSubmitting || isStep3Incomplete}
            fullWidth
            size="lg"
            className="h-14 rounded-2xl text-[17px] font-black shadow-lg shadow-haru-100 active:scale-95 transition-transform"
          >
            {isSubmitting ? '가입 중...' : '하루하루 시작하기'}
          </Button>
          {isStep3Incomplete && (
            <p className="text-center text-xs text-amber-600 font-semibold">
              분야와 난이도를 선택하면 시작할 수 있어요
            </p>
          )}
        </>
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
  )
}
