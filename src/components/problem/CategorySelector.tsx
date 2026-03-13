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
  const [openPanel, setOpenPanel] = useState<'category' | 'group' | 'topic' | null>(null)
  const [closingPanel, setClosingPanel] = useState(false)

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
    triggerClose()
  }

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId)
    onChange(0)
    triggerClose()
  }

  const handleTopicChange = (topicId: number) => {
    onChange(topicId)
    triggerClose()
  }

  const triggerClose = () => {
    setClosingPanel(true)
    window.setTimeout(() => {
      setOpenPanel(null)
      setClosingPanel(false)
    }, 180)
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
        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">1. 분야</p>
          <button
            type="button"
            onClick={() => setOpenPanel('category')}
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm text-left hover:border-haru-300 transition-colors"
          >
            {selectedCategory?.name || '분야를 선택하세요'}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">2. 분류</p>
          <button
            type="button"
            onClick={() => resolvedCategoryId && setOpenPanel('group')}
            disabled={!resolvedCategoryId}
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm text-left hover:border-haru-300 transition-colors disabled:bg-white/40 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {selectedGroup?.name || (resolvedCategoryId ? '분류를 선택하세요' : '먼저 분야를 선택하세요')}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">3. 주제</p>
          <button
            type="button"
            onClick={() => resolvedGroupId && setOpenPanel('topic')}
            disabled={!resolvedGroupId}
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm text-left hover:border-haru-300 transition-colors disabled:bg-white/40 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {topics.find((t) => t.id === value)?.name || (resolvedGroupId ? '주제를 선택하세요' : '분류를 먼저 선택하세요')}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}

      {openPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 animate-fade-in"
          onClick={triggerClose}
        >
          <div
            className={`w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl ${
              closingPanel ? 'animate-modal-out' : 'animate-modal-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">
                {openPanel === 'category' && '분야 선택'}
                {openPanel === 'group' && '분류 선택'}
                {openPanel === 'topic' && '주제 선택'}
              </p>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {openPanel === 'category' &&
                (categories.length ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        category.id === resolvedCategoryId
                          ? 'border-haru-500 bg-haru-50 text-haru-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-haru-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">선택 가능한 분야가 없습니다</p>
                ))}

              {openPanel === 'group' &&
                (groups.length ? (
                  groups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleGroupChange(group.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        group.id === resolvedGroupId
                          ? 'border-haru-500 bg-haru-50 text-haru-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-haru-200'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">선택 가능한 분류가 없습니다</p>
                ))}

              {openPanel === 'topic' &&
                (topics.length ? (
                  topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicChange(topic.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        topic.id === value
                          ? 'border-haru-500 bg-haru-50 text-haru-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-haru-200'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">선택 가능한 주제가 없습니다</p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
