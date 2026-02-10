import { useStreak } from '../hooks/useStreak'

/**
 * 스트릭 정보를 표시하는 컴포넌트
 * 현재 스트릭과 최고 기록을 보여줍니다
 */
export function StreakDisplay() {
  const { data: streak, isLoading, error } = useStreak()

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
          <p className="ml-3 text-sm sm:text-base text-gray-600">스트릭 로딩 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 sm:p-6">
        <p className="text-sm sm:text-base text-red-700">스트릭을 불러올 수 없습니다</p>
      </div>
    )
  }

  // 데이터 없음
  if (!streak) {
    return null
  }

  const isNewRecord = streak.currentStreak > 0 && streak.currentStreak === streak.maxStreak

  return (
    <div
      data-testid="streak-container"
      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow-md p-4 sm:p-6 lg:p-8"
    >
      {/* 현재 스트릭 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🔥</span>
          {isNewRecord && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              신기록!
            </span>
          )}
        </div>

        <div className="mb-1">
          <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-600">
            {streak.currentStreak}
          </span>
        </div>

        <p className="text-base sm:text-lg text-gray-700 font-medium">
          일 연속
        </p>
      </div>

      {/* 최고 기록 */}
      <div className="mt-4 pt-4 border-t border-orange-200">
        <p className="text-center text-sm sm:text-base text-gray-600">
          최고 기록: <span className="font-semibold text-gray-900">{streak.maxStreak}일</span>
        </p>
      </div>
    </div>
  )
}
