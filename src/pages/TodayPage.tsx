export function TodayPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">오늘의 문제</h1>
          <p className="mt-2 text-gray-600">하루 딱 1문제, 가볍게 시작해보세요</p>
        </div>
        {/* TODO: Phase 4에서 오늘의 문제 및 제출 폼 구현 */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center text-gray-500">
            오늘의 문제가 여기에 표시됩니다
          </div>
        </div>
      </div>
    </div>
  )
}
