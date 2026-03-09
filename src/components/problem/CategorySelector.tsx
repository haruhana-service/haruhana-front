import { useState, useMemo } from 'react'
import { useCategories } from '../../hooks/useCategories'

interface CategorySelectorProps {
  value: number | undefined
  onChange: (topicId: number) => void
  error?: string
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const { data: categoriesData, isLoading, isError } = useCategories()

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>()
  const [selectedGroupId, setSelectedGroupId] = useState<number>()

  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData])

  // value가 주어지면 해당 카테고리와 그룹을 찾아서 자동 선택
  const resolvedCategoryId = useMemo(() => {
    if (value && categories.length > 0) {
      for (const category of categories) {
        for (const group of category.groups) {
          if (group.topics.find((t) => t.id === value)) {
            return category.id
          }
        }
      }
    }
    return selectedCategoryId
  }, [value, categories, selectedCategoryId])

  const resolvedGroupId = useMemo(() => {
    if (value && categories.length > 0) {
      for (const category of categories) {
        for (const group of category.groups) {
          if (group.topics.find((t) => t.id === value)) {
            return group.id
          }
        }
      }
    }
    return selectedGroupId
  }, [value, categories, selectedGroupId])

  const selectedCategory = categories.find((c) => c.id === resolvedCategoryId)
  const groups = selectedCategory?.groups || []
  const selectedGroup = groups.find((g) => g.id === resolvedGroupId)
  const topics = selectedGroup?.topics || []

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setSelectedGroupId(undefined)
    onChange(0)
  }

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId)
    onChange(0)
  }

  const handleTopicChange = (topicId: number) => {
    onChange(topicId)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
          카테고리 선택
        </label>
        <div className="text-sm text-slate-400 font-medium">카테고리 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
          카테고리 선택
        </label>
        <div className="text-sm text-red-500 font-medium">카테고리 목록을 불러오지 못했습니다</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
        카테고리 선택
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Step 1: 카테고리 선택 */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">1. 분야</p>
          <div className="mt-3 space-y-1.5">
            {categories.map((category) => {
              const isSelected = category.id === resolvedCategoryId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  aria-pressed={isSelected}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all ${
                    isSelected
                      ? 'border-haru-500 bg-haru-50 text-haru-700 shadow-sm'
                      : 'border-transparent bg-slate-50 text-slate-700 hover:border-haru-200 hover:bg-white'
                  }`}
                >
                  {category.name}
                </button>
              )
            })}
            {categories.length === 0 && (
              <p className="text-xs text-slate-400 font-medium">선택 가능한 분야가 없습니다</p>
            )}
          </div>
        </div>

        {/* Step 2: 그룹 선택 */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">2. 분류</p>
          <div className="mt-3 space-y-1.5">
            {!resolvedCategoryId && (
              <p className="text-xs text-slate-400 font-medium">먼저 분야를 선택해주세요</p>
            )}
            {resolvedCategoryId &&
              groups.map((group) => {
                const isSelected = group.id === resolvedGroupId
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleGroupChange(group.id)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-haru-500 bg-haru-50 text-haru-700 shadow-sm'
                        : 'border-transparent bg-slate-50 text-slate-700 hover:border-haru-200 hover:bg-white'
                    }`}
                  >
                    {group.name}
                  </button>
                )
              })}
          </div>
        </div>

        {/* Step 3: 토픽 선택 */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">3. 주제</p>
          <div className="mt-3 space-y-1.5">
            {!resolvedGroupId && <p className="text-xs text-slate-400 font-medium">분류를 선택해주세요</p>}
            {resolvedGroupId &&
              topics.map((topic) => {
                const isSelected = topic.id === value
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicChange(topic.id)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-haru-500 bg-haru-50 text-haru-700 shadow-sm'
                        : 'border-transparent bg-slate-50 text-slate-700 hover:border-haru-200 hover:bg-white'
                    }`}
                  >
                    {topic.name}
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  )
}
