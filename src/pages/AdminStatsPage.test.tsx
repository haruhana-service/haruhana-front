import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/utils'
import { AdminStatsPage } from './AdminStatsPage'
import * as adminStatsService from '../services/adminStatsService'

vi.mock('../services/adminStatsService', () => ({
  getStatistics: vi.fn(),
}))

describe('AdminStatsPage', () => {
  const mockStats = {
    totalMemberCount: 1024,
    todayProblemCount: 5,
    todayOnTimeSubmissionCount: 312,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로딩 중에 로딩 스피너를 표시한다', () => {
    vi.mocked(adminStatsService.getStatistics).mockImplementation(
      () => new Promise(() => {})
    )

    render(<AdminStatsPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('통계 데이터를 정상적으로 표시한다', async () => {
    vi.mocked(adminStatsService.getStatistics).mockResolvedValue(mockStats)

    render(<AdminStatsPage />)

    await waitFor(() => {
      expect(screen.getByText('1024')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('312')).toBeInTheDocument()
    })

    expect(screen.getByText('전체 사용자')).toBeInTheDocument()
    expect(screen.getByText('오늘 문제 수')).toBeInTheDocument()
    expect(screen.getByText('오늘 제때 제출')).toBeInTheDocument()
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    vi.mocked(adminStatsService.getStatistics).mockRejectedValue(
      new Error('서버 오류가 발생했습니다')
    )

    render(<AdminStatsPage />)

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument()
    })
  })

  it('"통계" 헤더를 표시한다', async () => {
    vi.mocked(adminStatsService.getStatistics).mockResolvedValue(mockStats)

    render(<AdminStatsPage />)

    await waitFor(() => {
      expect(screen.getByText('통계')).toBeInTheDocument()
    })
  })
})
