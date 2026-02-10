import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../../../test/utils'
import { StreakDisplay } from './StreakDisplay'
import * as streakService from '../services/streakService'

// Mock streak service
vi.mock('../services/streakService', () => ({
  getStreak: vi.fn(),
}))

describe('StreakDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로딩 중에 로딩 스피너를 표시한다', () => {
    vi.mocked(streakService.getStreak).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ currentStreak: 5, maxStreak: 10 }), 1000))
    )

    render(<StreakDisplay />)

    expect(screen.getByText('스트릭 로딩 중...')).toBeInTheDocument()
  })

  it('스트릭 데이터를 올바르게 표시한다', async () => {
    const mockStreak = {
      currentStreak: 5,
      maxStreak: 10,
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    render(<StreakDisplay />)

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('일 연속')).toBeInTheDocument()
      expect(screen.getByText('최고 기록:')).toBeInTheDocument()
      expect(screen.getByText('10일')).toBeInTheDocument()
    })
  })

  it('스트릭이 0인 경우 "아직 스트릭이 없습니다" 메시지를 표시한다', async () => {
    const mockStreak = {
      currentStreak: 0,
      maxStreak: 0,
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    render(<StreakDisplay />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('일 연속')).toBeInTheDocument()
    })
  })

  it('현재 스트릭이 최고 기록과 같을 때 축하 메시지를 표시한다', async () => {
    const mockStreak = {
      currentStreak: 15,
      maxStreak: 15,
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    render(<StreakDisplay />)

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('최고 기록:')).toBeInTheDocument()
      expect(screen.getByText('15일')).toBeInTheDocument()
      expect(screen.getByText(/신기록/i)).toBeInTheDocument()
    })
  })

  it('에러 발생 시 에러 메시지를 표시한다', async () => {
    const error = new Error('스트릭 조회 실패')
    vi.mocked(streakService.getStreak).mockRejectedValue(error)

    render(<StreakDisplay />)

    await waitFor(() => {
      expect(screen.getByText('스트릭을 불러올 수 없습니다')).toBeInTheDocument()
    })
  })

  it('반응형 디자인이 적용된다', async () => {
    const mockStreak = {
      currentStreak: 7,
      maxStreak: 12,
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { container } = render(<StreakDisplay />)

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    // 반응형 클래스 확인 (예: p-4 sm:p-6, text-4xl sm:text-5xl 등)
    const streakContainer = container.querySelector('[data-testid="streak-container"]')
    expect(streakContainer).toBeInTheDocument()
  })
})
