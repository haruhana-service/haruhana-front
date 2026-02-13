import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { HistoryPage } from './HistoryPage'
import * as problemService from '../features/problem/services/problemService'
import type { DailyProblemResponse } from '../types/models'

// Mock problem service
vi.mock('../features/problem/services/problemService', () => ({
  getTodayProblem: vi.fn(),
  getProblemDetail: vi.fn(),
  getDailyProblem: vi.fn(),
  submitSolution: vi.fn(),
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

describe('HistoryPage', () => {
  const mockProblem: DailyProblemResponse = {
    id: 1,
    title: 'Spring IoC 설명하기',
    difficulty: 'MEDIUM',
    categoryTopic: 'Spring',
    isSolved: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    // 기본: 모든 날짜에 문제 없음
    vi.mocked(problemService.getDailyProblem).mockRejectedValue(new Error('No problem'))
  })

  it('페이지 헤더가 올바르게 렌더링된다', () => {
    render(<HistoryPage />)

    expect(screen.getByText('나의 기록')).toBeInTheDocument()
    expect(screen.getByText('날짜를 선택하여 문제 확인하세요.')).toBeInTheDocument()
  })

  it('현재 월과 요일 헤더가 표시된다', () => {
    render(<HistoryPage />)

    const now = new Date()
    const monthText = `${now.getFullYear()}년 ${now.getMonth() + 1}월`
    expect(screen.getByText(monthText)).toBeInTheDocument()

    // 요일 헤더
    for (const day of ['일', '월', '화', '수', '목', '금', '토']) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('이전 달 버튼 클릭 시 월이 변경된다', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const now = new Date()
    const currentMonthText = `${now.getFullYear()}년 ${now.getMonth() + 1}월`
    expect(screen.getByText(currentMonthText)).toBeInTheDocument()

    // 이전 달로 이동
    const prevButtons = screen.getAllByRole('button')
    const prevButton = prevButtons.find(btn =>
      btn.querySelector('path[d="M15 19l-7-7 7-7"]')
    )!
    await user.click(prevButton)

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthText = `${prevMonth.getFullYear()}년 ${prevMonth.getMonth() + 1}월`
    expect(screen.getByText(prevMonthText)).toBeInTheDocument()
  })

  it('다음 달 버튼 클릭 시 월이 변경된다', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    const now = new Date()

    const nextButtons = screen.getAllByRole('button')
    const nextButton = nextButtons.find(btn =>
      btn.querySelector('path[d="M9 5l7 7-7 7"]')
    )!
    await user.click(nextButton)

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextMonthText = `${nextMonth.getFullYear()}년 ${nextMonth.getMonth() + 1}월`
    expect(screen.getByText(nextMonthText)).toBeInTheDocument()
  })

  it('날짜 클릭 시 해당 날짜의 문제를 표시한다', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    vi.mocked(problemService.getDailyProblem).mockImplementation(async (date?: string) => {
      if (date === todayStr) return mockProblem
      throw new Error('No problem')
    })

    render(<HistoryPage />)

    // 오늘 날짜가 기본 선택되어 있으므로 문제가 표시되어야 함
    await waitFor(() => {
      expect(screen.getByText('Spring IoC 설명하기')).toBeInTheDocument()
    })
  })

  it('문제가 없는 날짜 선택 시 안내 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })

    // 오늘 날짜의 문제를 선택 해제 (같은 날짜 다시 클릭)
    const todayDate = new Date().getDate().toString()
    const dateButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent === todayDate
    )
    if (dateButtons.length > 0) {
      await user.click(dateButtons[0])
    }

    await waitFor(() => {
      const emptyMsg = screen.queryByText('해당 날짜에 문제가 없습니다.') || screen.queryByText('기록이 없습니다.')
      expect(emptyMsg).toBeInTheDocument()
    })
  })

  it('문제 카드 클릭 시 문제 상세 페이지로 이동한다', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    vi.mocked(problemService.getDailyProblem).mockImplementation(async (date?: string) => {
      if (date === todayStr) return mockProblem
      throw new Error('No problem')
    })

    const user = userEvent.setup()
    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText('Spring IoC 설명하기')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Spring IoC 설명하기'))

    expect(mockNavigate).toHaveBeenCalledWith('/problem/1')
  })

  it('풀이 완료된 문제에 "완료" 표시가 나타난다', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    vi.mocked(problemService.getDailyProblem).mockImplementation(async (date?: string) => {
      if (date === todayStr) return mockProblem
      throw new Error('No problem')
    })

    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText('✓ 완료')).toBeInTheDocument()
    })
  })

  it('미풀이 문제에 "미완료" 표시가 나타난다', async () => {
    const unsolvedProblem: DailyProblemResponse = {
      ...mockProblem,
      isSolved: false,
    }

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    vi.mocked(problemService.getDailyProblem).mockImplementation(async (date?: string) => {
      if (date === todayStr) return unsolvedProblem
      throw new Error('No problem')
    })

    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText('미완료')).toBeInTheDocument()
    })
  })

  it('로딩 중에 로딩 메시지를 표시한다', () => {
    vi.mocked(problemService.getDailyProblem).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    render(<HistoryPage />)

    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })
})
