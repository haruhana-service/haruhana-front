import api from '../../../services/api'
import type {
  TodayProblemResponse,
  DailyProblemResponse,
  DailyProblemDetailResponse,
  SubmitSolutionRequest,
  SubmissionResponse,
  StreakResponse,
} from '../../../types/models'

// ============================================
// Problem API Service
// ============================================

/**
 * 오늘의 문제 조회
 * GET /v1/daily-problem/today
 */
export async function getTodayProblem(): Promise<TodayProblemResponse> {
  const response = await api.get<{ data: TodayProblemResponse }>('/v1/daily-problem/today')
  return response.data.data
}

/**
 * 날짜별 문제 미리보기
 * GET /v1/daily-problem
 */
export async function getDailyProblem(date?: string): Promise<DailyProblemResponse> {
  const params = date ? { date } : {}
  const response = await api.get<{ data: DailyProblemResponse }>('/v1/daily-problem', { params })
  return response.data.data
}

/**
 * 문제 상세 조회
 * GET /v1/daily-problem/{dailyProblemId}
 */
export async function getProblemDetail(dailyProblemId: number): Promise<DailyProblemDetailResponse> {
  const response = await api.get<{ data: DailyProblemDetailResponse }>(`/v1/daily-problem/${dailyProblemId}`)
  return response.data.data
}

/**
 * 문제 제출
 * POST /v1/daily-problem/{dailyProblemId}/submissions
 */
export async function submitSolution(
  dailyProblemId: number,
  data: SubmitSolutionRequest
): Promise<SubmissionResponse> {
  const response = await api.post<{ data: SubmissionResponse }>(
    `/v1/daily-problem/${dailyProblemId}/submissions`,
    data
  )
  return response.data.data
}

// ============================================
// Streak API Service
// ============================================

/**
 * 스트릭 조회
 * GET /v1/streaks
 */
export async function getStreak(): Promise<StreakResponse> {
  const response = await api.get<{ data: StreakResponse }>('/v1/streaks')
  return response.data.data
}
