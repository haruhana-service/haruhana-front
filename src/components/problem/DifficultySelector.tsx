import type { Difficulty } from '../../types/models'
import { DIFFICULTY_LABELS } from '../../constants'

interface DifficultySelectorProps {
  value: Difficulty | undefined
  onChange: (difficulty: Difficulty) => void
  error?: string
}

export function DifficultySelector({ value, onChange, error }: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

  const difficultyDescriptions = {
    EASY: '기초적인 개념과 간단한 문제',
    MEDIUM: '실무에 필요한 중급 수준의 문제',
    HARD: '심화 학습과 복잡한 문제',
  }

  return (
    <div className="space-y-3 px-1">
      <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
        난이도 선택
      </label>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() => onChange(difficulty)}
            className={`
              relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all
              ${
                value === difficulty
                  ? 'border-haru-500 bg-haru-50 shadow-md scale-[1.02]'
                  : 'border-slate-100 bg-white hover:border-haru-200 shadow-sm'
              }
            `}
          >
            <div className="flex w-full items-center justify-between">
              <span className={`text-sm font-bold tracking-tight ${
                value === difficulty ? 'text-haru-700' : 'text-slate-700'
              }`}>
                {DIFFICULTY_LABELS[difficulty]}
              </span>
              {value === difficulty && (
                <div className="w-5 h-5 rounded-full bg-haru-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <p className={`mt-1 text-[11px] font-medium ${
              value === difficulty ? 'text-haru-600/70' : 'text-slate-400'
            }`}>
              {difficultyDescriptions[difficulty]}
            </p>
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  )
}
