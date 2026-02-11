import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTodayProblem } from './useTodayProblem'
import * as problemService from '../services/problemService'
import type { TodayProblemResponse } from '../../../types/models'

// Mock problem service
vi.mock('../services/problemService', () => ({
  getTodayProblem: vi.fn(),
}))

describe('useTodayProblem', () => {
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

  const mockTodayProblem: TodayProblemResponse = {
    id: 1,
    title: 'Spring의 IoC란 무엇인가요?',
    description: 'Spring Framework의 핵심 개념인 IoC에 대해 설명해주세요.',
    difficulty: 'MEDIUM',
    categoryTopicName: 'Spring',
    isSolved: false,
  }

  it('오늘의 문제를 성공적으로 조회한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockTodayProblem)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockTodayProblem)
    expect(result.current.error).toBeNull()
  })

  it('풀이 완료 여부를 정확히 반영한다', async () => {
    const solvedProblem: TodayProblemResponse = {
      ...mockTodayProblem,
      isSolved: true,
    }

    vi.mocked(problemService.getTodayProblem).mockResolvedValue(solvedProblem)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.isSolved).toBe(true)
  })

  it('API 에러 시 에러 상태를 반환한다', async () => {
    const error = new Error('문제를 불러올 수 없습니다')
    vi.mocked(problemService.getTodayProblem).mockRejectedValue(error)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('난이도별로 다른 문제를 반환한다', async () => {
    const easyProblem: TodayProblemResponse = {
      ...mockTodayProblem,
      difficulty: 'EASY',
      title: '쉬운 문제',
    }

    vi.mocked(problemService.getTodayProblem).mockResolvedValue(easyProblem)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.difficulty).toBe('EASY')
    expect(result.current.data?.title).toBe('쉬운 문제')
  })

  it('캐싱을 통해 중복 API 호출을 방지한다', async () => {
    vi.mocked(problemService.getTodayProblem).mockResolvedValue(mockTodayProblem)

    const { result, rerender } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCallCount = vi.mocked(problemService.getTodayProblem).mock.calls.length

    // 리렌더링
    rerender()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // API 호출 횟수가 증가하지 않아야 함 (캐싱)
    const secondCallCount = vi.mocked(problemService.getTodayProblem).mock.calls.length
    expect(secondCallCount).toBe(firstCallCount)
  })

  it('문제가 없는 경우를 처리한다', async () => {
    const error = new Error('오늘 할당된 문제가 없습니다')
    vi.mocked(problemService.getTodayProblem).mockRejectedValue(error)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('카테고리 주제 정보를 포함한다', async () => {
    const problemWithTopic: TodayProblemResponse = {
      ...mockTodayProblem,
      categoryTopicName: 'React Hooks',
    }

    vi.mocked(problemService.getTodayProblem).mockResolvedValue(problemWithTopic)

    const { result } = renderHook(() => useTodayProblem(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.categoryTopicName).toBe('React Hooks')
  })
})
