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
  const response = await api.get<{ data: CategoryListResponse }>('/v1/categories')
  // API 응답이 { data: { categories: [...] } } 형태로 중첩되어 옴
  return response.data.data
}
