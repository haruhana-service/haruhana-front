import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubmitAnswer } from './useSubmitAnswer'
import * as submissionService from '../services/submissionService'
import type { SubmissionResponse } from '../../../types/models'

// Mock submissionService
vi.mock('../services/submissionService', () => ({
  submitAnswer: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useSubmitAnswer', () => {
  const mockResponse: SubmissionResponse = {
    submissionId: 1,
    dailyProblemId: 1,
    userAnswer: '이것은 충분히 긴 테스트 답변입니다.',
    submittedAt: '2026-02-10T14:30:00Z',
    isOnTime: true,
    aiAnswer: 'AI가 생성한 예시 답변입니다.',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('답변 제출 성공 시 응답을 반환한다', async () => {
    vi.mocked(submissionService.submitAnswer).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useSubmitAnswer(1), {
      wrapper: createWrapper(),
    })

    result.current.mutate('이것은 충분히 긴 테스트 답변입니다.')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(submissionService.submitAnswer).toHaveBeenCalledWith(1, {
      userAnswer: '이것은 충분히 긴 테스트 답변입니다.',
    })
  })

  it('dailyProblemId가 null이면 에러를 반환한다', async () => {
    const { result } = renderHook(() => useSubmitAnswer(null), {
      wrapper: createWrapper(),
    })

    result.current.mutate('답변입니다.')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('문제 ID가 필요합니다')
    expect(submissionService.submitAnswer).not.toHaveBeenCalled()
  })

  it('API 에러 시 에러 상태를 반환한다', async () => {
    vi.mocked(submissionService.submitAnswer).mockRejectedValue(
      new Error('서버 오류가 발생했습니다')
    )

    const { result } = renderHook(() => useSubmitAnswer(1), {
      wrapper: createWrapper(),
    })

    result.current.mutate('이것은 충분히 긴 테스트 답변입니다.')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('서버 오류가 발생했습니다')
  })
})
