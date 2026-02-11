import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProblemDetail } from './useProblemDetail'
import * as problemService from '../services/problemService'
import type { DailyProblemDetailResponse } from '../../../types/models'

// Mock problem service
vi.mock('../services/problemService', () => ({
  getProblemDetail: vi.fn(),
}))

describe('useProblemDetail', () => {
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

  const mockProblemDetail: DailyProblemDetailResponse = {
    id: 1,
    difficulty: 'MEDIUM',
    categoryTopic: 'Spring',
    assignedAt: '2026-02-10T00:00:00Z',
    title: 'Spring의 IoC란 무엇인가요?',
    description: 'Spring Framework의 핵심 개념인 IoC에 대해 설명해주세요.',
    userAnswer: '제어의 역전은...',
    submittedAt: '2026-02-10T14:30:00Z',
    aiAnswer: 'IoC(Inversion of Control)는...',
  }

  it('문제 상세 정보를 성공적으로 조회한다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockProblemDetail)
  })

  it('사용자 답변이 있는 경우 userAnswer를 포함한다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.userAnswer).toBe('제어의 역전은...')
    expect(result.current.data?.submittedAt).toBe('2026-02-10T14:30:00Z')
  })

  it('사용자 답변이 없는 경우 userAnswer가 null이다', async () => {
    const unsolvedProblem: DailyProblemDetailResponse = {
      ...mockProblemDetail,
      userAnswer: null,
      submittedAt: null,
      aiAnswer: null,
    }

    vi.mocked(problemService.getProblemDetail).mockResolvedValue(unsolvedProblem)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.userAnswer).toBeNull()
    expect(result.current.data?.submittedAt).toBeNull()
    expect(result.current.data?.aiAnswer).toBeNull()
  })

  it('AI 답변을 포함한다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.aiAnswer).toBe('IoC(Inversion of Control)는...')
  })

  it('problemId가 null인 경우 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useProblemDetail(null), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(vi.mocked(problemService.getProblemDetail)).not.toHaveBeenCalled()
  })

  it('problemId가 변경되면 새로운 데이터를 가져온다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result, rerender } = renderHook(
      ({ id }) => useProblemDetail(id),
      {
        wrapper,
        initialProps: { id: 1 },
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.id).toBe(1)

    // 다른 문제로 변경
    const newProblem: DailyProblemDetailResponse = {
      ...mockProblemDetail,
      id: 2,
      title: '다른 문제',
    }
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(newProblem)

    rerender({ id: 2 })

    await waitFor(() => {
      expect(result.current.data?.id).toBe(2)
    })

    expect(result.current.data?.title).toBe('다른 문제')
  })

  it('API 에러 시 에러 상태를 반환한다', async () => {
    const error = new Error('문제를 찾을 수 없습니다')
    vi.mocked(problemService.getProblemDetail).mockRejectedValue(error)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('할당 날짜와 제출 날짜 정보를 포함한다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.assignedAt).toBe('2026-02-10T00:00:00Z')
    expect(result.current.data?.submittedAt).toBe('2026-02-10T14:30:00Z')
  })

  it('난이도와 카테고리 정보를 포함한다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.difficulty).toBe('MEDIUM')
    expect(result.current.data?.categoryTopic).toBe('Spring')
  })

  it('캐싱을 통해 같은 문제 조회 시 API 호출을 줄인다', async () => {
    vi.mocked(problemService.getProblemDetail).mockResolvedValue(mockProblemDetail)

    const { result, rerender } = renderHook(() => useProblemDetail(1), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCallCount = vi.mocked(problemService.getProblemDetail).mock.calls.length

    // 리렌더링
    rerender()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // API 호출 횟수가 증가하지 않아야 함 (캐싱)
    const secondCallCount = vi.mocked(problemService.getProblemDetail).mock.calls.length
    expect(secondCallCount).toBe(firstCallCount)
  })
})
