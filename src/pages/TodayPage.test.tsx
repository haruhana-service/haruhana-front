import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { TodayPage } from './TodayPage'
import * as problemService from '../features/problem/services/problemService'
import * as streakService from '../features/streak/services/streakService'

// Mock problem service
vi.mock('../features/problem/services/problemService', () => ({
  getTodayProblem: vi.fn(),
  getProblemDetail: vi.fn(),
  submitSolution: vi.fn(),
}))

// Mock streak service
vi.mock('../features/streak/services/streakService', () => ({
  getStreak: vi.fn(),
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

describe('TodayPage', () => {
  const mockProblem = {
    id: 1,
    title: 'React Hooks 이해하기',
    description: 'useState와 useEffect의 차이점을 설명하세요.',
    difficulty: 'MEDIUM',
    categoryTopicName: 'React',
    isSolved: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    // 기본 스트릭 모킹
    vi.mocked(streakService.getStreak).mockResolvedValue({
      currentStreak: 5,
      maxStreak: 10,
    })
  })

  it('페이지 헤더가 올바르게 렌더링된다', () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)

    render(<TodayPage />)

    expect(screen.getByText('오늘의 챌린지')).toBeInTheDocument()
    expect(screen.getByText('매일 조금씩, 당신의 성장을 돕습니다')).toBeInTheDocument()
  })

  it('로딩 중에 로딩 스피너를 표시한다', () => {
    // Mock a slow response
    vi.mocked(problemService.getTodayProblem).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockProblem), 1000))
    )

    render(<TodayPage />)

    expect(screen.getByText('Loading Next Goal...')).toBeInTheDocument()
  })

  it('문제 조회 성공 시 문제 카드를 표시한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('React Hooks 이해하기')).toBeInTheDocument()
      expect(screen.getByText('useState와 useEffect의 차이점을 설명하세요.')).toBeInTheDocument()
    })
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    const error = new Error('네트워크 오류가 발생했습니다')
    vi.mocked(problemService.getTodayProblem).mockRejectedValue(error)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('챌린지를 불러올 수 없습니다')).toBeInTheDocument()
    })
  })

  it('해결하지 않은 문제는 "챌린지 시작하기" 버튼을 표시한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /챌린지 시작하기/i })).toBeInTheDocument()
    })
  })

  it('해결한 문제는 "제출 기록 확인" 버튼을 표시한다', async () => {
    const solvedProblem = { ...mockProblem, isSolved: true }
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(solvedProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제출 기록 확인/i })).toBeInTheDocument()
    })
  })

  it('"챌린지 시작하기" 버튼 클릭 시 문제 상세 페이지로 이동한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)
    const user = userEvent.setup()

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /챌린지 시작하기/i })).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /챌린지 시작하기/i })
    await user.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/problem/1')
  })

  it('"제출 기록 확인" 버튼 클릭 시 문제 상세 페이지로 이동한다', async () => {
    const solvedProblem = { ...mockProblem, isSolved: true }
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(solvedProblem)
    const user = userEvent.setup()

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제출 기록 확인/i })).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /제출 기록 확인/i })
    await user.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/problem/1')
  })
})
