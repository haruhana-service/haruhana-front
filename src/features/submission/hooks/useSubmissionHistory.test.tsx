import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSubmissionHistory } from './useSubmissionHistory'
import * as problemService from '../../problem/services/problemService'
import type { DailyProblemResponse } from '../../../types/models'

// Mock problem service
vi.mock('../../problem/services/problemService', () => ({
  getDailyProblem: vi.fn(),
}))

describe('useSubmissionHistory', () => {
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

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const mockProblem: DailyProblemResponse = {
    id: 1,
    difficulty: 'MEDIUM',
    categoryTopic: 'Spring',
    title: '테스트 문제',
    isSolved: true,
  }

  it('특정 월의 모든 날짜에 대한 문제를 조회한다', async () => {
    // 2026년 2월 (28일까지)
    const testMonth = new Date(2026, 1, 1) // 2월은 인덱스 1
    
    vi.mocked(problemService.getDailyProblem).mockResolvedValue(mockProblem)

    const { result } = renderHook(() => useSubmissionHistory(testMonth), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 2월은 28일까지 (2026년은 평년)
    expect(result.current.data?.size).toBe(28)
    
    // 각 날짜에 대해 문제 데이터가 있는지 확인
    const firstDate = '2026-02-01'
    expect(result.current.data?.has(firstDate)).toBe(true)
    expect(result.current.data?.get(firstDate)).toEqual(mockProblem)
  })

  it('문제가 없는 날짜는 null로 처리한다', async () => {
    const testMonth = new Date(2026, 1, 1)
    
    // 일부 날짜는 성공, 일부는 에러
    vi.mocked(problemService.getDailyProblem).mockImplementation((date?: string) => {
      if (date === '2026-02-01') {
        return Promise.resolve(mockProblem)
      }
      return Promise.reject(new Error('문제 없음'))
    })

    const { result } = renderHook(() => useSubmissionHistory(testMonth), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 2월 1일은 문제 있음
    expect(result.current.data?.get('2026-02-01')).toEqual(mockProblem)
    
    // 2월 2일은 문제 없음 (null)
    expect(result.current.data?.get('2026-02-02')).toBeNull()
  })

  it('풀이 완료 여부를 정확히 반영한다', async () => {
    const testMonth = new Date(2026, 1, 1)
    
    const solvedProblem: DailyProblemResponse = {
      ...mockProblem,
      isSolved: true,
    }
    
    const unsolvedProblem: DailyProblemResponse = {
      ...mockProblem,
      id: 2,
      isSolved: false,
    }

    vi.mocked(problemService.getDailyProblem).mockImplementation((date?: string) => {
      if (date === '2026-02-01') {
        return Promise.resolve(solvedProblem)
      }
      if (date === '2026-02-02') {
        return Promise.resolve(unsolvedProblem)
      }
      return Promise.reject(new Error('문제 없음'))
    })

    const { result } = renderHook(() => useSubmissionHistory(testMonth), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 풀이 완료
    expect(result.current.data?.get('2026-02-01')?.isSolved).toBe(true)
    
    // 미완료
    expect(result.current.data?.get('2026-02-02')?.isSolved).toBe(false)
  })

  it('캐싱을 통해 같은 월 조회 시 API 호출을 줄인다', async () => {
    const testMonth = new Date(2026, 1, 1)
    
    vi.mocked(problemService.getDailyProblem).mockResolvedValue(mockProblem)

    const { result, rerender } = renderHook(() => useSubmissionHistory(testMonth), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCallCount = vi.mocked(problemService.getDailyProblem).mock.calls.length

    // 같은 월로 리렌더
    rerender()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // API 호출 횟수가 증가하지 않아야 함 (캐싱)
    const secondCallCount = vi.mocked(problemService.getDailyProblem).mock.calls.length
    expect(secondCallCount).toBe(firstCallCount)
  })

  it('다른 월 조회 시 새로운 데이터를 가져온다', async () => {
    const februaryMonth = new Date(2026, 1, 1)
    const marchMonth = new Date(2026, 2, 1)
    
    vi.mocked(problemService.getDailyProblem).mockResolvedValue(mockProblem)

    const { result, rerender } = renderHook(
      ({ month }) => useSubmissionHistory(month),
      { 
        wrapper,
        initialProps: { month: februaryMonth }
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 2월 데이터 확인
    expect(result.current.data?.size).toBe(28)

    // 3월로 변경
    rerender({ month: marchMonth })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // 3월 데이터 확인 (31일)
    expect(result.current.data?.size).toBe(31)
  })
})
