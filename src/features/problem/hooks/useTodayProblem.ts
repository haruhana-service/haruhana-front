import { useQuery } from '@tanstack/react-query'
import { getTodayProblem } from '../services/problemService'
import { TODAY_PROBLEM_QUERY_KEY } from '../utils/todayProblem'

/**
 * 오늘의 문제를 조회하는 훅
 * React Query를 사용하여 캐싱 및 로딩 상태 관리
 */
interface UseTodayProblemOptions {
  enabled?: boolean
}

export function useTodayProblem(options: UseTodayProblemOptions = {}) {
  const { enabled = true } = options
  return useQuery({
    queryKey: TODAY_PROBLEM_QUERY_KEY,
    queryFn: getTodayProblem,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    retry: 5,
    retryDelay: (attempt) => Math.min(1500 * (attempt + 1), 5000),
    refetchOnWindowFocus: true,
    enabled,
  })
}
