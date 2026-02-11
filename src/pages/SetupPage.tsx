import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { Button } from '../components/ui/Button'
import { ChevronDown, Check, X } from 'lucide-react'
import type { Category, CategoryGroup, CategoryTopic } from '../types/models'

export function SetupPage() {
  const { data, isLoading } = useCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<Map<number, CategoryTopic>>(new Map())
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isGroupOpen, setIsGroupOpen] = useState(false)
  const [isTopicOpen, setIsTopicOpen] = useState(false)

  const selectedCategory = data?.categories.find(c => c.id === selectedCategoryId)
  const selectedGroup = selectedCategory?.groups.find(g => g.id === selectedGroupId)

  const handleCategorySelect = (category: Category) => {
    setSelectedCategoryId(category.id)
    setSelectedGroupId(null)
    setIsCategoryOpen(false)
    setIsGroupOpen(false)
    setIsTopicOpen(false)
  }

  const handleGroupSelect = (group: CategoryGroup) => {
    setSelectedGroupId(group.id)
    setIsGroupOpen(false)
    setIsTopicOpen(false)
  }

  const handleTopicToggle = (topic: CategoryTopic) => {
    setSelectedTopics(prev => {
      const newMap = new Map(prev)
      if (newMap.has(topic.id)) {
        newMap.delete(topic.id)
      } else {
        newMap.set(topic.id, topic)
      }
      return newMap
    })
  }

  const removeTopic = (topicId: number) => {
    setSelectedTopics(prev => {
      const newMap = new Map(prev)
      newMap.delete(topicId)
      return newMap
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-10">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">카테고리 선택</h1>
        </div>

        <div className="space-y-6">
          {/* 1. 분야 */}
          <div className="space-y-3">
            <label className="text-base font-bold text-indigo-600">1. 분야</label>
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full rounded-2xl border-2 px-6 py-4 text-left font-semibold transition-all ${
                  selectedCategoryId
                    ? 'border-indigo-600 bg-slate-700 text-white'
                    : 'border-indigo-600 bg-indigo-600 text-white'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  {selectedCategory && <Check className="h-5 w-5" />}
                  <span>{selectedCategory?.name || '선택하세요'}</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white shadow-xl">
                  {data?.categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="w-full px-6 py-4 text-left font-semibold text-slate-700 transition-colors hover:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. 분류 */}
          {selectedCategory && (
            <div className="space-y-3">
              <label className="text-base font-bold text-indigo-600">2. 분류</label>
              <div className="relative">
                <button
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-left font-medium text-slate-500 transition-all hover:border-slate-300 flex items-center justify-between"
                >
                  <span>{selectedGroup?.name || '선택하세요'}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isGroupOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white shadow-xl">
                    {selectedCategory.groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className="w-full px-6 py-4 text-left font-semibold text-slate-700 transition-colors hover:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. 주제 */}
          {selectedGroup && (
            <div className="space-y-3">
              <label className="text-base font-bold text-indigo-600">3. 주제</label>
              <div className="relative">
                <button
                  onClick={() => setIsTopicOpen(!isTopicOpen)}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-left font-medium text-slate-500 transition-all hover:border-slate-300 flex items-center justify-between"
                >
                  <span>선택하세요</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isTopicOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isTopicOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto">
                    {selectedGroup.topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicToggle(topic)}
                        className={`w-full px-6 py-4 text-left font-semibold transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                          selectedTopics.has(topic.id)
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedTopics.has(topic.id) && <Check className="h-5 w-5" />}
                          <span>{topic.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 선택된 주제들 표시 */}
        {selectedTopics.size > 0 && (
          <div className="space-y-4 pt-6">
            <div className="text-sm font-bold text-slate-600">
              선택한 주제 ({selectedTopics.size}개)
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from(selectedTopics.values()).map(topic => (
                <div
                  key={topic.id}
                  className="group relative rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:border-red-200 transition-all"
                >
                  {topic.name}
                  <button
                    onClick={() => removeTopic(topic.id)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 카테고리 선택 서비스 버튼 */}
        {selectedTopics.size > 0 && (
          <div className="border-t pt-6">
            <p className="mb-4 text-xs text-red-500 font-semibold">
              * 카테고리는 선택 후 변경이 불가능합니다.
            </p>
            <Button
              fullWidth
              size="lg"
              className="h-14 rounded-2xl bg-indigo-600 text-base font-bold text-white shadow-lg hover:bg-indigo-700"
            >
              선택 완료
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
