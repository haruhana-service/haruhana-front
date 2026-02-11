import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-4 pt-6 pb-24">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Tab Bar */}
      <TabBar />
    </div>
  )
}
