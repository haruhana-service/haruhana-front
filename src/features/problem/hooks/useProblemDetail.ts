import { useQuery } from '@tanstack/react-query'
import { getProblemDetail } from '../services/problemService'

/**
 * 문제 상세 정보를 조회하는 훅
 * 기존 답변(userAnswer)을 포함한 상세 정보를 가져옴
 */
export function useProblemDetail(dailyProblemId: number | null) {
  return useQuery({
    queryKey: ['problemDetail', dailyProblemId],
    queryFn: () => {
      if (!dailyProblemId) {
        throw new Error('Problem ID is required')
      }
      return getProblemDetail(dailyProblemId)
    },
    enabled: !!dailyProblemId, // dailyProblemId가 있을 때만 쿼리 실행
    staleTime: 0, // 항상 최신 데이터 보장 (제출 상태 변경 반영)
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}
