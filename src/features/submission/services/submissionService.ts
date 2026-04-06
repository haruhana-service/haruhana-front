import api from '../../../services/api'
import type {
  SubmitSolutionRequest,
  SubmissionResponse,
  FeedbackResponse,
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
 * POST /v1/daily-problem/{dailyProblemId}/submissions
 *
 * 같은 날(23:59 이전)에만 수정 가능
 */
export async function updateAnswer(
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
 * AI 채점 피드백 조회 (폴링용)
 * GET /v1/submissions/{submissionId}/feedbacks
 * - 채점 완료 전: 빈 배열 반환 (200 OK)
 * - 채점 완료 후: FeedbackResponse 배열 반환
 */
export async function getSubmissionFeedback(submissionId: number): Promise<FeedbackResponse[]> {
  const response = await api.get<{ data: FeedbackResponse[] }>(
    `/v1/submissions/${submissionId}/feedbacks`
  )
  return response.data.data
}
