import api from './api'

// ============================================
// Admin Problem API Service
// ============================================

export interface AdminProblemPreviewResponse {
  id: number
  title: string
  description: string
  aiAnswer: string
  categoryTopic: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface ProblemsListResponse {
  contents: AdminProblemPreviewResponse[]
  hasNext: boolean
}

/**
 * 문제 목록 조회 (관리자용)
 * GET /v1/admin/problems?date={date}&page={page}&size={size}
 */
export async function getProblems(params?: {
  date?: string   // yyyy-MM-dd
  page?: number
  size?: number
}): Promise<ProblemsListResponse> {
  const response = await api.get<{ data: ProblemsListResponse }>(
    '/v1/admin/problems',
    { params }
  )
  return response.data.data
}
