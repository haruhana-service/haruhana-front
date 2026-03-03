import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { MemberProfileResponse } from '../types/models'
import type { TokenResponse } from '../types/models'
import { getAccessToken, setAuthTokens, clearAuthTokens } from '../services/api'
import { getProfile } from '../features/auth/services/authService'
import { requestAndSyncFCMToken, deleteFCMToken, onMessageReceived } from '../services/fcmService'
import { ROUTES } from '../constants'
import { AuthContext, type AuthContextType } from './authContextDef'

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
  const fetchProfile = async (isInitialLoad = false): Promise<MemberProfileResponse | null> => {
    try {
      const profile = await getProfile()
      setUser(profile)
      return profile
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // 초기 로드 시에만 토큰 제거 (로그인 후 실패는 재시도 가능하도록 유지)
      if (isInitialLoad) {
        clearAuthTokens()
      }
      setUser(null)
      return null
    }
  }

  // 초기 로드 시 토큰 확인 및 프로필 복원
  useEffect(() => {
    const token = getAccessToken()

    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 비동기 초기화 패턴
      fetchProfile(true).finally(() => setIsLoading(false))
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

    return () => {
      unsubscribe?.()
    }
  }, [user, navigate])

  // 로그인 처리
  const login = async (tokenResponse: TokenResponse) => {
    try {
      const { accessToken, refreshToken } = tokenResponse

      console.log('[Auth] Received token response:', { accessToken: !!accessToken, refreshToken: !!refreshToken })

      // 토큰 저장
      setAuthTokens(accessToken, refreshToken)
      console.log('[Auth] Tokens saved to localStorage')

      // 저장 확인
      const savedToken = localStorage.getItem('haruharu_access_token')
      console.log('[Auth] Verification - token in localStorage:', !!savedToken)

      // 프로필 조회
      const profile = await fetchProfile()
      console.log('[Auth] Profile fetched:', { role: profile?.role, loginId: profile?.loginId })

      // FCM 토큰 동기화 (비차단적)
      requestAndSyncFCMToken().catch((error) => {
        console.error('[Auth] FCM sync failed:', error)
      })

      // 역할에 따라 다른 페이지로 이동
      if (profile?.role === 'ROLE_ADMIN') {
        console.log('[Auth] Redirecting to admin dashboard')
        navigate(ROUTES.ADMIN_DASHBOARD)
      } else {
        console.log('[Auth] Redirecting to today page')
        navigate(ROUTES.TODAY)
      }
    } catch (error) {
      console.error('[Auth] Login failed:', error)
      throw error
    }
  }

  // 로그아웃 처리
  const logout = async () => {
    // FCM 토큰 삭제 (로그아웃 전에 처리)
    try {
      await deleteFCMToken()
    } catch (error) {
      console.error('[Auth] FCM deletion failed:', error)
    }

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
