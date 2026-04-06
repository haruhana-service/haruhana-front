import { useQuery } from '@tanstack/react-query'
import { getTodayProblem } from '../services/problemService'
import { TODAY_PROBLEM_QUERY_KEY } from '../utils/todayProblem'

/**
 * 오늘의 문제를 조회하는 훅
 * React Query를 사용하여 캐싱 및 로딩 상태 관리
 */
interface UseTodayProblemOptions {
  enabled?: boolean
  retry?: number | boolean
  retryDelay?: number | ((attempt: number) => number)
}

export function useTodayProblem(options: UseTodayProblemOptions = {}) {
  const {
    enabled = true,
    retry = 5,
    retryDelay = (attempt) => Math.min(1500 * (attempt + 1), 5000),
  } = options

  const queryFn = async () => {
    const problems = await getTodayProblem()

    // 200 응답이어도 빈 배열이면 아직 생성이 지연된 상태로 간주하고 재시도한다.
    if (!Array.isArray(problems) || problems.length === 0) {
      throw new Error('EMPTY_TODAY_PROBLEM')
    }

    return problems
  }

  return useQuery({
    queryKey: TODAY_PROBLEM_QUERY_KEY,
    queryFn,
    staleTime: 0, // 항상 stale 처리 (자정 경계에서 오래된 데이터 방지)
    retry,
    retryDelay,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always', // 백그라운드 복귀 시 항상 최신 데이터 가져오기
    enabled,
  })
}
