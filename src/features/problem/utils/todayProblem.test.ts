import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTodayProblemSolvedStatus, TODAY_PROBLEM_QUERY_KEY } from './todayProblem'

// queryClient와 getTodayProblem을 모킹
vi.mock('../../../services/queryClient', () => ({
  queryClient: {
    fetchQuery: vi.fn(),
  },
}))

vi.mock('../services/problemService', () => ({
  getTodayProblem: vi.fn(),
}))

import { queryClient } from '../../../services/queryClient'

describe('TODAY_PROBLEM_QUERY_KEY', () => {
  it('쿼리 키가 올바르게 정의되어 있다', () => {
    expect(TODAY_PROBLEM_QUERY_KEY).toEqual(['todayProblem'])
  })
})

describe('getTodayProblemSolvedStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('문제를 풀었으면 true를 반환한다', async () => {
    vi.mocked(queryClient.fetchQuery).mockResolvedValue({ isSolved: true })

    const result = await getTodayProblemSolvedStatus()

    expect(result).toBe(true)
  })

  it('문제를 풀지 않았으면 false를 반환한다', async () => {
    vi.mocked(queryClient.fetchQuery).mockResolvedValue({ isSolved: false })

    const result = await getTodayProblemSolvedStatus()

    expect(result).toBe(false)
  })

  it('API 호출 실패 시 null을 반환한다', async () => {
    vi.mocked(queryClient.fetchQuery).mockRejectedValue(new Error('네트워크 오류'))

    const result = await getTodayProblemSolvedStatus()

    expect(result).toBeNull()
  })

  it('fetchQuery를 올바른 쿼리 키로 호출한다', async () => {
    vi.mocked(queryClient.fetchQuery).mockResolvedValue({ isSolved: false })

    await getTodayProblemSolvedStatus()

    expect(queryClient.fetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: TODAY_PROBLEM_QUERY_KEY,
        staleTime: 0,
      })
    )
  })
})
