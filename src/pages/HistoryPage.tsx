export function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">풀이 기록</h1>
          <p className="mt-2 text-gray-600">나의 꾸준함을 확인해보세요</p>
        </div>
        {/* TODO: Phase 6에서 풀이 기록 목록 구현 */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center text-gray-500">
            풀이 기록이 여기에 표시됩니다
          </div>
        </div>
      </div>
    </div>
  )
}
