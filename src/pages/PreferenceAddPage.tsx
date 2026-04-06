import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { DifficultySelector } from '../components/problem/DifficultySelector'
import { CategorySelector } from '../components/problem/CategorySelector'
import { Button } from '../components/ui/Button'
import { appendPreference } from '../features/auth/services/authService'
import { isApiError } from '../services/api'
import { ROUTES } from '../constants'
import { toast } from 'sonner'

const preferenceSchema = z.object({
  categoryTopicId: z.number({ message: '카테고리를 선택해주세요' }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], { message: '난이도를 선택해주세요' }),
})

type PreferenceFormData = z.infer<typeof preferenceSchema>

export function PreferenceAddPage() {
  const navigate = useNavigate()
  const { refetchProfile, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()

  const currentCount = user?.memberPreferences?.length ?? 0

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
  })

  const onSubmit = async (data: PreferenceFormData) => {
    try {
      setIsSubmitting(true)
      setApiError(undefined)

      await appendPreference({
        categoryTopicId: data.categoryTopicId,
        difficulty: data.difficulty,
      })

      await refetchProfile()

      toast.success('학습 설정이 추가되었습니다. 지금 바로 적용됩니다.')
      navigate(ROUTES.SETTINGS)
    } catch (error) {
      console.error('Preference append failed:', error)
      if (isApiError(error)) {
        setApiError(error.message)
      } else {
        setApiError('설정 추가 중 오류가 발생했습니다')
      }
      toast.error('설정 추가에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-[var(--page-pt)] px-[var(--page-px)] animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-bold">뒤로 가기</span>
        </button>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">학습 설정 추가</h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          새로운 학습 주제를 추가합니다.{' '}
          <span className="font-black text-haru-600">{currentCount}/5</span> 개 사용 중
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 font-medium text-center">{apiError}</p>
          </div>
        )}

        <Controller
          name="categoryTopicId"
          control={control}
          render={({ field }) => (
            <CategorySelector
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryTopicId?.message}
            />
          )}
        />

        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <DifficultySelector value={field.value} onChange={field.onChange} error={errors.difficulty?.message} />
          )}
        />

        <div className="pt-3 space-y-3">
          <Button type="submit" disabled={isSubmitting} fullWidth size="lg" className="h-12 rounded-xl">
            {isSubmitting ? '추가 중...' : '학습 설정 추가'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            fullWidth
            size="lg"
            className="h-14 rounded-2xl"
          >
            취소
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">알아두세요</h3>
        <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>학습 설정은 최대 5개까지 추가할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>추가된 설정은 바로 문제 출제에 반영됩니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>각 설정마다 난이도를 다르게 지정할 수 있습니다</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
