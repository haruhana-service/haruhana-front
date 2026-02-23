import { useState, useMemo, useEffect } from 'react'
import { useCategories } from '../../hooks/useCategories'

interface CategorySelectorProps {
  value: number | undefined
  onChange: (topicId: number) => void
  error?: string
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const { data: categoriesData, isLoading, isError } = useCategories()

  useEffect(() => {
    console.log('카테고리 :: ', categoriesData)
  }, [categoriesData])

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>()
  const [selectedGroupId, setSelectedGroupId] = useState<number>()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [groupQuery, setGroupQuery] = useState('')
  const [topicQuery, setTopicQuery] = useState('')

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
  const selectedTopic = topics.find((t) => t.id === value)
  const filteredGroups = useMemo(() => {
    const query = groupQuery.trim().toLowerCase()
    if (!query) return groups
    return groups.filter((group) => group.name.toLowerCase().includes(query))
  }, [groups, groupQuery])
  const filteredTopics = useMemo(() => {
    const query = topicQuery.trim().toLowerCase()
    if (!query) return topics
    return topics.filter((topic) => topic.name.toLowerCase().includes(query))
  }, [topics, topicQuery])
  const useVirtualizedTopics = filteredTopics.length >= 30
  const topicItemSize = 48
  const topicListHeight = Math.min(320, Math.max(160, filteredTopics.length * topicItemSize))

  useEffect(() => {
    if (value && resolvedGroupId && resolvedCategoryId) {
      setStep(3)
      return
    }
    if (resolvedGroupId && resolvedCategoryId) {
      setStep(3)
      return
    }
    if (resolvedCategoryId) {
      setStep(2)
      return
    }
    setStep(1)
  }, [value, resolvedCategoryId, resolvedGroupId])

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setSelectedGroupId(undefined)
    onChange(0)
    setStep(2)
    setGroupQuery('')
    setTopicQuery('')
  }

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId)
    onChange(0)
    setStep(3)
    setTopicQuery('')
  }

  const handleTopicChange = (topicId: number) => {
    onChange(topicId)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">

        </label>
        <div className="text-sm text-slate-400 font-medium">카테고리를 불러오는 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
          카테고리 선택
        </label>
        <div className="text-sm text-red-500 font-medium">카테고리를 불러오지 못했습니다</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-haru-500 uppercase tracking-[0.2em] ml-1">
        카테고리 선택
      </label>

      {/* Step Indicator */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              step >= num ? 'bg-haru-500' : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      {/* Step Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-sm font-black text-slate-800">1. 분야 선택</div>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    resolvedCategoryId === category.id
                      ? 'bg-haru-500 text-white shadow-md shadow-haru-100'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-sm font-black text-slate-800">2. 분류 선택</div>
            <input
              type="text"
              value={groupQuery}
              onChange={(e) => setGroupQuery(e.target.value)}
              placeholder="분류 검색"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-haru-500 focus:bg-white outline-none transition-all"
            />
            <div className="grid grid-cols-1 gap-2">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupChange(group.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    resolvedGroupId === group.id
                      ? 'bg-haru-500 text-white shadow-md shadow-haru-100'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {group.name}
                </button>
              ))}
              {filteredGroups.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-sm font-black text-slate-800">3. 주제 선택</div>
            <input
              type="text"
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              placeholder="주제 검색"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-haru-500 focus:bg-white outline-none transition-all"
            />
            {filteredTopics.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400">
                검색 결과가 없습니다
              </div>
            )}
            {filteredTopics.length > 0 && useVirtualizedTopics && (
              <div className="rounded-xl border border-slate-100 bg-white">
                <FixedSizeList
                  height={topicListHeight}
                  itemCount={filteredTopics.length}
                  itemSize={topicItemSize}
                  width="100%"
                >
                  {({ index, style }: ListChildComponentProps) => {
                    const topic = filteredTopics[index]
                    const selected = value === topic.id
                    return (
                      <div style={style} className="px-2">
                        <button
                          type="button"
                          onClick={() => handleTopicChange(topic.id)}
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition-all ${
                            selected
                              ? 'bg-haru-500 text-white shadow-md shadow-haru-100'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {topic.name}
                        </button>
                      </div>
                    )
                  }}
                </FixedSizeList>
              </div>
            )}
            {filteredTopics.length > 0 && !useVirtualizedTopics && (
              <div className="grid grid-cols-1 gap-2">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicChange(topic.id)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                      value === topic.id
                        ? 'bg-haru-500 text-white shadow-md shadow-haru-100'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            disabled={step === 1}
          >
            이전
          </button>
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev))}
              className="text-xs font-black text-haru-600 hover:text-haru-500 transition-colors"
              disabled={(step === 1 && !resolvedCategoryId) || (step === 2 && !resolvedGroupId)}
            >
              다음
            </button>
          )}
        </div>
      </div>

      {resolvedCategoryId && resolvedGroupId && value && (
        <div className="rounded-2xl border border-haru-100 bg-haru-50 px-4 py-3 text-slate-800 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-haru-600">
                선택 요약
              </div>
              <div className="text-sm font-black">
                {selectedCategory?.name} · {selectedGroup?.name} · {selectedTopic?.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-black text-haru-700 shadow-sm hover:bg-haru-100 transition-colors"
            >
              수정
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  )
}
