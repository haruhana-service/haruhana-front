import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAnswer } from '../services/submissionService'
import type { SubmissionResponse } from '../../../types/models'

/**
 * 답변 수정 훅
 *
 * 같은 날(23:59 이전)에만 수정 가능
 * 수정 성공 시 todayProblem 및 problemDetail 쿼리를 무효화
 */
export function useUpdateAnswer(dailyProblemId: number | null) {
  const queryClient = useQueryClient()

  return useMutation<SubmissionResponse, Error, string>({
    mutationFn: (userAnswer: string) => {
      if (!dailyProblemId) {
        throw new Error('문제 ID가 필요합니다')
      }
      return updateAnswer(dailyProblemId, { userAnswer })
    },
    onSuccess: () => {
      // 수정 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['todayProblem'] })
      queryClient.invalidateQueries({ queryKey: ['problemDetail', dailyProblemId] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}
