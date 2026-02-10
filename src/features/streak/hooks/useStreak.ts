import { useQuery } from '@tanstack/react-query'
import { getStreak } from '../services/streakService'

/**
 * 스트릭 정보를 조회하는 훅
 * currentStreak(현재 스트릭), maxStreak(최대 스트릭)을 반환
 */
export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
  })
}
