import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTodayProblem } from '../features/problem/hooks/useTodayProblem'
import { useStreak } from '../features/streak/hooks/useStreak'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

function getDayLabel(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return DAY_LABELS[date.getDay()]
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
}

const REMINDER_INTERVAL_MS = 60 * 60 * 1000
const REMINDER_LAST_AT_KEY = 'haruharu_unsolved_reminder_last_at'

export function TodayPage() {
  const { data: problem, isLoading: problemLoading, error } = useTodayProblem()
  const { data: streak, isLoading: streakLoading } = useStreak()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  const hasPromptedRef = useRef(false)

  const handleProblemClick = () => {
    if (problem) {
      navigate(`/problem/${problem.id}`)
    }
  }

  useEffect(() => {
    if (!problem || problem.isSolved) return
    if (hasPromptedRef.current) return

    hasPromptedRef.current = true
    setIsReminderOpen(true)
  }, [problem])

  useEffect(() => {
    if (!problem || problem.isSolved) return

    const canNotifyNow = () => {
      const lastAt = Number(localStorage.getItem(REMINDER_LAST_AT_KEY) || 0)
      return !lastAt || Date.now() - lastAt >= REMINDER_INTERVAL_MS
    }

    const sendReminder = () => {
      if (!canNotifyNow()) return

      const title = '오늘의 문제를 아직 풀지 않았어요'
      const body = '지금 5분만 도전해볼까요?'

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-64x64.png',
          tag: 'haru-unsolved-reminder',
        })
      } else {
        toast.info(title, { description: body, duration: 6000 })
      }

      localStorage.setItem(REMINDER_LAST_AT_KEY, String(Date.now()))
    }

    sendReminder()
    const intervalId = window.setInterval(sendReminder, REMINDER_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [problem])

  const getStreakLevel = (count: number) => {
    if (count >= 30) return { label: '마스터', color: 'text-purple-400' }
    if (count >= 14) return { label: '전문가', color: 'text-blue-400' }
    if (count >= 7) return { label: '성실함', color: 'text-green-400' }
    return { label: '입문자', color: 'text-haru-300' }
  }

  const level = getStreakLevel(streak?.currentStreak || 0)

  return (
    <>
      <div className="max-w-xl mx-auto space-y-6 pb-10">
      {/* 콤팩트해진 스트릭 카드 */}
      <Card variant="dark" className="animate-fade-up stagger-1 relative overflow-hidden border-none p-4 min-h-[140px]">
        {/* 애니메이션 글로우 (크기 축소) */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-haru-500/20 rounded-full blur-[50px] animate-pulse-glow"></div>

        {streakLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-[4px] border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-[4px] border-haru-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[11px] font-extrabold text-white/50 uppercase tracking-[0.2em] animate-pulse">
              Loading...
            </p>
          </div>
        ) : streak ? (
          <>
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-2 py-1 rounded bg-white/10 ${level.color}`}>
                    {level.label}
                  </span>
                </div>
                <p className="text-white/60 text-[11px] font-extrabold uppercase tracking-[0.2em]">연속 학습 리듬</p>
                <div className="flex items-baseline gap-1.5">
                  <h2 className="text-5xl font-black tracking-tighter text-white">{streak.currentStreak}</h2>
                  <span className="text-lg font-extrabold text-haru-400 italic">일째</span>
                </div>
              </div>

              {/* 불꽃 아이콘 크기 최적화 */}
              <div className="relative group flex flex-col items-center mr-2">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="text-5xl animate-bounce-soft relative z-10">🔥</div>
              </div>
            </div>

            {/* 잔디 심기 (더 작고 세련되게 변경) */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end">
                <div className="flex gap-1.5">
                  {streak.weeklySolvedStatus.map((status) => (
                    <div key={status.date} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-md transition-all duration-500
                          ${status.isSolved
                            ? 'bg-haru-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                            : 'bg-white/5 border border-white/5'}`}
                      />
                      <span className="text-[8px] font-extrabold text-white/50">
                        {getDayLabel(status.date)}
                      </span>
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
          </>
        ) : (
          <div className="text-center py-3">
            <div className="text-haru-100">스트릭 정보를 불러올 수 없습니다.</div>
          </div>
        )}
      </Card>

      {/* 학습 정보 필 - 컴팩트 스타일 */}
      {user?.categoryTopicName && user?.difficulty && (
        <div className="flex gap-2.5 animate-fade-up stagger-2 px-1">
          <div className="flex-1 flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-haru-500"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">TOPIC</span>
              <span className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]">{user.categoryTopicName}</span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-slate-500">LV</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">LEVEL</span>
              <span className="text-[13px] font-bold text-slate-800">{DIFFICULTY_LABELS[user.difficulty] || user.difficulty}</span>
            </div>
          </div>
        </div>
      )}

      {/* 오늘의 문제 카드 */}
      <Card
        title="오늘의 챌린지"
        subtitle="매일 조금씩, 당신의 성장을 돕습니다"
        className="animate-fade-up stagger-3 border-none bg-white relative overflow-hidden group/card"
      >
        {problemLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-[4px] border-slate-50 rounded-full"></div>
              <div className="absolute inset-0 border-[4px] border-haru-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Loading Next Goal...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-500 text-sm font-semibold">챌린지를 불러올 수 없습니다</p>
          </div>
        ) : problem ? (
          <div className="space-y-6 animate-fade-in relative z-10">
            <div className="space-y-3">
              <h4 className="text-[22px] font-extrabold text-slate-900 leading-tight tracking-tight">
                {problem.title}
              </h4>
              <p className="text-slate-500 text-[14px] leading-relaxed font-medium line-clamp-2">
                {problem.description}
              </p>
            </div>

            <div className="pt-1">
              {problem.isSolved ? (
                <Button fullWidth variant="secondary" onClick={handleProblemClick} className="h-[56px] rounded-2xl bg-green-50 border border-slate-200 text-slate-700 text-[15px] font-semibold">
                  제출 기록 확인
                </Button>
              ) : (
                <Button fullWidth onClick={handleProblemClick} className="h-[56px] rounded-2xl bg-haru-600 hover:bg-haru-700 text-white shadow-lg shadow-haru-600/15 active:scale-[0.98] group/btn">
                  <span className="text-[15px] font-bold">챌린지 시작하기</span>
                  <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-500 text-sm font-semibold">챌린지를 불러올 수 없습니다</p>
          </div>
        )}
      </Card>

      <div className="pt-8 pb-12 flex flex-col items-center gap-3 opacity-30">
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <p className="text-[10px] text-slate-400 font-extrabold tracking-[0.4em] uppercase italic text-center leading-relaxed">
          Daily progress leads to<br/>Mastery
        </p>
      </div>
      </div>
      <Modal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} title="아직 오늘의 문제를 풀지 않았어요">
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            오늘의 문제를 풀면 성장 리듬이 이어집니다. 지금 바로 도전해볼까요?
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            앱을 종료하면 주기 알림이 오지 않습니다. 알림을 받으려면 최소화 상태로 유지해주세요.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsReminderOpen(false)}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
            >
              나중에
            </button>
            <Button
              type="button"
              onClick={() => {
                setIsReminderOpen(false)
                handleProblemClick()
              }}
              className="flex-1 h-12 rounded-xl text-sm font-bold shadow-lg shadow-haru-100 active:scale-95"
            >
              지금 풀기
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
