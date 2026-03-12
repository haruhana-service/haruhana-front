import { queryClient } from '../../../services/queryClient'
import { getTodayProblem } from '../services/problemService'
import type { TodayProblemResponse } from '../../../types/models'

export const TODAY_PROBLEM_QUERY_KEY = ['todayProblem'] as const

export async function getTodayProblemSolvedStatus(): Promise<boolean | null> {
  const cached = queryClient.getQueryData<TodayProblemResponse>(TODAY_PROBLEM_QUERY_KEY)
  if (cached) return cached.isSolved

  try {
    const data = await queryClient.fetchQuery({
      queryKey: TODAY_PROBLEM_QUERY_KEY,
      queryFn: getTodayProblem,
    })
    return data.isSolved
  } catch {
    return null
  }
}
