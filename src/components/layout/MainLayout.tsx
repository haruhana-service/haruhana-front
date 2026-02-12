import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* 스킵 네비게이션 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        본문으로 건너뛰기
      </a>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-4 pt-6 pb-24">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Tab Bar */}
      <TabBar />
    </div>
  )
}
