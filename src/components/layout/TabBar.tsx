import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../constants/navigation'

export function TabBar() {
  const { user } = useAuth()
  const location = useLocation()
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        setInputFocused(true)
      }
    }
    const onFocusOut = (e: FocusEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        setInputFocused(false)
      }
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])
  const navItems = user?.role === 'ROLE_ADMIN' ? ADMIN_NAV_ITEMS : NAV_ITEMS
  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => location.pathname.startsWith(item.path))
  )
  const itemCount = Math.max(1, navItems.length)

  if (inputFocused) return null

  return (
    <nav className="lg:hidden shrink-0 h-[calc(4rem+env(safe-area-inset-bottom))] glass bg-white/90 border-t border-slate-200/70 flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom)] fixed bottom-0 left-0 right-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-md w-full flex justify-around items-center relative py-2">
        <div
          className="absolute inset-y-0 left-0 transition-transform duration-300 ease-out"
          style={{
            width: `calc(100% / ${itemCount})`,
            transform: `translateX(${activeIndex * 100}%)`,
            padding: '4px',
            willChange: 'transform',
          }}
          aria-hidden="true"
        >
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(14,165,233,0.18) 55%, rgba(34,211,238,0.28))',
              backgroundSize: '180% 180%',
              backgroundPosition: `${activeIndex * 35}% 50%`,
            }}
          />
        </div>
        {navItems.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `group flex-1 flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${
                isActive
                  ? 'text-haru-600 scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:scale-[1.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-haru-50/50' : 'group-hover:bg-slate-100/80'
                  }`}
                >
                  {tab.icon(isActive)}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-bold uppercase tracking-tight transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-60'
                  }`}
                >
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
