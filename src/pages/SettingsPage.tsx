import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { ROUTES } from '../constants'
import { formatDateKorean } from '../utils/date'

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '쉬움 (기초)',
  MEDIUM: '보통 (심화)',
  HARD: '어려움 (전문가)',
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="animate-fade-up flex flex-col items-center pb-20 pt-8">
      {/* 프로필 헤더 - 프리미엄 디자인 */}
      <div className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-haru-500 via-haru-600 to-haru-700 rounded-xl sm:rounded-2xl shadow-premium-lg">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative px-4 sm:px-6 py-4 sm:py-6">
            <button
              onClick={() => navigate(ROUTES.PROFILE_EDIT)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all group z-10"
              title="프로필 수정"
            >
              <svg
                className="w-4 h-4 text-white/80 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <div className="flex items-center gap-5">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-[88px] h-[88px] rounded-[28px] bg-white/20 backdrop-blur-xl border border-white/30 p-[6px] shadow-xl">
                  <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-haru-600 text-[42px] font-black shadow-inner">
                    {user?.nickname?.charAt(0).toUpperCase() || 'H'}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-1">
                <p className="text-[13px] font-bold text-white/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
                  학습자 프로필
                </p>
                <h2 className="text-[28px] font-black text-white tracking-tight leading-tight">
                  {user?.nickname || '-'}님
                </h2>
                <div className="flex items-center text-[13px] text-white/80 gap-1.5 pt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold">{user?.createdAt ? formatDateKorean(user.createdAt) : '-'} 가입</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 설정 리스트 섹션 */}
      <div className="w-full space-y-6 mt-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between ml-1 pr-1">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1 h-4 bg-haru-600 rounded-full"></span>
              현재 학습 설정
            </h3>
            <button
              onClick={() => navigate(ROUTES.PREFERENCE_EDIT)}
              className="text-[12px] font-bold text-haru-600 hover:text-haru-700 transition-colors tracking-wide"
            >
              변경
            </button>
          </div>

          <Card className="!p-0 border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex justify-between items-center group transition-colors hover:bg-slate-50/50">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">현재 난이도</p>
                  <p className="font-bold text-slate-800 text-[15px]">
                    {user?.difficulty ? DIFFICULTY_LABELS[user.difficulty] || user.difficulty : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-haru-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center group transition-colors hover:bg-slate-50/50">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">학습 주제</p>
                  <p className="font-bold text-slate-800 text-[15px]">{user?.categoryTopicName || '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-haru-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">나의 계정</h3>
          <button
            onClick={logout}
            className="w-full p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 hover:bg-red-50/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                서비스 로그아웃
              </span>
            </div>
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-red-300 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        <div className="text-center pt-10 opacity-30">
          <p className="text-[12px] text-slate-400 font-extrabold tracking-[0.3em] uppercase italic">
            HaruHaru Intelligence v1.0
          </p>
        </div>
      </div>
    </div>
  )
}