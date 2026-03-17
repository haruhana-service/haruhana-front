import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, min } from 'date-fns'
import { getDailyProblem } from '../../problem/services/problemService'
import type { DailyProblemResponse } from '../../../types/models'

/**
 * 특정 월의 제출 기록을 조회하는 훅
 * @param month - 조회할 월 (Date 객체)
 */
export function useSubmissionHistory(month: Date) {
  return useQuery({
    queryKey: ['submission-history', format(month, 'yyyy-MM')],
    queryFn: async () => {
      const start = startOfMonth(month)
      // 미래 날짜는 요청하지 않음 (불필요한 실패 요청 방지)
      const end = min([endOfMonth(month), new Date()])
      const days = eachDayOfInterval({ start, end })

      // 각 날짜별로 문제 조회 (병렬로 처리)
      const promises = days.map(async (day) => {
        try {
          const dateStr = format(day, 'yyyy-MM-dd')
          const problem = await getDailyProblem(dateStr)
          return { date: dateStr, problem }
        } catch {
          // 해당 날짜에 문제가 없으면 null 반환
          return { date: format(day, 'yyyy-MM-dd'), problem: null }
        }
      })

      const results = await Promise.all(promises)

      // Map으로 변환하여 날짜별 빠른 조회 가능하도록
      const problemsMap = new Map<string, DailyProblemResponse | null>()
      results.forEach(({ date, problem }) => {
        problemsMap.set(date, problem)
      })

      return problemsMap
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}
