import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '../constants'
import { getStatistics } from '../services/adminStatsService'

// ============================================
// Admin Dashboard
// ============================================

const adminMenus = [
  {
    title: '카테고리 관리',
    description: '카테고리, 그룹, 토픽 관리',
    path: ROUTES.ADMIN_CATEGORIES,
  },
  {
    title: '문제 관리',
    description: '일일 문제 관리 및 조회',
    path: ROUTES.ADMIN_PROBLEMS,
  },
  {
    title: '사용자 관리',
    description: '회원 정보 및 권한 관리',
    path: ROUTES.ADMIN_MEMBERS,
  },
  {
    title: '통계',
    description: '서비스 통계 및 분석',
    path: ROUTES.ADMIN_STATS,
  },
  {
    title: '디버그 모드',
    description: '알림/푸시 테스트',
    path: ROUTES.ADMIN_DEBUG,
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const { data: stats } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: getStatistics,
  })

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">HaruHaru 관리 시스템</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '전체 사용자', value: stats.totalMemberCount },
            { label: '오늘 문제 수', value: stats.todayProblemCount },
            { label: '오늘 제때 제출', value: stats.todayOnTimeSubmissionCount },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {adminMenus.map((menu) => (
          <button
            key={menu.title}
            onClick={() => navigate(menu.path)}
            className="group rounded-lg border border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-900 hover:shadow-sm active:scale-[0.99]"
          >
            <h3 className="text-base font-bold text-slate-900 group-hover:text-black">{menu.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{menu.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
