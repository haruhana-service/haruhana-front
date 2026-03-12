import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants'
import type { ReactNode } from 'react'

// ============================================
// ProtectedRoute - 로그인한 사용자만 접근 가능
// ============================================

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  // 로그인한 사용자면 접근 허용
  return <>{children}</>
}

// ============================================
// PublicRoute - 로그인 전용 (로그인, 회원가입)
// ============================================

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, isLoggingOut } = useAuth()

  // 로딩 중이면 로딩 표시
  if (isLoading || isLoggingOut) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 이미 로그인했으면 역할에 따라 리다이렉트
  if (user) {
    const redirectTo = user.role === 'ROLE_ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.TODAY
    return <Navigate to={redirectTo} replace />
  }

  // 로그인하지 않았으면 접근 허용
  return <>{children}</>
}
