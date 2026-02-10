import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './api'

// ============================================
// Query Client Configuration
// ============================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 쿼리 기본 옵션
      retry: 1, // 실패 시 1회만 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      staleTime: 1000 * 60 * 5, // 5분간 데이터를 fresh로 간주
      gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (cacheTime에서 변경됨)
    },
    mutations: {
      // 뮤테이션 에러 처리
      onError: (error) => {
        if (isApiError(error)) {
          console.error('Mutation Error:', error.message)
        } else {
          console.error('Unknown Error:', error)
        }
      },
    },
  },
})

// ============================================
// Query Client Utilities
// ============================================

/**
 * 특정 쿼리 무효화
 * @param queryKey - 무효화할 쿼리 키
 */
export function invalidateQuery(queryKey: readonly unknown[]): Promise<void> {
  return queryClient.invalidateQueries({ queryKey })
}

/**
 * 모든 쿼리 무효화
 */
export function invalidateAllQueries(): Promise<void> {
  return queryClient.invalidateQueries()
}

/**
 * 특정 쿼리 데이터 가져오기
 * @param queryKey - 쿼리 키
 */
export function getQueryData<T>(queryKey: readonly unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey)
}

/**
 * 특정 쿼리 데이터 설정
 * @param queryKey - 쿼리 키
 * @param data - 설정할 데이터
 */
export function setQueryData<T>(queryKey: readonly unknown[], data: T): void {
  queryClient.setQueryData<T>(queryKey, data)
}

/**
 * 모든 쿼리 캐시 제거
 */
export function clearAllQueries(): void {
  queryClient.clear()
}
