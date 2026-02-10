import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * useAuth Hook
 *
 * AuthContext를 사용하기 위한 커스텀 훅
 * AuthProvider 외부에서 사용 시 에러 발생
 *
 * @returns AuthContext 값
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
