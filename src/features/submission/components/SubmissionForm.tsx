import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SubmissionResponse, FeedbackGrade } from '../../../types/models'
import { Button } from '../../../components/ui/Button'
import { useSubmissionFeedback } from '../hooks/useSubmissionFeedback'

const submissionSchema = z.object({
  userAnswer: z.string().min(10, { message: '답변은 최소 10자 이상이어야 합니다' }),
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface SubmissionFormProps {
  existingAnswer?: string | null
  onSubmit: (answer: string) => Promise<SubmissionResponse>
}

const GRADE_CONFIG: Record<FeedbackGrade, { label: string; bg: string; text: string; border: string }> = {
  EXCELLENT: { label: '우수', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  GOOD:      { label: '양호', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  FAIR:      { label: '보통', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  POOR:      { label: '미흡', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
}

export function SubmissionForm({ existingAnswer, onSubmit }: SubmissionFormProps) {
  const [submittedAnswer, setSubmittedAnswer] = useState<SubmissionResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const { feedback, isPolling, isTimeout } = useSubmissionFeedback(
    submittedAnswer?.submissionId ?? null
  )

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

  if (submittedAnswer) {
    const gradeConfig = feedback ? GRADE_CONFIG[feedback.grade] : null

    return (
      <div className="space-y-5 animate-fade-in">
        {/* 내 답변 카드 */}
        <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-7 pt-6 pb-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">내가 제출한 답변</h3>
          </div>
          <div className="px-7 py-5">
            <p className="text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
              {submittedAnswer.userAnswer}
            </p>
          </div>
        </div>

        {/* AI 채점 결과 */}
        {isPolling && !feedback && (
          <div className="mesh-gradient text-white rounded-[28px] p-7 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 shrink-0">
                <div className="absolute inset-0 border-[3px] border-white/30 rounded-full" />
                <div className="absolute inset-0 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-black text-base tracking-tight">AI 채점 중...</p>
                <p className="text-white/70 text-sm font-medium mt-0.5">잠시만 기다려 주세요</p>
              </div>
            </div>
          </div>
        )}

        {isTimeout && !feedback && (
          <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-7">
            <p className="text-amber-800 font-bold text-sm">
              채점에 시간이 오래 걸리고 있어요. 잠시 후 페이지를 새로고침해 주세요.
            </p>
          </div>
        )}

        {feedback && gradeConfig && (
          <div className="space-y-4 animate-fade-in">
            {/* 헤더 + 등급 */}
            <div className="mesh-gradient text-white rounded-[28px] p-7 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-5 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-haru-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-lg tracking-tight">AI 멘토의 채점 결과</h3>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-black text-base tracking-wide ${gradeConfig.bg} ${gradeConfig.text} ${gradeConfig.border}`}>
                  <span>{gradeConfig.label}</span>
                  <span className="text-sm opacity-70">({feedback.grade})</span>
                </div>
              </div>
            </div>

            {/* 잘한 점 */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">잘한 점</h4>
              </div>
              <p className="px-6 pb-5 text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {feedback.strengths}
              </p>
            </div>

            {/* 부족한 점 */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest">부족한 점</h4>
              </div>
              <p className="px-6 pb-5 text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {feedback.weaknesses}
              </p>
            </div>

            {/* 개선 방향 */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-sm font-black text-blue-700 uppercase tracking-widest">개선 방향</h4>
              </div>
              <p className="px-6 pb-5 text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {feedback.suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
    >
      <div className="px-7 pt-7 pb-1">
        <h2 className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em]">
          나의 생각 정리하기
        </h2>
      </div>

      <div className="px-7 py-6">
        {apiError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 font-medium">{apiError}</p>
          </div>
        )}

        <textarea
          id="userAnswer"
          rows={8}
          className="w-full p-5 rounded-3xl border-2 border-slate-100 focus:border-haru-500 focus:bg-white outline-none resize-none text-[15px] transition-all font-medium leading-relaxed mb-4"
          placeholder="답변을 입력해주세요. (최소 10자 이상)"
          {...register('userAnswer')}
        />
        {errors.userAnswer && (
          <p className="text-xs text-red-500 ml-1 font-medium mb-4">{errors.userAnswer.message}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          fullWidth
          size="lg"
          className="h-14 rounded-2xl bg-haru-600 hover:bg-haru-700 text-white shadow-lg shadow-haru-600/10 active:scale-[0.98]"
        >
          {isSubmitting ? '제출 중...' : existingAnswer ? '수정 완료' : '오늘의 챌린지 완료!'}
        </Button>
      </div>
    </form>
  )
}
