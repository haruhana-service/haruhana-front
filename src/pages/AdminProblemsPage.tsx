import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as adminProblemService from '../services/adminProblemService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDateKorean } from '../utils/date'

// ============================================
// Admin Problems Page
// ============================================

const PAGE_SIZE = 20

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: '쉬움', MEDIUM: '보통', HARD: '어려움',
}

const DIFFICULTY_CLS: Record<string, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HARD: 'bg-red-50 text-red-700 border-red-200',
}

export function AdminProblemsPage() {
  const [page, setPage] = useState(0)
  const [dateFilter, setDateFilter] = useState('')
  const [dateInput, setDateInput] = useState('')

  const { data: problemsData, isLoading, error } = useQuery({
    queryKey: ['admin-problems', page, dateFilter],
    queryFn: () => adminProblemService.getProblems({
      page,
      size: PAGE_SIZE,
      date: dateFilter || undefined,
    }),
  })

  const problems = problemsData?.contents || []
  const hasNext = problemsData?.hasNext || false

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : '오류가 발생했습니다'} />

  const visiblePages = Array.from({ length: 5 }, (_, i) => page - 2 + i).filter((p) => p >= 0)

  const handleDateFilter = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setDateFilter(dateInput)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">문제 관리</h1>
      </div>

      {/* 날짜 필터 */}
      <form onSubmit={handleDateFilter} className="flex gap-2">
        <div className="relative w-44 sm:w-40">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="admin-date-input w-full rounded-lg border border-slate-200 px-4 py-2 pr-12 text-sm focus:border-slate-400 focus:outline-none"
            aria-label="날짜 선택"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
        >
          검색
        </button>
        {dateFilter && (
          <button
            type="button"
            onClick={() => {
              setDateFilter('')
              setDateInput('')
              setPage(0)
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            초기화
          </button>
        )}
      </form>
      {dateFilter && (
        <p className="text-xs font-semibold text-slate-500">
          선택된 날짜: {formatDateKorean(dateFilter)}
        </p>
      )}

      {/* Problem List */}
      {problems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          {dateFilter ? '해당 날짜의 문제가 없습니다' : '등록된 문제가 없습니다'}
        </div>
      ) : (
        <div className="space-y-2">
          {problems.map((problem) => (
            <div key={problem.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`rounded border px-2 py-0.5 text-xs font-bold ${DIFFICULTY_CLS[problem.difficulty] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {DIFFICULTY_LABEL[problem.difficulty] ?? problem.difficulty}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {problem.categoryTopic}
                </span>
              </div>
              <p className="font-bold text-slate-900 leading-snug">{problem.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{problem.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => setPage(0)}
          disabled={page === 0}
          className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          처음
        </button>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          이전
        </button>
        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded w-8 h-8 text-xs font-bold transition-colors ${
              p === page ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  )
}
