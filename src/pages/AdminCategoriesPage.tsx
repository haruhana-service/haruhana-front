import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as categoryService from '../services/categoryService'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import type { Category, CategoryGroup, CategoryTopic } from '../types/models'

// ============================================
// Types
// ============================================

type FormTarget =
  | { type: 'category'; data?: Category }
  | { type: 'group'; categoryId: number; data?: CategoryGroup }
  | { type: 'topic'; groupId: number; data?: CategoryTopic }

// ============================================
// Admin Categories Page
// ============================================

export function AdminCategoriesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [formName, setFormName] = useState('')
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const categories = categoriesData?.categories || []

  // ============================================
  // Mutations
  // ============================================

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => { invalidate(); toast.success('대분류가 등록되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoryService.updateCategory(id, { name }),
    onSuccess: () => { invalidate(); toast.success('대분류가 수정되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => { invalidate(); toast.success('대분류가 삭제되었습니다') },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const createGroupMutation = useMutation({
    mutationFn: categoryService.createCategoryGroup,
    onSuccess: () => { invalidate(); toast.success('중분류가 등록되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoryService.updateCategoryGroup(id, { name }),
    onSuccess: () => { invalidate(); toast.success('중분류가 수정되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const deleteGroupMutation = useMutation({
    mutationFn: categoryService.deleteCategoryGroup,
    onSuccess: () => { invalidate(); toast.success('중분류가 삭제되었습니다') },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const createTopicMutation = useMutation({
    mutationFn: categoryService.createCategoryTopic,
    onSuccess: () => { invalidate(); toast.success('소분류가 등록되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoryService.updateCategoryTopic(id, { name }),
    onSuccess: () => { invalidate(); toast.success('소분류가 수정되었습니다'); closeForm() },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  const deleteTopicMutation = useMutation({
    mutationFn: categoryService.deleteCategoryTopic,
    onSuccess: () => { invalidate(); toast.success('소분류가 삭제되었습니다') },
    onError: (err) => toast.error(err instanceof Error ? err.message : '오류가 발생했습니다'),
  })

  // ============================================
  // Handlers
  // ============================================

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openForm = (target: FormTarget) => {
    setFormTarget(target)
    if (target.type === 'category') setFormName(target.data?.name || '')
    else if (target.type === 'group') setFormName(target.data?.name || '')
    else setFormName(target.data?.name || '')
  }

  const closeForm = () => {
    setFormTarget(null)
    setFormName('')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formName.trim()
    if (!name || !formTarget) return

    if (formTarget.type === 'category') {
      if (formTarget.data) {
        updateCategoryMutation.mutate({ id: formTarget.data.id, name })
      } else {
        createCategoryMutation.mutate({ name })
      }
    } else if (formTarget.type === 'group') {
      if (formTarget.data) {
        updateGroupMutation.mutate({ id: formTarget.data.id, name })
      } else {
        createGroupMutation.mutate({ categoryId: formTarget.categoryId, name })
      }
    } else {
      if (formTarget.data) {
        updateTopicMutation.mutate({ id: formTarget.data.id, name })
      } else {
        createTopicMutation.mutate({ groupId: formTarget.groupId, name })
      }
    }
  }

  const handleDelete = (type: 'category' | 'group' | 'topic', id: number) => {
    const labels = { category: '대분류', group: '중분류', topic: '소분류' }
    if (!window.confirm(`이 ${labels[type]}를 삭제하시겠습니까?`)) return

    if (type === 'category') deleteCategoryMutation.mutate(id)
    else if (type === 'group') deleteGroupMutation.mutate(id)
    else deleteTopicMutation.mutate(id)
  }

  const getFormTitle = () => {
    if (!formTarget) return ''
    const labels = { category: '대분류', group: '중분류', topic: '소분류' }
    const isEdit = 'data' in formTarget && formTarget.data
    return `${labels[formTarget.type]} ${isEdit ? '수정' : '추가'}`
  }

  const isFormLoading =
    createCategoryMutation.isPending || updateCategoryMutation.isPending ||
    createGroupMutation.isPending || updateGroupMutation.isPending ||
    createTopicMutation.isPending || updateTopicMutation.isPending

  // ============================================
  // Render
  // ============================================

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : '오류가 발생했습니다'} />

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">카테고리 관리</h1>
          <p className="mt-1 text-xs text-slate-400 uppercase tracking-wider">대분류 / 중분류 / 소분류</p>
        </div>
        <button
          onClick={() => openForm({ type: 'category' })}
          className="self-start rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 transition-colors active:scale-[0.98]"
        >
          + 대분류 추가
        </button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          등록된 카테고리가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isCategoryOpen = expandedCategories.has(category.id)
            return (
              <div key={category.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                {/* 대분류 */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label={isCategoryOpen ? '접기' : '펼치기'}
                  >
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${isCategoryOpen ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900">{category.name}</span>
                    <span className="ml-2 text-xs text-slate-400">중분류 {category.groups.length}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openForm({ type: 'group', categoryId: category.id })}
                      className="rounded px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                      + 중분류
                    </button>
                    <button
                      onClick={() => openForm({ type: 'category', data: category })}
                      className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete('category', category.id)}
                      className="rounded px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 중분류 목록 */}
                {isCategoryOpen && (
                  <div className="border-t border-slate-100 bg-slate-50">
                    {category.groups.length === 0 ? (
                      <div className="py-3 pl-14 text-xs text-slate-400">중분류가 없습니다</div>
                    ) : (
                      category.groups.map((group) => {
                        const isGroupOpen = expandedGroups.has(group.id)
                        return (
                          <div key={group.id} className="border-b border-slate-100 last:border-0">
                            {/* 중분류 */}
                            <div className="flex items-center gap-3 py-2.5 pl-10 pr-4">
                              <button
                                onClick={() => toggleGroup(group.id)}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                aria-label={isGroupOpen ? '접기' : '펼치기'}
                              >
                                <svg
                                  className={`h-3 w-3 transition-transform ${isGroupOpen ? 'rotate-90' : ''}`}
                                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                                <span className="ml-2 text-xs text-slate-400">소분류 {group.topics.length}</span>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <button
                                  onClick={() => openForm({ type: 'topic', groupId: group.id })}
                                  className="rounded px-2 py-1 text-xs font-bold text-slate-700 border border-slate-300 hover:border-slate-900 hover:text-slate-900 transition-colors"
                                >
                                  + 소분류
                                </button>
                                <button
                                  onClick={() => openForm({ type: 'group', categoryId: category.id, data: group })}
                                  className="rounded px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDelete('group', group.id)}
                                  className="rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>

                            {/* 소분류 목록 */}
                            {isGroupOpen && (
                              <div className="border-t border-slate-100 bg-white">
                                {group.topics.length === 0 ? (
                                  <div className="py-2.5 pl-20 text-xs text-slate-400">소분류가 없습니다</div>
                                ) : (
                                  group.topics.map((topic) => (
                                    <div
                                      key={topic.id}
                                      className="flex items-center gap-3 py-2 pl-20 pr-4 hover:bg-slate-50 transition-colors"
                                    >
                                      <div className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                                      <span className="flex-1 text-sm text-slate-500">{topic.name}</span>
                                      <div className="flex shrink-0 gap-1">
                                        <button
                                          onClick={() => openForm({ type: 'topic', groupId: group.id, data: topic })}
                                          className="rounded px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                        >
                                          수정
                                        </button>
                                        <button
                                          onClick={() => handleDelete('topic', topic.id)}
                                          className="rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formTarget !== null}
        onClose={closeForm}
        title={getFormTitle()}
        size="sm"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="이름"
            placeholder="이름을 입력해주세요"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            disabled={isFormLoading}
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={isFormLoading || !formName.trim()} fullWidth>
              {isFormLoading ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm} disabled={isFormLoading} fullWidth>
              취소
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
