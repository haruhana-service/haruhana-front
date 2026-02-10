import api from '../../../services/api'
import type { StreakResponse } from '../../../types/models'

/**
 * 사용자의 스트릭 정보를 조회합니다.
 * GET /v1/streak
 */
export async function getStreak(): Promise<StreakResponse> {
  const response = await api.get<StreakResponse>('/v1/streak')
  return response.data
}
