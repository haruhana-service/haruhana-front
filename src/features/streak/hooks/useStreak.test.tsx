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
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { result } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.currentStreak).toBe(0)
    expect(result.current.data?.maxStreak).toBe(15)
  })

  it('staleTime이 설정되어 캐싱된다', async () => {
    const mockStreak = {
      currentStreak: 3,
      maxStreak: 8,
    }

    vi.mocked(streakService.getStreak).mockResolvedValue(mockStreak)

    const { result } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 첫 번째 호출 확인
    expect(streakService.getStreak).toHaveBeenCalledTimes(1)

    // 같은 훅을 다시 렌더링해도 캐시된 데이터 사용 (staleTime 내)
    const { result: result2 } = renderHook(() => useStreak(), { wrapper })

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true)
    })

    // staleTime 내에서는 추가 호출이 없어야 함
    expect(streakService.getStreak).toHaveBeenCalledTimes(1)
    expect(result2.current.data).toEqual(mockStreak)
  })
})
