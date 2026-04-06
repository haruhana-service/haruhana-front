import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { LoginPage } from './LoginPage'
import * as authService from '../features/auth/services/authService'
import * as quoteService from '../services/quoteService'

vi.mock('../features/auth/services/authService', () => ({
  login: vi.fn(),
  getProfile: vi.fn(),
}))

vi.mock('../services/quoteService', () => ({
  getQuotes: vi.fn(),
}))

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
    vi.mocked(quoteService.getQuotes).mockResolvedValue({
      ids: [1, 2],
      entities: {
        1: { id: 1, text: '하루 10분, 평생 습관' },
        2: { id: 2, text: '오늘도 한 문제 완료' },
      },
    })
  })

  it('로그인 폼이 올바르게 렌더링된다', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Two layouts (mobile + desktop) both render 'haru:'
    expect(screen.getAllByText('haru:').length).toBeGreaterThanOrEqual(1)
    // loginId label exists
    expect(screen.getAllByLabelText(/아이디/i)[0]).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /회원가입/i })[0]).toBeInTheDocument()

    // Submit button only visible after typing loginId (aria-hidden when empty)
    await user.type(screen.getAllByLabelText(/아이디/i)[0], 'a')
    expect(screen.getAllByRole('button', { name: /챌린지 시작하기/i })[0]).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText(/하루 10분, 평생 습관/i)[0]).toBeInTheDocument()
    })
  })

  it('아이디 미입력 시 제출 버튼이 표시되지 않는다', () => {
    render(<LoginPage />)
    // Submit button is inside aria-hidden when loginId is empty
    expect(screen.queryByRole('button', { name: /챌린지 시작하기/i })).not.toBeInTheDocument()
  })

  it('비밀번호 미입력 시 에러가 표시된다', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Type loginId to reveal password/submit section
    const loginIdInput = screen.getAllByLabelText(/아이디/i)[0]
    await user.type(loginIdInput, 'testuser')

    const submitButton = screen.getAllByRole('button', { name: /챌린지 시작하기/i })[0]
    await user.click(submitButton)

    await waitFor(() => {
      // Error appears as placeholder text in the password input
      const passwordInputs = screen.getAllByPlaceholderText(/비밀번호를 입력해주세요/i)
      expect(passwordInputs.length).toBeGreaterThan(0)
    })
  })

  it('잘못된 자격증명 시 API 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()

    const apiError = {
      message: '로그인 정보가 올바르지 않습니다',
      code: 'INVALID_CREDENTIALS',
    }
    vi.mocked(authService.login).mockRejectedValueOnce(apiError)

    render(<LoginPage />)

    const loginIdInput = screen.getAllByLabelText(/아이디/i)[0]
    await user.type(loginIdInput, 'wronguser')

    const passwordInput = screen.getAllByLabelText(/비밀번호/i)[0]
    await user.type(passwordInput, 'wrongpass')

    const submitButton = screen.getAllByRole('button', { name: /챌린지 시작하기/i })[0]
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getAllByText(/로그인 정보가 올바르지 않습니다/i)[0]).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 /today로 리다이렉트한다', async () => {
    const user = userEvent.setup()

    const mockTokenResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    }
    const mockProfile = {
      loginId: 'testuser',
      nickname: 'Test User',
      createdAt: '2026-01-01T00:00:00Z',
      memberPreferences: [{ preferenceId: 1, categoryTopicName: 'Spring', difficulty: 'MEDIUM' }],
      role: 'ROLE_MEMBER' as const,
    }

    vi.mocked(authService.login).mockResolvedValueOnce(mockTokenResponse)
    vi.mocked(authService.getProfile).mockResolvedValueOnce(mockProfile)

    render(<LoginPage />)

    const loginIdInput = screen.getAllByLabelText(/아이디/i)[0]
    await user.type(loginIdInput, 'testuser')

    const passwordInput = screen.getAllByLabelText(/비밀번호/i)[0]
    await user.type(passwordInput, 'Password123')

    const submitButton = screen.getAllByRole('button', { name: /챌린지 시작하기/i })[0]
    await user.click(submitButton)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        loginId: 'testuser',
        password: 'Password123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/today')
    })
  })

  it('제출 중에는 버튼이 로딩 상태로 변경된다', async () => {
    const user = userEvent.setup()

    vi.mocked(authService.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<LoginPage />)

    const loginIdInput = screen.getAllByLabelText(/아이디/i)[0]
    await user.type(loginIdInput, 'testuser')

    const passwordInput = screen.getAllByLabelText(/비밀번호/i)[0]
    await user.type(passwordInput, 'Password123')

    const submitButtons = screen.getAllByRole('button', { name: /챌린지 시작하기/i })
    await user.click(submitButtons[0])

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /로그인 중.../i })[0]).toBeInTheDocument()
    })
  })
})
