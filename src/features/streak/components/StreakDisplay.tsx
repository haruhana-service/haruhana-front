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
      <div className="bg-haru-900 text-white border-none shadow-2xl overflow-hidden relative min-h-[200px] flex items-center justify-center rounded-[32px]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-[5px] border-haru-800 rounded-full"></div>
            <div className="absolute inset-0 border-[5px] border-haru-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] font-black text-haru-400 uppercase tracking-[0.2em] animate-pulse">
            스트릭 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[32px] p-6 backdrop-blur-sm">
        <p className="text-sm text-red-300 font-medium text-center">스트릭을 불러올 수 없습니다</p>
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
      className="bg-haru-900 text-white border-none shadow-2xl overflow-hidden relative min-h-[200px] flex flex-col justify-center rounded-[32px] animate-fade-in"
    >
      {/* 장식용 그래디언트 */}
      <div className="absolute top-[-40%] right-[-20%] w-64 h-64 bg-haru-500/20 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-haru-300/10 rounded-full blur-[60px]"></div>

      <div className="flex justify-between items-center relative z-10 px-6">
        <div className="space-y-1">
          <p className="text-haru-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
            나의 데일리 스트릭
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter text-white">
              {streak.currentStreak}
            </h2>
            <span className="text-xl font-bold text-haru-400">일째</span>
          </div>
          {isNewRecord && streak.currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-haru-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-haru-500/30 mt-3">
              <span>🎉</span>
              <span>신기록!</span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(74,105,255,0.4)] animate-float">🔥</div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-white/10 flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] relative z-10 px-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-haru-500"></div>
          <span>최고 기록 {streak.maxStreak}일</span>
        </div>
      </div>
    </div>
  )
}
