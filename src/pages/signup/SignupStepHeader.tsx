type Step = {
  id: number
  title: string
  description: string
}

interface SignupStepHeaderProps {
  currentStep: number
  steps: Step[]
}

export function SignupStepHeader({ currentStep, steps }: SignupStepHeaderProps) {
  return (
    <div className="shrink-0 mb-6">
      <div className="flex items-center gap-1.5 mb-5">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              currentStep >= step.id ? 'bg-haru-500' : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      <div className="min-h-[48px]">
        {currentStep === 1 && (
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            반가워요!
            <br />
            계정을 만들어주세요
          </h2>
        )}
        {currentStep === 2 && (
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            프로필을
            <br />
            설정해볼까요?
          </h2>
        )}
        {currentStep === 3 && (
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            나에게 딱 맞는
            <br />
            학습 설정
          </h2>
        )}
      </div>
    </div>
  )
}
