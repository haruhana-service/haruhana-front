import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { DifficultySelector } from '../components/problem/DifficultySelector'
import { CategorySelector } from '../components/problem/CategorySelector'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { updateProblemPreference } from '../features/problem/services/problemService'
import { isApiError } from '../services/api'
import { ROUTES } from '../constants'
import type { Difficulty } from '../types/models'

const preferenceSchema = z.object({
  categoryTopicId: z.number({ message: '카테고리를 선택해주세요' }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], { message: '난이도를 선택해주세요' }),
})

type PreferenceFormData = z.infer<typeof preferenceSchema>

export function PreferenceEditPage() {
  const navigate = useNavigate()
  const { user, refetchProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      difficulty: user?.difficulty as Difficulty,
    },
  })

  const onSubmit = async (data: PreferenceFormData) => {
    try {
      setIsSubmitting(true)
      setApiError(undefined)

      await updateProblemPreference({
        categoryTopicId: data.categoryTopicId,
        difficulty: data.difficulty,
      })

      // 프로필 새로고침
      await refetchProfile()

      // 설정 페이지로 돌아가기
      alert('학습 설정이 변경되었습니다.\n다음 날 00:00부터 적용됩니다.')
      navigate(ROUTES.SETTINGS)
    } catch (error) {
      console.error('Preference update failed:', error)
      if (isApiError(error)) {
        setApiError(error.message)
      } else {
        setApiError('설정 변경 중 오류가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-6 animate-fade-in">
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

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">학습 설정 변경</h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          변경된 설정은 <span className="font-black text-haru-600">다음 날 00:00부터</span> 적용됩니다
        </p>
      </div>

      {/* Current Settings */}
      <Card className="mb-5 border-amber-100 bg-amber-50/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">현재 설정</p>
            <p className="text-sm font-medium text-amber-800 leading-relaxed">
              <span className="font-black">{user?.categoryTopicName || '-'}</span> ·{' '}
              {user?.difficulty === 'EASY' && '쉬움 (기초)'}
              {user?.difficulty === 'MEDIUM' && '보통 (심화)'}
              {user?.difficulty === 'HARD' && '어려움 (전문가)'}
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
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
            {isSubmitting ? '저장 중...' : '설정 저장'}
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

      {/* Additional Info */}
      <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">알아두세요</h3>
        <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>설정 변경은 즉시 저장되지만, 실제 적용은 익일 00:00부터입니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>오늘 문제는 현재 설정을 기준으로 제공됩니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-haru-500 mt-0.5">•</span>
            <span>난이도와 주제는 언제든 변경할 수 있습니다</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
