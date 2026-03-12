import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { submitAnswer } from '../services/submissionService'
import type { DailyProblemResponse, SubmissionResponse, TodayProblemResponse } from '../../../types/models'

/**
 * 답변 제출 훅
 * 제출 성공 시 todayProblem 및 problemDetail 쿼리를 무효화
 */
export function useSubmitAnswer(dailyProblemId: number | null) {
  const queryClient = useQueryClient()

  return useMutation<SubmissionResponse, Error, string>({
    mutationFn: (userAnswer: string) => {
      if (!dailyProblemId) {
        throw new Error('문제 ID가 필요합니다')
      }
      return submitAnswer(dailyProblemId, { userAnswer })
    },
    onSuccess: () => {
      const todayKey = format(new Date(), 'yyyy-MM-dd')
      queryClient.setQueryData<TodayProblemResponse | undefined>(['todayProblem'], (prev) => {
        if (!prev) return prev
        return { ...prev, isSolved: true }
      })
      queryClient.setQueriesData<Map<string, DailyProblemResponse | null>>(
        { queryKey: ['submission-history'] },
        (prev) => {
          if (!prev) return prev
          const next = new Map(prev)
          const existing = next.get(todayKey)
          if (existing) {
            next.set(todayKey, { ...existing, isSolved: true })
          }
          return next
        }
      )
      // 제출 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['todayProblem'] })
      queryClient.invalidateQueries({ queryKey: ['problemDetail', dailyProblemId] })
      queryClient.invalidateQueries({ queryKey: ['submission-history'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
