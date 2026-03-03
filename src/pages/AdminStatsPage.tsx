import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as adminStatsService from '../services/adminStatsService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

// ============================================
// Admin Statistics Page
// ============================================

const PERIOD_OPTIONS = [
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
]

export function AdminStatsPage() {
  const [days, setDays] = useState(30)

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats', days],
    queryFn: () => adminStatsService.getStats(days),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : '오류가 발생했습니다'} />

  const overview = stats?.overview

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">통계</h1>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden self-start">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                days === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 개요 카드 */}
      {overview && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: '전체 사용자', value: overview.totalMembers },
            { label: '오늘 활성', value: overview.activeMembersToday },
            { label: '전체 제출', value: overview.totalSubmissions },
            { label: '평균 스트릭', value: overview.averageStreak.toFixed(1) },
            { label: '전체 문제', value: overview.totalProblems },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 난이도 분포 */}
      {stats?.difficultyDistribution && stats.difficultyDistribution.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">난이도별 문제 수</h2>
          <div className="space-y-3">
            {stats.difficultyDistribution.map((item) => {
              const maxCount = Math.max(...stats.difficultyDistribution.map((d) => d.count))
              const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              return (
                <div key={item.difficulty}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{item.difficulty}</span>
                    <span className="text-slate-400">{item.count}개</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 카테고리 분포 */}
      {stats?.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">카테고리별 문제 수</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {stats.categoryDistribution.map((item) => (
              <div key={item.category} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">{item.category}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일일 통계 */}
      {stats?.dailyStats && stats.dailyStats.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">
            일일 통계 (최근 {Math.min(stats.dailyStats.length, 7)}일)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">날짜</th>
                  <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-slate-400">제출</th>
                  <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-slate-400">해결</th>
                  <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-slate-400">신규</th>
                  <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-slate-400">활성</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.dailyStats.slice(0, 7).map((stat) => (
                  <tr key={stat.date}>
                    <td className="py-2.5 font-medium text-slate-700">{stat.date}</td>
                    <td className="py-2.5 text-right text-slate-500">{stat.submissions}</td>
                    <td className="py-2.5 text-right text-slate-500">{stat.solvedProblems}</td>
                    <td className="py-2.5 text-right text-slate-500">{stat.newMembers}</td>
                    <td className="py-2.5 text-right text-slate-500">{stat.activeMembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
