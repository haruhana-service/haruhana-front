import { useStreak } from '../hooks/useStreak'
import { useAuth } from '../../../hooks/useAuth'
import { useCountUp } from '../../../hooks/useCountUp'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

/**
 * 날짜 문자열에서 요일 라벨을 반환
 */
function getDayLabel(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return DAY_LABELS[date.getDay()]
}

/**
 * 스트릭 정보를 표시하는 컴포넌트
 * 현재 스트릭과 최고 기록을 보여줍니다
 */
export function StreakDisplay() {
  const { isAuthenticated } = useAuth()
  const { data: streak, isLoading, error } = useStreak({ enabled: isAuthenticated })
  const animatedStreak = useCountUp({ target: streak?.currentStreak ?? 0, duration: 1000, delay: 300 })

  const getStreakLevel = (count: number) => {
    if (count >= 30) return { label: '마스터', color: 'text-purple-400' }
    if (count >= 14) return { label: '전문가', color: 'text-blue-400' }
    if (count >= 7) return { label: '성실함', color: 'text-green-400' }
    return { label: '입문자', color: 'text-haru-300' }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="mesh-gradient text-white border-none shadow-2xl overflow-hidden relative min-h-[180px] flex items-center justify-center rounded-[24px] p-6 animate-fade-up stagger-1">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-[4px] border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-[4px] border-haru-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-[0.2em] animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-6 backdrop-blur-sm">
        <p className="text-sm text-red-300 font-semibold text-center">스트릭을 불러올 수 없습니다</p>
      </div>
    )
  }

  // 데이터 없음
  if (!streak) {
    return null
  }

  const level = getStreakLevel(streak.currentStreak)

  return (
    <div
      data-testid="streak-container"
      className="mesh-gradient text-white border-none shadow-[0_20px_60px_rgba(18,16,58,0.5)] overflow-hidden relative min-h-[180px] rounded-[24px] p-6 animate-fade-up stagger-1 shimmer-sweep"
    >
      {/* 도트 그리드 오버레이 */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      {/* 상단 액센트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-haru-400/60 to-transparent" />
      {/* 메인 글로우 - 우측 상단 */}
      <div className="absolute -top-6 -right-6 w-52 h-52 bg-haru-500/25 rounded-full blur-[65px] animate-pulse-glow"></div>
      {/* 보조 글로우 - 좌측 하단 */}
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-600/20 rounded-full blur-[55px] animate-pulse-glow" style={{ animationDelay: '1.2s' }}></div>

      <div className="flex justify-between items-center relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-2 py-1 rounded bg-white/10 ${level.color}`}>
              {level.label}
            </span>
          </div>
          <p className="text-white/60 text-[11px] font-extrabold uppercase tracking-[0.2em]">연속 학습 리듬</p>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-5xl font-black tracking-tighter streak-number">{animatedStreak}</h2>
            <span className="text-lg font-extrabold text-haru-300 italic">일째</span>
          </div>
        </div>

        {/* 불꽃 아이콘 */}
        <div className="relative group flex flex-col items-center mr-2">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="text-5xl animate-bounce-soft relative z-10">🔥</div>
        </div>
      </div>

      {/* 잔디 심기 - 서버에서 받은 주간 풀이 현황 */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-end">
          <div className="flex gap-1.5">
            {streak.weeklySolvedStatus.map((status) => (
              <div key={status.date} className="grass-cell flex flex-col items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-md transition-all duration-500
                    ${status.isSolved
                      ? 'bg-gradient-to-br from-haru-400 to-haru-600 shadow-[0_0_10px_rgba(74,105,255,0.5)]'
                      : 'bg-white/5 border border-white/8'}`}
                />
                <span className="text-[8px] font-extrabold text-white/50">{getDayLabel(status.date)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-extrabold text-white/60 uppercase tracking-widest">최고 {streak.maxStreak}일 기록 중</span>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full border border-white/5">
              <div className="w-1 h-1 rounded-full bg-haru-400 animate-pulse"></div>
              <span className="text-[9px] font-extrabold text-haru-400 uppercase tracking-tighter">Live Status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
