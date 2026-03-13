import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants'
import { FullScreenLoading } from '../components/ui/LoadingSpinner'

export function RootRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenLoading text="로딩 중..." />
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  const redirectTo = user.role === 'ROLE_ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.TODAY
  return <Navigate to={redirectTo} replace />
}
