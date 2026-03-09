import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="shrink-0 h-16 glass border-b border-white/40 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="mx-auto max-w-md lg:max-w-none w-full flex items-center justify-between">
        {/* Logo - 데스크톱에서는 Sidebar에 로고가 있으므로 숨김 */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.TODAY)}
          className="flex items-center gap-2.5 cursor-pointer group lg:hidden"
          aria-label="첫 페이지로 이동"
        >
          <div className="w-9 h-9 bg-haru-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-haru-600/25 group-hover:rotate-12 transition-transform">
            <span className="font-black text-lg">H</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight italic">haru:</span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="h-10 px-3 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  )
}
