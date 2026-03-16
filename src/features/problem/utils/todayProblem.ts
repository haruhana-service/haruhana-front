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
    return data.isSolved
  } catch {
    return null
  }
}
