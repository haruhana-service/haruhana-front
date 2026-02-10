export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="mt-2 text-gray-600">문제 난이도와 주제를 변경할 수 있습니다</p>
        </div>
        {/* TODO: Phase 7에서 설정 변경 폼 구현 */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center text-gray-500">
            설정 변경 폼이 여기에 표시됩니다
          </div>
        </div>
      </div>
    </div>
  )
}
