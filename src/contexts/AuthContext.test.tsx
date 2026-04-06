import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { render } from '../test/utils'
import { useAuth } from '../hooks/useAuth'

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api')
  return {
    ...actual,
    getAccessToken: vi.fn().mockReturnValue(null),
    setAuthTokens: vi.fn(),
    clearAuthTokens: vi.fn(),
  }
})

vi.mock('../features/auth/services/authService', () => ({
  getProfile: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../services/fcmService', () => ({
  requestAndSyncFCMToken: vi.fn().mockResolvedValue(null),
  deleteFCMToken: vi.fn().mockResolvedValue(undefined),
  onMessageReceived: vi.fn().mockReturnValue(() => {}),
}))

vi.mock('../services/queryClient', () => ({
  clearAllQueries: vi.fn(),
  queryClient: {
    clear: vi.fn(),
    fetchQuery: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { getAccessToken } from '../services/api'
import { getProfile } from '../features/auth/services/authService'

const mockProfile = {
  loginId: 'testuser',
  nickname: '테스트유저',
  createdAt: '2025-01-01T00:00:00',
  memberPreferences: [{ preferenceId: 1, categoryTopicName: 'Spring', difficulty: 'MEDIUM' }],
  role: 'ROLE_MEMBER' as const,
}

function AuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(auth.isLoading)}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="user">{auth.user?.nickname ?? 'null'}</div>
      <button onClick={() => auth.login({ accessToken: 'token', refreshToken: 'refresh' })}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    vi.mocked(getAccessToken).mockReturnValue(null)
    vi.mocked(getProfile).mockResolvedValue(mockProfile)
  })

  it('토큰이 없을 때 isLoading이 false가 된다', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null)

    render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('토큰이 있을 때 프로필을 로드한다', async () => {
    vi.mocked(getAccessToken).mockReturnValue('existing-token')
    vi.mocked(getProfile).mockResolvedValue(mockProfile)

    render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('테스트유저')
    })
  })

  it('login 후 일반 사용자는 /today로 이동한다', async () => {
    vi.mocked(getProfile).mockResolvedValue({ ...mockProfile, role: 'ROLE_MEMBER' as const })

    const { getByRole } = render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      getByRole('button', { name: 'login' }).click()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/today')
    })
  })

  it('login 후 admin은 /admin/dashboard로 이동한다', async () => {
    vi.mocked(getProfile).mockResolvedValue({ ...mockProfile, role: 'ROLE_ADMIN' as const })

    const { getByRole } = render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      getByRole('button', { name: 'login' }).click()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('logout 후 /login으로 이동한다', async () => {
    vi.mocked(getAccessToken).mockReturnValue('existing-token')
    vi.mocked(getProfile).mockResolvedValue(mockProfile)

    const { getByRole } = render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('테스트유저')
    })

    await act(async () => {
      getByRole('button', { name: 'logout' }).click()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('auth:logout 이벤트 발생 시 자동 로그아웃된다', async () => {
    render(<AuthConsumer />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
