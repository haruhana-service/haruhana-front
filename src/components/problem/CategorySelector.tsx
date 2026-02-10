import { useState, useEffect } from 'react'
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

  const categories = categoriesData?.categories || []
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const groups = selectedCategory?.groups || []
  const selectedGroup = groups.find((g) => g.id === selectedGroupId)
  const topics = selectedGroup?.topics || []

  // value가 변경되면 해당하는 카테고리/그룹/토픽 찾아서 선택
  useEffect(() => {
    if (value && categories.length > 0) {
      for (const category of categories) {
        for (const group of category.groups) {
          const topic = group.topics.find((t) => t.id === value)
          if (topic) {
            setSelectedCategoryId(category.id)
            setSelectedGroupId(group.id)
            return
          }
        }
      }
    }
  }, [value, categories])

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setSelectedGroupId(undefined)
    onChange(0) // 리셋
  }

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId)
    onChange(0) // 리셋
  }

  const handleTopicChange = (topicId: number) => {
    onChange(topicId)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          카테고리 선택 <span className="text-red-500">*</span>
        </label>
        <div className="text-sm text-gray-500">카테고리 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          카테고리 선택 <span className="text-red-500">*</span>
        </label>
        <div className="text-sm text-red-600">카테고리 목록을 불러오지 못했습니다</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        카테고리 선택 <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Step 1: 카테고리 선택 */}
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-gray-600 mb-1">
            1. 분야
          </label>
          <select
            id="category"
            value={selectedCategoryId || ''}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        <div>
          <label htmlFor="group" className="block text-xs font-medium text-gray-600 mb-1">
            2. 분류
          </label>
          <select
            id="group"
            value={selectedGroupId || ''}
            onChange={(e) => handleGroupChange(Number(e.target.value))}
            disabled={!selectedCategoryId}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
        <div>
          <label htmlFor="topic" className="block text-xs font-medium text-gray-600 mb-1">
            3. 주제
          </label>
          <select
            id="topic"
            value={value || ''}
            onChange={(e) => handleTopicChange(Number(e.target.value))}
            disabled={!selectedGroupId}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
