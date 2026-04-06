import { queryClient } from '../../../services/queryClient'
import { getTodayProblem } from '../services/problemService'


export const TODAY_PROBLEM_QUERY_KEY = ['todayProblem'] as const

export async function getTodayProblemSolvedStatus(): Promise<boolean | null> {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: TODAY_PROBLEM_QUERY_KEY,
      queryFn: getTodayProblem,
      staleTime: 0,
    })
    // 모든 문제가 풀렸는지 확인
    return data.length > 0 ? data.every(p => p.isSolved) : null
  } catch {
    return null
  }
}
