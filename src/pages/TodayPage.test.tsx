import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/utils'
import { TodayPage } from './TodayPage'
import * as problemService from '../features/problem/services/problemService'

// Mock problem service
vi.mock('../features/problem/services/problemService', () => ({
  getTodayProblem: vi.fn(),
}))

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
  })

  it('페이지 헤더가 올바르게 렌더링된다', () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)

    render(<TodayPage />)

    expect(screen.getByText('오늘의 문제')).toBeInTheDocument()
    expect(screen.getByText('하루 딱 1문제, 가볍게 시작해보세요')).toBeInTheDocument()
  })

  it('로딩 중에 로딩 스피너를 표시한다', () => {
    // Mock a slow response
    vi.mocked(problemService.getTodayProblem).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockProblem), 1000))
    )

    render(<TodayPage />)

    expect(screen.getByText('오늘의 문제를 불러오는 중...')).toBeInTheDocument()
  })

  it('문제 조회 성공 시 문제 카드를 표시한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('React Hooks 이해하기')).toBeInTheDocument()
      expect(screen.getByText('useState와 useEffect의 차이점을 설명하세요.')).toBeInTheDocument()
      expect(screen.getByText('난이도: 보통')).toBeInTheDocument()
      expect(screen.getByText('주제: React')).toBeInTheDocument()
    })
  })

  it('해결 완료된 문제는 완료 배지를 표시한다', async () => {
    const solvedProblem = { ...mockProblem, isSolved: true }
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(solvedProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('✓ 해결 완료')).toBeInTheDocument()
    })
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    const error = new Error('네트워크 오류가 발생했습니다')
    vi.mocked(problemService.getTodayProblem).mockRejectedValue(error)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('문제를 불러올 수 없습니다')).toBeInTheDocument()
      expect(screen.getByText('네트워크 오류가 발생했습니다')).toBeInTheDocument()
    })
  })

  it('난이도 라벨이 한글로 표시된다', async () => {
    const easyProblem = { ...mockProblem, difficulty: 'EASY' }
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(easyProblem)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('난이도: 쉬움')).toBeInTheDocument()
    })
  })
})
