import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/navigation'

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen shrink-0 bg-white border-r border-slate-200 sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 bg-haru-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-haru-600/25 group-hover:rotate-12 transition-transform">
            <span className="font-black text-lg">H</span>
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight italic">haru:</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-haru-50 text-haru-600 font-bold'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span className="text-sm font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-300 font-extrabold tracking-[0.2em] uppercase italic">
          HaruHaru v1.0
        </p>
      </div>
    </aside>
  )
}
