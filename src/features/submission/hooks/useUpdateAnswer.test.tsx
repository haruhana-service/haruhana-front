import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateAnswer } from './useUpdateAnswer'
import * as submissionService from '../services/submissionService'
import type { SubmissionResponse } from '../../../types/models'

// Mock submissionService
vi.mock('../services/submissionService', () => ({
  updateAnswer: vi.fn(),
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

describe('useUpdateAnswer', () => {
  const mockResponse: SubmissionResponse = {
    submissionId: 1,
    dailyProblemId: 1,
    userAnswer: '수정된 답변입니다. 충분히 긴 답변.',
    submittedAt: '2026-02-10T15:00:00Z',
    isOnTime: true,
    aiAnswer: 'AI 예시 답변입니다.',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('답변 수정 성공 시 응답을 반환한다', async () => {
    vi.mocked(submissionService.updateAnswer).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateAnswer(1), {
      wrapper: createWrapper(),
    })

    result.current.mutate('수정된 답변입니다. 충분히 긴 답변.')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(submissionService.updateAnswer).toHaveBeenCalledWith(1, {
      userAnswer: '수정된 답변입니다. 충분히 긴 답변.',
    })
  })

  it('dailyProblemId가 null이면 에러를 반환한다', async () => {
    const { result } = renderHook(() => useUpdateAnswer(null), {
      wrapper: createWrapper(),
    })

    result.current.mutate('답변입니다.')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('문제 ID가 필요합니다')
    expect(submissionService.updateAnswer).not.toHaveBeenCalled()
  })

  it('API 에러 시 에러 상태를 반환한다', async () => {
    vi.mocked(submissionService.updateAnswer).mockRejectedValue(
      new Error('수정 가능 시간이 지났습니다')
    )

    const { result } = renderHook(() => useUpdateAnswer(1), {
      wrapper: createWrapper(),
    })

    result.current.mutate('수정된 답변입니다. 충분히 긴 답변.')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('수정 가능 시간이 지났습니다')
  })
})
