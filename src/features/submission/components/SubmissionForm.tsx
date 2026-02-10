import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SubmissionResponse } from '../../../types/models'

// Validation schema
const submissionSchema = z.object({
  userAnswer: z.string().min(10, { message: '답변은 최소 10자 이상이어야 합니다' }),
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface SubmissionFormProps {
  existingAnswer?: string | null
  onSubmit: (answer: string) => Promise<SubmissionResponse>
}

/**
 * 문제 답변 제출 폼 컴포넌트
 */
export function SubmissionForm({
  existingAnswer,
  onSubmit,
}: SubmissionFormProps) {
  const [submittedAnswer, setSubmittedAnswer] = useState<SubmissionResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      userAnswer: existingAnswer || '',
    },
  })

  const onFormSubmit = async (data: SubmissionFormData) => {
    try {
      setApiError(null)
      const result = await onSubmit(data.userAnswer)
      setSubmittedAnswer(result)
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setApiError(error.message as string)
      } else {
        setApiError('답변 제출에 실패했습니다')
      }
    }
  }

  // 제출 완료 후 AI 답변 표시
  if (submittedAnswer) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* 제출 성공 메시지 */}
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-medium text-green-800">
                답변이 제출되었습니다!
              </h3>
              <div className="mt-2 text-sm text-green-700 space-y-1">
                <p>• 제출 시각: {new Date(submittedAnswer.submittedAt).toLocaleString('ko-KR')}</p>
                {submittedAnswer.isOnTime ? (
                  <p>• ✓ 제시간 제출: 스트릭이 증가했습니다</p>
                ) : (
                  <p>• 늦은 제출: 스트릭에 반영되지 않습니다</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 내 답변 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            내 답변
          </h3>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
            {submittedAnswer.userAnswer}
          </p>
        </div>

        {/* AI 예시 답변 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3">
            AI 예시 답변
          </h3>
          <p className="text-sm sm:text-base text-blue-800 whitespace-pre-wrap leading-relaxed">
            {submittedAnswer.aiAnswer}
          </p>
        </div>
      </div>
    )
  }

  // 제출 폼
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {existingAnswer ? '답변 수정' : '답변 작성'}
      </h2>

      {/* API 에러 메시지 */}
      {apiError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      {/* 답변 입력 */}
      <div className="mb-4 sm:mb-6">
        <label htmlFor="userAnswer" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          답변 *
        </label>
        <textarea
          id="userAnswer"
          rows={8}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="답변을 입력하세요 (최소 10자)"
          {...register('userAnswer')}
        />
        {errors.userAnswer && (
          <p className="mt-1 text-sm text-red-600">{errors.userAnswer.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] px-6 py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '제출 중...' : existingAnswer ? '수정 완료' : '제출하기'}
        </button>
      </div>
    </form>
  )
}
