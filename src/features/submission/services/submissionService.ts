import api from '../../../services/api'
import type {
  SubmitSolutionRequest,
  SubmissionResponse,
} from '../../../types/models'

/**
 * 답변 제출
 * POST /v1/daily-problem/{dailyProblemId}/submissions
 */
export async function submitAnswer(
  dailyProblemId: number,
  data: SubmitSolutionRequest
): Promise<SubmissionResponse> {
  const response = await api.post<{ data: SubmissionResponse }>(
    `/v1/daily-problem/${dailyProblemId}/submissions`,
    data
  )
  return response.data.data
}

/**
 * 답변 수정
 * PATCH /v1/daily-problem/{dailyProblemId}/submissions
 *
 * 같은 날(23:59 이전)에만 수정 가능
 */
export async function updateAnswer(
  dailyProblemId: number,
  data: SubmitSolutionRequest
): Promise<SubmissionResponse> {
  const response = await api.patch<{ data: SubmissionResponse }>(
    `/v1/daily-problem/${dailyProblemId}/submissions`,
    data
  )
  return response.data.data
}
