export function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            문제 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            나에게 맞는 문제 난이도와 주제를 선택해주세요
          </p>
        </div>
        {/* TODO: Phase 3에서 문제 설정 폼 구현 */}
        <div className="text-center text-gray-500">
          문제 설정 폼이 여기에 표시됩니다
        </div>
      </div>
    </div>
  )
}
