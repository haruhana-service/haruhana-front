import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { render } from '../test/utils'
import { SignupPage } from './SignupPage'
import * as authService from '../features/auth/services/authService'
import * as categoryService from '../services/categoryService'

vi.mock('../features/auth/services/authService', () => ({
  signup: vi.fn(),
  checkLoginIdAvailability: vi.fn(),
  checkNicknameAvailability: vi.fn(),
}))

vi.mock('../services/categoryService', () => ({
  getCategories: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

window.alert = vi.fn()

describe('SignupPage', () => {
  const mockCategories = {
    categories: [
      {
        id: 1,
        name: '개발',
        groups: [
          {
            id: 1,
            name: '백엔드',
            topics: [
              { id: 1, name: 'Spring' },
              { id: 2, name: 'Node.js' },
            ],
          },
          {
            id: 2,
            name: '프론트엔드',
            topics: [
              { id: 3, name: 'React' },
              { id: 4, name: 'Vue' },
            ],
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.checkLoginIdAvailability).mockResolvedValue(true)
    vi.mocked(authService.checkNicknameAvailability).mockResolvedValue(true)
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)
  })

  // Helper to complete Step 1 (loginId auto-check)
  async function completeStep1(user: ReturnType<typeof userEvent.setup>) {
    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    // Wait for auto-check to complete (400ms debounce)
    await waitFor(() => {
      expect(authService.checkLoginIdAvailability).toHaveBeenCalledWith('testuser')
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(screen.getAllByText(/사용 가능한 아이디입니다/i)[0]).toBeInTheDocument()
    })

    const nextButton = screen.getAllByRole('button', { name: /다음 단계로/i })[0]
    await user.click(nextButton)
  }

  // Helper to complete Step 2 (nickname auto-check)
  async function completeStep2(user: ReturnType<typeof userEvent.setup>) {
    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    const nicknameInput = screen.getByLabelText(/닉네임/i)
    await user.type(nicknameInput, 'Test User')

    // Wait for nickname auto-check
    await waitFor(() => {
      expect(authService.checkNicknameAvailability).toHaveBeenCalledWith('Test User')
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(screen.getAllByText(/사용 가능한 닉네임입니다/i)[0]).toBeInTheDocument()
    })

    const nextButton = screen.getAllByRole('button', { name: /다음 단계로/i })[0]
    await user.click(nextButton)
  }

  it('Step 1: 계정 정보 입력 화면이 올바르게 렌더링된다', async () => {
    render(<SignupPage />)

    expect(screen.getByText(/계정을 만들어주세요/i)).toBeInTheDocument()

    expect(screen.getByLabelText(/^아이디$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument()

    expect(screen.getAllByRole('button', { name: /다음 단계로/i })[0]).toBeInTheDocument()

    // Step 2, 3 fields should not be visible yet
    expect(screen.queryByLabelText(/닉네임/i)).not.toBeInTheDocument()

    expect(screen.getAllByRole('link', { name: /로그인/i })[0]).toBeInTheDocument()
  })

  it('Step 1: 아이디를 입력하면 자동으로 중복 확인이 진행된다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    await user.type(loginIdInput, 'testuser')

    await waitFor(() => {
      expect(authService.checkLoginIdAvailability).toHaveBeenCalledWith('testuser')
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(screen.getAllByText(/사용 가능한 아이디입니다/i)[0]).toBeInTheDocument()
    })
  })

  it('Step 1 완료 후 Step 2로 이동한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await completeStep1(user)

    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    expect(screen.queryByLabelText(/^아이디$/i)).not.toBeInTheDocument()
  })

  it('Step 2에서 이전 단계로 돌아갈 수 있다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    await completeStep1(user)

    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    const prevButton = screen.getAllByRole('button', { name: /이전 단계로/i })[0]
    await user.click(prevButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/^아이디$/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/닉네임/i)).not.toBeInTheDocument()
    })
  })

  it('Step 1: 자동 확인 전에는 다음 단계 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const nextButton = screen.getAllByRole('button', { name: /다음 단계로/i })[0]
    expect(nextButton).toBeDisabled()

    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    // Still disabled before auto-check completes
    expect(nextButton).toBeDisabled()

    // After auto-check completes
    await waitFor(() => {
      expect(nextButton).toBeEnabled()
    }, { timeout: 2000 })
  })

  it('전체 회원가입 플로우를 완료하고 /login으로 리다이렉트한다', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.signup).mockResolvedValueOnce(1)

    render(<SignupPage />)

    // Step 1
    await completeStep1(user)

    // Step 2
    await completeStep2(user)

    // Step 3: 학습 설정
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /분야를 선택하세요/i })[0]).toBeInTheDocument()
    })

    // Select category
    await user.click(screen.getAllByRole('button', { name: /분야를 선택하세요/i })[0])
    const categoryDialog = await screen.findByRole('dialog')
    await user.click(within(categoryDialog).getByRole('button', { name: '개발' }))

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    // Select group
    await user.click(screen.getAllByRole('button', { name: /분류를 선택하세요/i })[0])
    const groupDialog = await screen.findByRole('dialog')
    await user.click(within(groupDialog).getByRole('button', { name: '백엔드' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    // Select topic
    await user.click(screen.getAllByRole('button', { name: /주제를 선택하세요/i })[0])
    const topicDialog = await screen.findByRole('dialog')
    await user.click(within(topicDialog).getByRole('button', { name: 'Spring' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    // Select difficulty
    const mediumButton = screen.getAllByRole('button', { name: /보통/i })[0]
    await user.click(mediumButton)

    // Click final button (opens agreement modal)
    const finalButton = screen.getAllByRole('button', { name: /하루하루 시작하기/i })[0]
    await user.click(finalButton)

    // Agreement modal - check "알겠습니다" and confirm
    await waitFor(() => {
      expect(screen.getByText('우리 함께 약속합시다.')).toBeInTheDocument()
    })

    const agreeCheckbox = screen.getByRole('checkbox')
    await user.click(agreeCheckbox)

    const confirmButtons = screen.getAllByRole('button', { name: /하루하루 시작하기/i })
    // The modal's confirm button (last one or the one inside the modal)
    const modalConfirmButton = confirmButtons[confirmButtons.length - 1]
    await user.click(modalConfirmButton)

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        loginId: 'testuser',
        password: 'Password123',
        nickname: 'Test User',
        categoryTopicId: 1,
        difficulty: 'MEDIUM',
      })
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('회원가입'))
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()

    const apiError = {
      message: '이미 사용 중인 로그인 ID입니다',
      code: 'DUPLICATE_LOGIN_ID',
    }
    vi.mocked(authService.signup).mockRejectedValueOnce(apiError)

    render(<SignupPage />)

    await completeStep1(user)
    await completeStep2(user)

    // Step 3
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /분야를 선택하세요/i })[0]).toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('button', { name: /분야를 선택하세요/i })[0])
    const categoryDialog = await screen.findByRole('dialog')
    await user.click(within(categoryDialog).getByRole('button', { name: '개발' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    await user.click(screen.getAllByRole('button', { name: /분류를 선택하세요/i })[0])
    const groupDialog = await screen.findByRole('dialog')
    await user.click(within(groupDialog).getByRole('button', { name: '백엔드' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    await user.click(screen.getAllByRole('button', { name: /주제를 선택하세요/i })[0])
    const topicDialog = await screen.findByRole('dialog')
    await user.click(within(topicDialog).getByRole('button', { name: 'Spring' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    await user.click(screen.getAllByRole('button', { name: /보통/i })[0])

    const finalButton = screen.getAllByRole('button', { name: /하루하루 시작하기/i })[0]
    await user.click(finalButton)

    await waitFor(() => {
      expect(screen.getByText('우리 함께 약속합시다.')).toBeInTheDocument()
    })

    const agreeCheckbox = screen.getByRole('checkbox')
    await user.click(agreeCheckbox)

    const confirmButtons = screen.getAllByRole('button', { name: /하루하루 시작하기/i })
    await user.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => {
      expect(screen.getAllByText(/이미 사용 중인 로그인 ID입니다/i)[0]).toBeInTheDocument()
    })
  })
})
