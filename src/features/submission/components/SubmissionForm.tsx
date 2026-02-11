import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SubmissionResponse } from '../../../types/models'
import { Button } from '../../../components/ui/Button'

const submissionSchema = z.object({
  userAnswer: z.string().min(10, { message: '답변은 최소 10자 이상이어야 합니다' }),
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface SubmissionFormProps {
  existingAnswer?: string | null
  onSubmit: (answer: string) => Promise<SubmissionResponse>
}

export function SubmissionForm({ existingAnswer, onSubmit }: SubmissionFormProps) {
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

  if (submittedAnswer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-7 pt-7 pb-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">내가 제출한 답변</h3>
          </div>
          <div className="px-7 py-6">
            <p className="text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
              {submittedAnswer.userAnswer}
            </p>
          </div>
        </div>

        <div className="mesh-gradient text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-8 h-8 bg-haru-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-black text-lg tracking-tight">AI 멘토의 인사이트</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed relative z-10">
            <p className="whitespace-pre-wrap">{submittedAnswer.aiAnswer}</p>
          </div>
        </div>
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
