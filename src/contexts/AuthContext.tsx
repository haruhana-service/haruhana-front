import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { MemberProfileResponse } from '../types/models'
import type { TokenResponse } from '../types/models'
import { getAccessToken, setAuthTokens, clearAuthTokens } from '../services/api'
import { clearAllQueries } from '../services/queryClient'
import { getProfile, logout as logoutApi } from '../features/auth/services/authService'
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const isLoggingOutRef = useRef(false)
  const lastSyncedLoginIdRef = useRef<string | null>(null)

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
      setIsLoggingOut(true)
      setUser(null)
      navigate(ROUTES.LOGIN)
      setTimeout(() => setIsLoggingOut(false), 0)
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

      toast.custom((t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(74, 105, 255, 0.12)',
            padding: '12px 16px',
            width: 360,
            maxWidth: '90vw',
            cursor: problemId ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (problemId) {
              navigate(`/problem/${problemId}`)
              toast.dismiss(t)
            }
          }}
        >
          <img
            src="/logo-square.svg"
            alt="하루하루"
            style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1f36', marginBottom: 2 }}>
              {title}
            </div>
            {body && (
              <div style={{ fontSize: 13, color: '#4a5568', whiteSpace: 'pre-line' }}>
                {body}
              </div>
            )}
          </div>
          {problemId && (
            <div style={{ fontSize: 13, color: '#4a69ff', fontWeight: 600, flexShrink: 0 }}>
              풀기 →
            </div>
          )}
        </div>
      ), {
        duration: 5000,
        unstyled: true,
        style: { padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' },
      })
    })

    return () => {
      unsubscribe?.()
    }
  }, [user, navigate])

  // 로그인 상태 복원/전환 시 FCM 토큰 동기화
  useEffect(() => {
    if (!user) {
      lastSyncedLoginIdRef.current = null
      return
    }
    if (lastSyncedLoginIdRef.current === user.loginId) return
    lastSyncedLoginIdRef.current = user.loginId
    requestAndSyncFCMToken({ forceSync: true }).catch((error) => {
      console.error('[Auth] FCM sync failed:', error)
    })
  }, [user])

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
    if (isLoggingOutRef.current) return
    isLoggingOutRef.current = true
    setIsLoggingOut(true)

    try {
      const accessToken = getAccessToken()
      console.log('[Auth] Logout started')

      // 1) FCM 토큰 삭제 API 호출
      try {
        await deleteFCMToken()
        console.log('[Auth] FCM token deletion finished')
      } catch (error) {
        console.error('[Auth] FCM deletion failed:', error)
      }

      // 2) 서버 로그아웃 API 호출
      try {
        await logoutApi(accessToken ?? undefined)
        console.log('[Auth] Logout API finished')
      } catch (error) {
        console.error('[Auth] Logout API failed:', error)
      }

      // 3) 클라이언트 로그아웃 처리
      clearAuthTokens()
      clearAllQueries()
      setUser(null)
      navigate(ROUTES.LOGIN)
      console.log('[Auth] Client logout finished')
    } finally {
      console.log('[Auth] Logout flow finished')
      isLoggingOutRef.current = false
      setIsLoggingOut(false)
    }
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
    isLoggingOut,
    login,
    logout,
    updateUser,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}