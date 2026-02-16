import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/navigation'

export function TabBar() {
  return (
    <nav className="lg:hidden shrink-0 h-16 glass border-t border-white/40 flex justify-around items-center px-4 fixed bottom-0 left-0 right-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="mx-auto max-w-md w-full flex justify-around items-center">
        {NAV_ITEMS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-300 relative ${
                isActive ? 'text-haru-600 scale-105' : 'text-slate-300 hover:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-haru-50/50' : ''}`}>
                  {tab.icon(isActive)}
                </div>
                <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-tight transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.label}
                </span>
                {/* removed active-page dot */}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
