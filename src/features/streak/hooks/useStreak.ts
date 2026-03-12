import { useQuery } from '@tanstack/react-query'
import { getStreak } from '../services/streakService'

/**
 * 스트릭 정보를 조회하는 훅
 * currentStreak(현재 스트릭), maxStreak(최대 스트릭)을 반환
 */
interface UseStreakOptions {
  enabled?: boolean
}

export function useStreak(options: UseStreakOptions = {}) {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    enabled,
  })
}
