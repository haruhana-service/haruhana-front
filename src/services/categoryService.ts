import api from './api'
import type { CategoryListResponse } from '../types/models'

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
