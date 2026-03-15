import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[100dvh] h-screen bg-[#F8FAFC] flex overflow-hidden relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-haru-400/[0.04] blur-[140px]" style={{ animation: 'floatOrb 14s ease-in-out infinite' }} />
        <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/[0.035] blur-[120px]" style={{ animation: 'floatOrb 18s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-sky-300/[0.03] blur-[100px]" style={{ animation: 'floatOrb 22s ease-in-out infinite 6s' }} />
      </div>
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
          className="flex-1 overflow-y-auto overscroll-none no-scrollbar [@supports(-webkit-overflow-scrolling:touch)]:[-webkit-overflow-scrolling:touch] px-[var(--page-px)] pt-[var(--page-pt)] pb-[var(--page-pb)]"
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
