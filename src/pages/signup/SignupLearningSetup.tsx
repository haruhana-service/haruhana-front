import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { CategorySelector } from '../../components/problem/CategorySelector'
import { DifficultySelector } from '../../components/problem/DifficultySelector'
import type { SignupFormData } from '../../lib/validations'

interface SignupLearningSetupProps {
  control: Control<SignupFormData>
  errors: FieldErrors<SignupFormData>
}

export function SignupLearningSetup({ control, errors }: SignupLearningSetupProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <Controller
        name="categoryTopicId"
        control={control}
        render={({ field }) => (
          <CategorySelector value={field.value} onChange={field.onChange} error={errors.categoryTopicId?.message} />
        )}
      />

      <Controller
        name="difficulty"
        control={control}
        render={({ field }) => (
          <DifficultySelector value={field.value} onChange={field.onChange} error={errors.difficulty?.message} />
        )}
      />
    </div>
  )
}
