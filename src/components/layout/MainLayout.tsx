import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[100dvh] h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* 스킵 네비게이션 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        본문으로 건너뛰기
      </a>

      {/* Sidebar - 데스크톱 전용 */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main
          id="main-content"
          data-scroll-container="true"
          className="flex-1 overflow-y-auto overscroll-none no-scrollbar scroll-smooth [@supports(-webkit-overflow-scrolling:touch)]:[-webkit-overflow-scrolling:touch] px-[var(--page-px)] pt-[var(--page-pt)] pb-[var(--page-pb)]"
        >
          <div className="max-w-xl lg:max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* Tab Bar - 모바일 전용 */}
        <TabBar />
      </div>
    </div>
  )
}
