import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { SignupPage } from './SignupPage'
import * as authService from '../features/auth/services/authService'
import * as categoryService from '../services/categoryService'

// Mock services
vi.mock('../features/auth/services/authService', () => ({
  signup: vi.fn(),
}))

vi.mock('../services/categoryService', () => ({
  getCategories: vi.fn(),
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

// Mock alert
global.alert = vi.fn()

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
    // Mock successful category fetch
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)
  })

  it('회원가입 폼이 올바르게 렌더링된다', async () => {
    render(<SignupPage />)

    expect(screen.getByRole('heading', { name: /회원가입/i })).toBeInTheDocument()

    // 계정 정보 필드들
    expect(screen.getByLabelText(/로그인 ID/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/비밀번호/i)).toHaveLength(2) // 비밀번호 + 비밀번호 확인
    expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()

    // 학습 설정
    expect(screen.getByText(/학습 설정/i)).toBeInTheDocument()
    expect(screen.getByText(/난이도 선택/i)).toBeInTheDocument()
    expect(screen.getByText(/카테고리 선택/i)).toBeInTheDocument()

    // 제출 버튼
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeInTheDocument()

    // 로그인 링크
    expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument()
  })

  it('로그인 ID 미입력 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/로그인 ID를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('비밀번호 불일치 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const loginIdInput = screen.getByLabelText(/로그인 ID/i)
    const [passwordInput, passwordConfirmInput] = screen.getAllByLabelText(/비밀번호/i)
    const nicknameInput = screen.getByLabelText(/닉네임/i)
    const submitButton = screen.getByRole('button', { name: /회원가입/i })

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'DifferentPassword123')
    await user.type(nicknameInput, 'Test User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument()
    })
  })

  it('난이도 미선택 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const loginIdInput = screen.getByLabelText(/로그인 ID/i)
    const [passwordInput, passwordConfirmInput] = screen.getAllByLabelText(/비밀번호/i)
    const nicknameInput = screen.getByLabelText(/닉네임/i)
    const submitButton = screen.getByRole('button', { name: /회원가입/i })

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')
    await user.type(nicknameInput, 'Test User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/난이도를 선택해주세요/i)).toBeInTheDocument()
    })
  })

  it('회원가입 성공 시 /login으로 리다이렉트한다', async () => {
    const user = userEvent.setup()

    // Mock successful signup
    vi.mocked(authService.signup).mockResolvedValueOnce(1)

    render(<SignupPage />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /1. 분야/i })).toBeInTheDocument()
    })

    // Fill in account info
    const loginIdInput = screen.getByLabelText(/로그인 ID/i)
    const [passwordInput, passwordConfirmInput] = screen.getAllByLabelText(/비밀번호/i)
    const nicknameInput = screen.getByLabelText(/닉네임/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')
    await user.type(nicknameInput, 'Test User')

    // Select category (Category → Group → Topic)
    const categorySelect = screen.getByRole('combobox', { name: /1. 분야/i })
    await user.selectOptions(categorySelect, '1') // 개발

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /2. 분류/i })).toBeEnabled()
    })

    const groupSelect = screen.getByRole('combobox', { name: /2. 분류/i })
    await user.selectOptions(groupSelect, '1') // 백엔드

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /3. 주제/i })).toBeEnabled()
    })

    const topicSelect = screen.getByRole('combobox', { name: /3. 주제/i })
    await user.selectOptions(topicSelect, '1') // Spring

    // Select difficulty (한글 표시)
    const mediumButton = screen.getByRole('button', { name: /보통/i })
    await user.click(mediumButton)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        loginId: 'testuser',
        password: 'Password123',
        nickname: 'Test User',
        categoryTopicId: 1,
        difficulty: 'MEDIUM',
      })
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('회원가입'))
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()

    // Mock signup error
    const apiError = {
      message: '이미 사용 중인 로그인 ID입니다',
      code: 'DUPLICATE_LOGIN_ID',
    }
    vi.mocked(authService.signup).mockRejectedValueOnce(apiError)

    render(<SignupPage />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /1. 분야/i })).toBeInTheDocument()
    })

    // Fill in all fields
    const loginIdInput = screen.getByLabelText(/로그인 ID/i)
    const [passwordInput, passwordConfirmInput] = screen.getAllByLabelText(/비밀번호/i)
    const nicknameInput = screen.getByLabelText(/닉네임/i)

    await user.type(loginIdInput, 'duplicateuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')
    await user.type(nicknameInput, 'Test User')

    // Select category
    const categorySelect = screen.getByRole('combobox', { name: /1. 분야/i })
    await user.selectOptions(categorySelect, '1')

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /2. 분류/i })).toBeEnabled()
    })

    const groupSelect = screen.getByRole('combobox', { name: /2. 분류/i })
    await user.selectOptions(groupSelect, '1')

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /3. 주제/i })).toBeEnabled()
    })

    const topicSelect = screen.getByRole('combobox', { name: /3. 주제/i })
    await user.selectOptions(topicSelect, '1')

    // Select difficulty (한글 표시)
    const mediumButton = screen.getByRole('button', { name: /보통/i })
    await user.click(mediumButton)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/이미 사용 중인 로그인 ID입니다/i)).toBeInTheDocument()
    })
  })
})
