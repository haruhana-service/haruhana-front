import { useQuery } from '@tanstack/react-query'
import { getTodayProblem } from '../services/problemService'

/**
 * 오늘의 문제를 조회하는 훅
 * React Query를 사용하여 캐싱 및 로딩 상태 관리
 */
export function useTodayProblem() {
  return useQuery({
    queryKey: ['todayProblem'],
    queryFn: getTodayProblem,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    // retry는 QueryClient 기본 설정 사용 (테스트: false, 프로덕션: 3)
  })
}
