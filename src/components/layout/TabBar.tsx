import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants'
import type { ReactElement } from 'react'

interface TabItem {
  path: string
  label: string
  icon: (isActive: boolean) => ReactElement
}

const tabs: TabItem[] = [
  {
    path: ROUTES.TODAY,
    label: '챌린지',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-300'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    path: ROUTES.HISTORY,
    label: '성장 기록',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-300'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    label: '설정',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-300'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function TabBar() {
  return (
    <nav className="shrink-0 h-16 glass border-t border-white/40 flex justify-around items-center px-4 fixed bottom-0 left-0 right-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="mx-auto max-w-md w-full flex justify-around items-center">
        {tabs.map((tab) => (
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
