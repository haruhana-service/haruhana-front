import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { MemberProfileResponse, TokenResponse } from '../types/models'
import { getAccessToken, setAuthTokens, clearAuthTokens } from '../services/api'
import { getProfile } from '../features/auth/services/authService'
import { requestAndSyncFCMToken, deleteFCMToken, onMessageReceived } from '../services/fcmService'
import { ROUTES } from '../constants'

// ============================================
// AuthContext Types
// ============================================

interface AuthContextType {
  user: MemberProfileResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (tokenResponse: TokenResponse) => Promise<void>
  logout: () => void
  updateUser: (user: MemberProfileResponse) => void
  refetchProfile: () => Promise<void>
}

// ============================================
// AuthContext
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// AuthProvider
// ============================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<MemberProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // 프로필 조회
  const fetchProfile = async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // 프로필 조회 실패 시 토큰 제거
      clearAuthTokens()
      setUser(null)
    }
  }

  // 초기 로드 시 토큰 확인 및 프로필 복원
  useEffect(() => {
    const token = getAccessToken()

    if (token) {
      fetchProfile()
        .then(() => {
          // FCM 토큰 동기화 (비차단적)
          requestAndSyncFCMToken().catch((error) => {
            console.error('[Auth] FCM sync failed:', error)
          })
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // 로그아웃 이벤트 리스너 (토큰 만료 시 자동 로그아웃)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      navigate(ROUTES.LOGIN)
    }

    window.addEventListener('auth:logout', handleLogout)

    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [navigate])

  // FCM 포그라운드 메시지 리스너 (앱이 포커스 상태일 때)
  useEffect(() => {
    if (!user) return

    const unsubscribe = onMessageReceived((payload) => {
      console.log('[Auth] FCM foreground message:', payload)

      const title = payload.notification?.title || '새 알림'
      const body = payload.notification?.body || ''
      const problemId = payload.data?.problemId

      toast.info(title, {
        description: body,
        duration: 5000,
        action: problemId
          ? {
              label: '보기',
              onClick: () => navigate(`/problem/${problemId}`),
            }
          : undefined,
      })
    })

    return unsubscribe
  }, [user, navigate])

  // 로그인 처리
  const login = async (tokenResponse: TokenResponse) => {
    const { accessToken, refreshToken } = tokenResponse

    // 토큰 저장
    setAuthTokens(accessToken, refreshToken)

    // 프로필 조회
    await fetchProfile()

    // FCM 토큰 동기화 (비차단적)
    requestAndSyncFCMToken().catch((error) => {
      console.error('[Auth] FCM sync failed:', error)
    })

    // 오늘의 문제 페이지로 이동
    navigate(ROUTES.TODAY)
  }

  // 로그아웃 처리
  const logout = () => {
    // FCM 토큰 삭제 (비차단적)
    deleteFCMToken().catch((error) => {
      console.error('[Auth] FCM deletion failed:', error)
    })

    // 토큰 제거
    clearAuthTokens()

    // 사용자 정보 제거
    setUser(null)

    // 로그인 페이지로 이동
    navigate(ROUTES.LOGIN)
  }

  // 사용자 정보 업데이트
  const updateUser = (updatedUser: MemberProfileResponse) => {
    setUser(updatedUser)
  }

  // 프로필 재조회
  const refetchProfile = async () => {
    await fetchProfile()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================
// useAuth Hook
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
