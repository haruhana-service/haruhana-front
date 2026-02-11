import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { LoginPage } from './LoginPage'
import * as authService from '../features/auth/services/authService'

// Mock authService
vi.mock('../features/auth/services/authService', () => ({
  login: vi.fn(),
  getProfile: vi.fn(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인 폼이 올바르게 렌더링된다', () => {
    render(<LoginPage />)

    expect(screen.getByText('haru:')).toBeInTheDocument()
    expect(screen.getByLabelText(/아이디/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /챌린지 시작하기/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /회원가입/i })).toBeInTheDocument()
  })

  it('로그인 ID 미입력 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /챌린지 시작하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/로그인 ID를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('비밀번호 미입력 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const loginIdInput = screen.getByLabelText(/아이디/i)
    const submitButton = screen.getByRole('button', { name: /챌린지 시작하기/i })

    await user.type(loginIdInput, 'testuser')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('잘못된 자격증명 시 API 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()

    // Mock login to throw an ApiError
    const apiError = {
      message: '로그인 정보가 올바르지 않습니다',
      code: 'INVALID_CREDENTIALS',
    }
    vi.mocked(authService.login).mockRejectedValueOnce(apiError)

    render(<LoginPage />)

    const loginIdInput = screen.getByLabelText(/아이디/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /챌린지 시작하기/i })

    await user.type(loginIdInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/로그인 정보가 올바르지 않습니다/i)).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 /today로 리다이렉트한다', async () => {
    const user = userEvent.setup()

    // Mock successful login
    const mockTokenResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    }
    const mockProfile = {
      loginId: 'testuser',
      nickname: 'Test User',
      createdAt: '2026-01-01T00:00:00Z',
      categoryTopicName: 'Spring',
      difficulty: 'MEDIUM',
    }

    vi.mocked(authService.login).mockResolvedValueOnce(mockTokenResponse)
    vi.mocked(authService.getProfile).mockResolvedValueOnce(mockProfile)

    render(<LoginPage />)

    const loginIdInput = screen.getByLabelText(/아이디/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /챌린지 시작하기/i })

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        loginId: 'testuser',
        password: 'Password123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/today')
    })
  })

  it('제출 중에는 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()

    // Mock a slow login
    vi.mocked(authService.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<LoginPage />)

    const loginIdInput = screen.getByLabelText(/아이디/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /챌린지 시작하기/i })

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.click(submitButton)

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /로그인 중.../i })).toBeInTheDocument()
  })
})
