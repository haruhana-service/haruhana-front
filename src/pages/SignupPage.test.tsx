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
    // Mock successful category fetch
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)
  })

  it('Step 1: 계정 정보 입력 화면이 올바르게 렌더링된다', async () => {
    render(<SignupPage />)

    expect(screen.getByText(/계정을 만들어주세요/i)).toBeInTheDocument()

    // Step 1 필드들만 보여야 함
    expect(screen.getByLabelText(/^아이디$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument()

    // 다음 단계 버튼
    expect(screen.getByRole('button', { name: /다음 단계로/i })).toBeInTheDocument()

    // Step 2, 3 필드들은 아직 보이지 않아야 함
    expect(screen.queryByLabelText(/닉네임/i)).not.toBeInTheDocument()

    // 로그인 링크
    expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument()
  })

  it('Step 1: 로그인 ID 미입력 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    const nextButton = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/로그인 ID를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('Step 1 완료 후 Step 2로 이동한다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Step 1 입력
    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    // 다음 단계로 이동
    const nextButton = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton)

    // Step 2 화면 확인
    await waitFor(() => {
      expect(screen.getByText(/프로필을/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    // Step 1 필드들은 더 이상 보이지 않아야 함
    expect(screen.queryByLabelText(/^아이디$/i)).not.toBeInTheDocument()
  })

  it('Step 2에서 이전 단계로 돌아갈 수 있다', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)

    // Step 1 완료
    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    const nextButton = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton)

    // Step 2 확인
    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    // 이전 단계로 버튼 클릭
    const prevButton = screen.getByRole('button', { name: /이전 단계로/i })
    await user.click(prevButton)

    // Step 1로 돌아왔는지 확인
    await waitFor(() => {
      expect(screen.getByLabelText(/^아이디$/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/닉네임/i)).not.toBeInTheDocument()
    })
  })

  it('전체 회원가입 플로우를 완료하고 /login으로 리다이렉트한다', async () => {
    const user = userEvent.setup()

    // Mock successful signup
    vi.mocked(authService.signup).mockResolvedValueOnce(1)

    render(<SignupPage />)

    // Step 1: 계정 정보
    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    const nextButton1 = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton1)

    // Step 2: 프로필 설정
    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    const nicknameInput = screen.getByLabelText(/닉네임/i)
    await user.type(nicknameInput, 'Test User')

    const nextButton2 = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton2)

    // Step 3: 학습 설정
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /1. 분야/i })).toBeInTheDocument()
    })

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /1. 분야/i })).toBeInTheDocument()
    })

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
    const submitButton = screen.getByRole('button', { name: /하루하루 시작하기/i })
    await user.click(submitButton)

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

    // Mock signup error
    const apiError = {
      message: '이미 사용 중인 로그인 ID입니다',
      code: 'DUPLICATE_LOGIN_ID',
    }
    vi.mocked(authService.signup).mockRejectedValueOnce(apiError)

    render(<SignupPage />)

    // Step 1: 계정 정보
    const loginIdInput = screen.getByLabelText(/^아이디$/i)
    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/i)

    await user.type(loginIdInput, 'duplicateuser')
    await user.type(passwordInput, 'Password123')
    await user.type(passwordConfirmInput, 'Password123')

    const nextButton1 = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton1)

    // Step 2: 프로필 설정
    await waitFor(() => {
      expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
    })

    const nicknameInput = screen.getByLabelText(/닉네임/i)
    await user.type(nicknameInput, 'Test User')

    const nextButton2 = screen.getByRole('button', { name: /다음 단계로/i })
    await user.click(nextButton2)

    // Step 3: 학습 설정
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /1. 분야/i })).toBeInTheDocument()
    })

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
    const submitButton = screen.getByRole('button', { name: /하루하루 시작하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/이미 사용 중인 로그인 ID입니다/i)).toBeInTheDocument()
    })
  })
})
