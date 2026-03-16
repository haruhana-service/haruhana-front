import api from './api'

// ============================================
// Admin Statistics API Service
// ============================================

export interface AdminStatisticsResponse {
  totalMemberCount: number
  todayProblemCount: number
  todayOnTimeSubmissionCount: number
}

/**
 * 통계 조회 (관리자용)
 * GET /v1/admin/statistics
 */
export async function getStatistics(): Promise<AdminStatisticsResponse> {
  const response = await api.get<{ data: AdminStatisticsResponse }>(
    '/v1/admin/statistics'
  )
  return response.data.data
}
