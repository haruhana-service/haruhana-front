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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Step 1: 카테고리 선택 */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            1. 분야
          </label>
          <select
            id="category"
            value={resolvedCategoryId || ''}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
          >
            <option value="">선택하세요</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: 그룹 선택 */}
        <div className="space-y-1.5">
          <label htmlFor="group" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            2. 분류
          </label>
          <select
            id="group"
            value={resolvedGroupId || ''}
            onChange={(e) => handleGroupChange(Number(e.target.value))}
            disabled={!resolvedCategoryId}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">선택하세요</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: 토픽 선택 */}
        <div className="space-y-1.5">
          <label htmlFor="topic" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            3. 주제
          </label>
          <select
            id="topic"
            value={value || ''}
            onChange={(e) => handleTopicChange(Number(e.target.value))}
            disabled={!resolvedGroupId}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-haru-500 focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">선택하세요</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  )
}
