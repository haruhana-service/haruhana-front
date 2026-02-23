import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { CategorySelector } from './CategorySelector'
import * as categoryHooks from '../../hooks/useCategories'

// Mock useCategories
vi.mock('../../hooks/useCategories', () => ({
  useCategories: vi.fn(),
}))

function mockUseCategories(overrides: Partial<ReturnType<typeof categoryHooks.useCategories>>) {
  vi.mocked(categoryHooks.useCategories).mockReturnValue(overrides as ReturnType<typeof categoryHooks.useCategories>)
}

const mockCategoriesData = {
  categories: [
    {
      id: 1,
      name: '개발',
      groups: [
        {
          id: 10,
          name: '백엔드',
          topics: [
            { id: 100, name: 'Spring' },
            { id: 101, name: 'Node.js' },
          ],
        },
        {
          id: 11,
          name: '프론트엔드',
          topics: [
            { id: 102, name: 'React' },
            { id: 103, name: 'Vue' },
          ],
        },
      ],
    },
    {
      id: 2,
      name: '알고리즘',
      groups: [
        {
          id: 20,
          name: 'BFS/DFS',
          topics: [
            { id: 200, name: 'Graph' },
            { id: 201, name: 'Tree' },
          ],
        },
      ],
    },
  ],
}

describe('CategorySelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('로딩 상태를 표시한다', () => {
    mockUseCategories({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('을 불러오는 중...')).toBeInTheDocument()
  })

  it('에러 상태를 표시한다', () => {
    mockUseCategories({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('을 불러오지 못했습니다')).toBeInTheDocument()
  })

  it('카테고리 드롭다운을 렌더링한다', () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const categorySelect = screen.getByLabelText(/1\. 분야/)
    expect(categorySelect).toBeInTheDocument()
    expect(screen.getByText('개발')).toBeInTheDocument()
    expect(screen.getByText('알고리즘')).toBeInTheDocument()
  })

  it('그룹 드롭다운은 카테고리 선택 전에는 비활성화된다', () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const groupSelect = screen.getByLabelText(/2\. 분류/)
    expect(groupSelect).toBeDisabled()
  })

  it('토픽 드롭다운은 그룹 선택 전에는 비활성화된다', () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const topicSelect = screen.getByLabelText(/3\. 주제/)
    expect(topicSelect).toBeDisabled()
  })

  it('카테고리 선택 시 그룹 드롭다운이 활성화된다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })

    const groupSelect = screen.getByLabelText(/2\. 분류/)
    expect(groupSelect).not.toBeDisabled()
  })

  it('그룹 선택 시 토픽 드롭다운이 활성화된다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })

    const groupSelect = screen.getByLabelText(/2\. 분류/) as HTMLSelectElement
    fireEvent.change(groupSelect, { target: { value: '10' } })

    const topicSelect = screen.getByLabelText(/3\. 주제/)
    expect(topicSelect).not.toBeDisabled()
  })

  it('토픽 선택 시 onChange를 호출한다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })

    const groupSelect = screen.getByLabelText(/2\. 분류/) as HTMLSelectElement
    fireEvent.change(groupSelect, { target: { value: '10' } })

    const topicSelect = screen.getByLabelText(/3\. 주제/) as HTMLSelectElement
    fireEvent.change(topicSelect, { target: { value: '100' } })

    expect(mockOnChange).toHaveBeenCalledWith(100)
  })

  it('에러 메시지를 표시한다', () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
        error="카테고리를 선택해주세요"
      />
    )

    expect(screen.getByText('카테고리를 선택해주세요')).toBeInTheDocument()
  })

  it('토픽 ID가 주어지면 해당 카테고리와 그룹을 자동 선택한다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const { rerender } = render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    // 토픽 ID 100을 전달 (Spring, 개발 > 백엔드에 속함)
    rerender(
      <CategorySelector
        value={100}
        onChange={mockOnChange}
      />
    )

    await waitFor(() => {
      const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
      expect(categorySelect.value).toBe('1')

      const groupSelect = screen.getByLabelText(/2\. 분류/) as HTMLSelectElement
      expect(groupSelect.value).toBe('10')
    })
  })

  it('여러 그룹 중에서 올바른 그룹을 선택한다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })

    expect(screen.getByText('백엔드')).toBeInTheDocument()
    expect(screen.getByText('프론트엔드')).toBeInTheDocument()
  })

  it('전체 선택 흐름을 완료할 수 있다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    // 1단계: 카테고리 선택
    const categorySelect = screen.getByLabelText(/1\. 분야/) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: '1' } })
    expect(mockOnChange).toHaveBeenCalledWith(0) // 카테고리 변경 시

    // 2단계: 그룹 선택
    const groupSelect = screen.getByLabelText(/2\. 분류/) as HTMLSelectElement
    fireEvent.change(groupSelect, { target: { value: '10' } })
    expect(mockOnChange).toHaveBeenCalledWith(0) // 그룹 변경 시

    // 3단계: 토픽 선택
    mockOnChange.mockClear()
    const topicSelect = screen.getByLabelText(/3\. 주제/) as HTMLSelectElement
    fireEvent.change(topicSelect, { target: { value: '100' } })
    expect(mockOnChange).toHaveBeenCalledWith(100)
  })
})
