import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants'

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
]

export function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">HaruHaru 관리 시스템</p>
      </div>

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
