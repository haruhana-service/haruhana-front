import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

interface SignupAgreementModalProps {
  isOpen: boolean
  isChecked: boolean
  isSubmitting: boolean
  onClose: () => void
  onToggle: () => void
  onConfirm: () => void
}

export function SignupAgreementModal({
  isOpen,
  isChecked,
  isSubmitting,
  onClose,
  onToggle,
  onConfirm,
}: SignupAgreementModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="우리 함께 약속합시다." size="sm">
      <div className="space-y-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          하루에 한 번 꼭 문제를 풀어서 우리 함께 성장하자는 약속을 해요.
        </p>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
            className="h-4 w-4 rounded border-slate-300 text-haru-500 focus:ring-haru-400"
          />
          <span className="text-sm font-semibold text-slate-700">알겠습니다</span>
        </label>

        <Button
          type="button"
          fullWidth
          size="lg"
          disabled={!isChecked || isSubmitting}
          onClick={onConfirm}
          className="h-12 rounded-2xl text-base font-bold shadow-lg shadow-haru-100 active:scale-95 transition-transform"
        >
          {isSubmitting ? '가입 중...' : '하루하루 시작하기'}
        </Button>
      </div>
    </Modal>
  )
}
