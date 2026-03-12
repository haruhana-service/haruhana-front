import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants'
import type { ReactNode } from 'react'

// ============================================
// AdminRoute - 관리자만 접근 가능
// ============================================

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isLoggingOut } = useAuth()

  // 로딩 중이면 로딩 표시
  if (isLoading || isLoggingOut) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 로그인하지 않았으면 로그인 페이지로
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Admin 권한이 없으면 오늘의 문제 페이지로
  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to={ROUTES.TODAY} replace />
  }

  // Admin 권한이 있으면 접근 허용
  return <>{children}</>
}
