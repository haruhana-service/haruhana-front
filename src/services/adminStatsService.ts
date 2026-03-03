import api from './api'

// ============================================
// Admin Statistics API Service
// ============================================

export interface StatsOverviewResponse {
  totalMembers: number
  activeMembersToday: number
  totalSubmissions: number
  averageStreak: number
  totalProblems: number
}

export interface DailyStatsResponse {
  date: string // yyyy-MM-dd
  submissions: number
  solvedProblems: number
  newMembers: number
  activeMembers: number
}

export interface StatsDetailResponse {
  overview: StatsOverviewResponse
  dailyStats: DailyStatsResponse[]
  difficultyDistribution: {
    difficulty: string
    count: number
  }[]
  categoryDistribution: {
    category: string
    count: number
  }[]
}

/**
 * 통계 상세 조회 (관리자용)
 * GET /v1/admin/stats?days={days}
 */
export async function getStats(days: number = 30): Promise<StatsDetailResponse> {
  const response = await api.get<{ data: StatsDetailResponse }>(
    '/v1/admin/stats',
    { params: { days } }
  )
  return response.data.data
}

/**
 * 통계 개요 조회 (관리자용)
 * GET /v1/admin/stats/overview
 */
export async function getStatsOverview(): Promise<StatsOverviewResponse> {
  const response = await api.get<{ data: StatsOverviewResponse }>(
    '/v1/admin/stats/overview'
  )
  return response.data.data
}
