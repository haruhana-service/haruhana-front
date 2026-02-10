import type { TodayProblemResponse } from '../../../types/models'

interface ProblemCardProps {
  problem: TodayProblemResponse
}

/**
 * 오늘의 문제를 표시하는 카드 컴포넌트
 */
export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {problem.title}
          </h1>
          {problem.isSolved && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 self-start sm:self-auto">
              ✓ 해결 완료
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm sm:text-base text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded">
            난이도: {getDifficultyLabel(problem.difficulty)}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded">
            주제: {problem.categoryTopicName}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {problem.description}
        </p>
      </div>
    </div>
  )
}

/**
 * 난이도 값을 한글 라벨로 변환
 */
function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    EASY: '쉬움',
    MEDIUM: '보통',
    HARD: '어려움',
  }
  return labels[difficulty] || difficulty
}
