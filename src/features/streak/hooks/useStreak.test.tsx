import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useStreak } from './useStreak'
import * as streakService from '../services/streakService'

// Mock streak service
vi.mock('../services/streakService', () => ({
  getStreak: vi.fn(),
}))

describe('useStreak', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('스트릭 데이터를 성공적으로 조회한다', async () => {
    const mockStreak = {
      currentStreak: 5,
      maxStreak: 10,
      weeklySolvedStatus: [
        { date: '2025-01-06', isSolved: true },
        { date: '2025-01-07', isSolved: true },
        { date: '2025-01-08', isSolved: true },
        { date: '2025-01-09', isSolved: true },
        { date: '2025-01-10', isSolved: true },
        { date: '2025-01-11', isSolved: false },
        { date: '2025-01-12', isSolved: false },
      ],
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { result } = renderHook(() => useStreak(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockStreak)
    expect(result.current.data?.currentStreak).toBe(5)
    expect(result.current.data?.maxStreak).toBe(10)
  })

  it('API 에러 발생 시 에러 상태를 반환한다', async () => {
    const error = new Error('스트릭 조회 실패')
    vi.mocked(streakService.getStreak).mockRejectedValue(error)

    const { result } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })

  it('스트릭이 0인 경우도 정상 처리한다', async () => {
    const mockStreak = {
      currentStreak: 0,
      maxStreak: 15,
      weeklySolvedStatus: [
        { date: '2025-01-06', isSolved: false },
        { date: '2025-01-07', isSolved: false },
        { date: '2025-01-08', isSolved: false },
        { date: '2025-01-09', isSolved: false },
        { date: '2025-01-10', isSolved: false },
        { date: '2025-01-11', isSolved: false },
        { date: '2025-01-12', isSolved: false },
      ],
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { result } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.currentStreak).toBe(0)
    expect(result.current.data?.maxStreak).toBe(15)
  })

  it('항상 최신 데이터를 가져온다 (staleTime: 0, refetchOnMount: always)', async () => {
    const mockStreak = {
      currentStreak: 3,
      maxStreak: 8,
      weeklySolvedStatus: [
        { date: '2025-01-06', isSolved: true },
        { date: '2025-01-07', isSolved: true },
        { date: '2025-01-08', isSolved: true },
        { date: '2025-01-09', isSolved: false },
        { date: '2025-01-10', isSolved: false },
        { date: '2025-01-11', isSolved: false },
        { date: '2025-01-12', isSolved: false },
      ],
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { result } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(streakService.getStreak).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(mockStreak)
  })
})
