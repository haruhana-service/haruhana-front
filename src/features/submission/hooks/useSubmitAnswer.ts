import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitAnswer } from '../services/submissionService'
import type { SubmissionResponse } from '../../../types/models'

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
      // 제출 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['todayProblem'] })
      queryClient.invalidateQueries({ queryKey: ['problemDetail', dailyProblemId] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
