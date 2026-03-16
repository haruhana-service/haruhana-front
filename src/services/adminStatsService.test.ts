import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AdminStatisticsResponse } from './adminStatsService'

const mockGet = vi.fn()

vi.mock('./api', () => ({
  default: {
    get: mockGet,
  },
}))

describe('getStatistics', () => {
  const mockStats: AdminStatisticsResponse = {
    totalMemberCount: 1024,
    todayProblemCount: 5,
    todayOnTimeSubmissionCount: 312,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /v1/admin/statistics를 호출하고 data를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { data: mockStats } })

    const { getStatistics } = await import('./adminStatsService')
    const result = await getStatistics()

    expect(mockGet).toHaveBeenCalledWith('/v1/admin/statistics')
    expect(result).toEqual(mockStats)
  })

  it('API 오류 시 에러를 그대로 던진다', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'))

    const { getStatistics } = await import('./adminStatsService')

    await expect(getStatistics()).rejects.toThrow('Network Error')
  })
})
