import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../services/categoryService'
import { QUERY_KEYS } from '../constants'

/**
 * 카테고리 목록 조회 훅
 */
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30분간 fresh (카테고리는 자주 변경되지 않음)
  })
}
