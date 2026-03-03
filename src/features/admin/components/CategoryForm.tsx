import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { Category, CategoryCreateRequest } from '../../../types/models'

// ============================================
// Validation Schema
// ============================================

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, '카테고리 이름을 입력해주세요')
    .max(100, '카테고리 이름은 100자 이하여야 합니다'),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

// ============================================
// CategoryForm Component
// ============================================

interface CategoryFormProps {
  category?: Category
  isLoading?: boolean
  onSubmit: (data: CategoryCreateRequest) => Promise<void>
  onCancel?: () => void
}

export function CategoryForm({ category, isLoading = false, onSubmit, onCancel }: CategoryFormProps) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
    },
  })

  const onSubmitForm = async (data: CategoryFormData) => {
    try {
      setError(null)
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    }
  }

  const isLoading_ = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <Input
          label="카테고리 이름"
          placeholder="예: 개발, 디자인, 마케팅"
          {...register('name')}
          error={errors.name?.message}
          disabled={isLoading_}
        />
      </div>

      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isLoading_} fullWidth>
          {isLoading_ ? '저장 중...' : category ? '수정' : '등록'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading_} fullWidth>
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
