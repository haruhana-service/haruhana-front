import { useTodayProblem } from '../features/problem/hooks/useTodayProblem'
import { ProblemCard } from '../features/problem/components/ProblemCard'
import { SubmissionForm } from '../features/submission/components/SubmissionForm'
import { submitSolution } from '../features/problem/services/problemService'

export function TodayPage() {
  const { data: problem, isLoading, error } = useTodayProblem()

  const handleSubmit = async (answer: string) => {
    if (!problem) {
      throw new Error('문제 정보를 찾을 수 없습니다')
    }
    return await submitSolution(problem.id, { userAnswer: answer })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            오늘의 문제
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            하루 딱 1문제, 가볍게 시작해보세요
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-lg bg-white p-8 sm:p-12 shadow-md">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">
                오늘의 문제를 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-medium text-red-800">
                  문제를 불러올 수 없습니다
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Problem Display */}
        {problem && !isLoading && !error && (
          <div className="space-y-6 sm:space-y-8">
            <ProblemCard problem={problem} />

            {/* Submission Form */}
            <SubmissionForm onSubmit={handleSubmit} />
          </div>
        )}
      </div>
    </div>
  )
}
