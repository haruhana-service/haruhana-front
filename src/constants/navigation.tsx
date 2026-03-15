import type { ReactElement } from 'react'
import { ROUTES } from './index'

export interface NavItem {
  path: string
  label: string
  icon: (isActive: boolean) => ReactElement
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    label: '대시보드',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_CATEGORIES,
    label: '카테고리',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_PROBLEMS,
    label: '문제',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_MEMBERS,
    label: '사용자',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_DEBUG,
    label: '디버그',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 3h6m-6 0a2 2 0 00-2 2v2m2-4a2 2 0 012 2v2m0 0h2a2 2 0 012 2v3a4 4 0 11-8 0V9a2 2 0 012-2zm-7 9h4m10 0h4M5 21l3-3m11 3l-3-3"
        />
      </svg>
    ),
  },
]

export const NAV_ITEMS: NavItem[] = [
  {
    path: ROUTES.TODAY,
    label: '챌린지',
    icon: (isActive) => (
      <svg
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
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
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
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
        className={`w-6 h-6 transition-colors ${isActive ? 'text-haru-600' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
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
