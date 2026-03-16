import { useQuery } from '@tanstack/react-query'
import * as adminStatsService from '../services/adminStatsService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

// ============================================
// Admin Statistics Page
// ============================================

export function AdminStatsPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: () => adminStatsService.getStatistics(),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : '오류가 발생했습니다'} />

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <h1 className="text-2xl font-black tracking-tight text-slate-900">통계</h1>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: '전체 사용자', value: stats.totalMemberCount },
            { label: '오늘 문제 수', value: stats.todayProblemCount },
            { label: '오늘 제때 제출', value: stats.todayOnTimeSubmissionCount },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
