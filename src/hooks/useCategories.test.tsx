import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCategories } from './useCategories'
import * as categoryService from '../services/categoryService'
import type { CategoryListResponse } from '../types/models'

// Mock category service
vi.mock('../services/categoryService', () => ({
  getCategories: vi.fn(),
}))

describe('useCategories', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const mockCategories: CategoryListResponse = {
    categories: [
      {
        id: 1,
        name: 'Developer',
        groups: [
          {
            id: 1,
            name: 'BackEnd',
            topics: [
              { id: 1, name: 'Spring Boot' },
              { id: 2, name: 'Django' },
              { id: 3, name: 'Node.js' },
            ],
          },
          {
            id: 2,
            name: 'FrontEnd',
            topics: [
              { id: 4, name: 'React' },
              { id: 5, name: 'Vue' },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Infra/Cloud',
        groups: [
          {
            id: 3,
            name: 'Cloud',
            topics: [
              { id: 6, name: 'AWS' },
              { id: 7, name: 'GCP' },
            ],
          },
        ],
      },
    ],
  }

  it('카테고리 목록을 성공적으로 조회한다', async () => {
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCategories)
    expect(result.current.data?.categories).toHaveLength(2)
  })

  it('카테고리 계층 구조를 올바르게 반환한다', async () => {
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const developerCategory = result.current.data?.categories[0]
    expect(developerCategory?.name).toBe('Developer')
    expect(developerCategory?.groups).toHaveLength(2)

    const backendGroup = developerCategory?.groups[0]
    expect(backendGroup?.name).toBe('BackEnd')
    expect(backendGroup?.topics).toHaveLength(3)

    const springTopic = backendGroup?.topics[0]
    expect(springTopic?.name).toBe('Spring Boot')
  })

  it('API 에러 시 에러 상태를 반환한다', async () => {
    const error = new Error('카테고리를 불러올 수 없습니다')
    vi.mocked(categoryService.getCategories).mockRejectedValue(error)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeUndefined()
  })

  it('빈 카테고리 목록을 처리한다', async () => {
    const emptyCategories: CategoryListResponse = {
      categories: [],
    }

    vi.mocked(categoryService.getCategories).mockResolvedValue(emptyCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.categories).toHaveLength(0)
  })

  it('캐싱을 통해 중복 API 호출을 방지한다', async () => {
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

    const { result, rerender } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCallCount = vi.mocked(categoryService.getCategories).mock.calls.length
    expect(firstCallCount).toBe(1)

    // 리렌더링
    rerender()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // API 호출 횟수가 증가하지 않아야 함 (30분 캐싱)
    const secondCallCount = vi.mocked(categoryService.getCategories).mock.calls.length
    expect(secondCallCount).toBe(firstCallCount)
  })

  it('모든 카테고리가 올바른 ID를 가진다', async () => {
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const categories = result.current.data?.categories || []
    
    categories.forEach(category => {
      expect(category.id).toBeDefined()
      expect(typeof category.id).toBe('number')
      
      category.groups.forEach(group => {
        expect(group.id).toBeDefined()
        expect(typeof group.id).toBe('number')
        
        group.topics.forEach(topic => {
          expect(topic.id).toBeDefined()
          expect(typeof topic.id).toBe('number')
        })
      })
    })
  })

  it('중복된 카테고리 ID가 없다', async () => {
    vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const categories = result.current.data?.categories || []
    const categoryIds = categories.map(c => c.id)
    const uniqueCategoryIds = new Set(categoryIds)
    
    expect(categoryIds.length).toBe(uniqueCategoryIds.size)
  })
})
