import api from './api'
import type {
  CategoryListResponse,
  CategoryCreateRequest,
  Category,
  CategoryGroupCreateRequest,
  CategoryTopicCreateRequest,
} from '../types/models'

// ============================================
// Category API Service
// ============================================

/**
 * 카테고리 목록 조회
 * GET /v1/categories
 */
export async function getCategories(): Promise<CategoryListResponse> {
  // API 응답: { result: "SUCCESS", data: { categories: [...] }, error: null }
  const response = await api.get<{ data: CategoryListResponse }>('/v1/categories')
  return response.data.data
}

/**
 * 카테고리 생성
 * POST /v1/admin/categories
 */
export async function createCategory(data: CategoryCreateRequest): Promise<Category> {
  const response = await api.post<{ data: Category }>('/v1/admin/categories', data)
  return response.data.data
}

/**
 * 카테고리 수정
 * PATCH /v1/admin/categories/{id}
 */
export async function updateCategory(id: number, data: CategoryCreateRequest): Promise<Category> {
  const response = await api.patch<{ data: Category }>(`/v1/admin/categories/${id}`, data)
  return response.data.data
}

/**
 * 카테고리 삭제
 * DELETE /v1/admin/categories/{id}
 */
export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/v1/admin/categories/${id}`)
}

/**
 * 카테고리 그룹 생성
 * POST /v1/admin/categories/groups
 */
export async function createCategoryGroup(
  data: CategoryGroupCreateRequest
): Promise<{ id: number }> {
  const response = await api.post<{ data: { id: number } }>(
    '/v1/admin/categories/groups',
    data
  )
  return response.data.data
}

/**
 * 카테고리 그룹 수정
 * PATCH /v1/admin/categories/groups/{groupId}
 */
export async function updateCategoryGroup(
  groupId: number,
  data: Omit<CategoryGroupCreateRequest, 'categoryId'>
): Promise<void> {
  await api.patch(`/v1/admin/categories/groups/${groupId}`, data)
}

/**
 * 카테고리 그룹 삭제
 * DELETE /v1/admin/categories/groups/{groupId}
 */
export async function deleteCategoryGroup(groupId: number): Promise<void> {
  await api.delete(`/v1/admin/categories/groups/${groupId}`)
}

/**
 * 카테고리 토픽 생성
 * POST /v1/admin/categories/topics
 */
export async function createCategoryTopic(
  data: CategoryTopicCreateRequest
): Promise<{ id: number }> {
  const response = await api.post<{ data: { id: number } }>(
    '/v1/admin/categories/topics',
    data
  )
  return response.data.data
}

/**
 * 카테고리 토픽 수정
 * PATCH /v1/admin/categories/topics/{topicId}
 */
export async function updateCategoryTopic(
  topicId: number,
  data: Omit<CategoryTopicCreateRequest, 'groupId'>
): Promise<void> {
  await api.patch(`/v1/admin/categories/topics/${topicId}`, data)
}

/**
 * 카테고리 토픽 삭제
 * DELETE /v1/admin/categories/topics/{topicId}
 */
export async function deleteCategoryTopic(topicId: number): Promise<void> {
  await api.delete(`/v1/admin/categories/topics/${topicId}`)
}
