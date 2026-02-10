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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        난이도 선택 <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() => onChange(difficulty)}
            className={`
              relative flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all
              ${
                value === difficulty
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {DIFFICULTY_LABELS[difficulty]}
              </span>
              {value === difficulty && (
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {difficultyDescriptions[difficulty]}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
