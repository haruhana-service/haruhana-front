import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySelector } from './CategorySelector'
import * as categoryHooks from '../../hooks/useCategories'

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

    expect(screen.getByText('카테고리 목록을 불러오는 중...')).toBeInTheDocument()
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

    expect(screen.getByText('카테고리 목록을 불러오지 못했습니다')).toBeInTheDocument()
  })

  it('카테고리 선택 버튼을 렌더링한다', () => {
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

    expect(screen.getByRole('button', { name: '분야를 선택하세요' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '먼저 분야를 선택하세요' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '분류를 먼저 선택하세요' })).toBeDisabled()
  })

  it('그룹 버튼은 카테고리 선택 전에 비활성화된다', () => {
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

    expect(screen.getByRole('button', { name: '먼저 분야를 선택하세요' })).toBeDisabled()
  })

  it('토픽 버튼은 그룹 선택 전에 비활성화된다', () => {
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

    expect(screen.getByRole('button', { name: '분류를 먼저 선택하세요' })).toBeDisabled()
  })

  it('카테고리 선택 시 그룹 버튼이 활성화된다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const user = userEvent.setup()
    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    await user.click(screen.getByRole('button', { name: '분야를 선택하세요' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: '개발' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByRole('button', { name: '분류를 선택하세요' })).not.toBeDisabled()
  })

  it('그룹 선택 시 토픽 버튼이 활성화된다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const user = userEvent.setup()
    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    // Select category
    await user.click(screen.getByRole('button', { name: '분야를 선택하세요' }))
    const categoryDialog = await screen.findByRole('dialog')
    await user.click(within(categoryDialog).getByRole('button', { name: '개발' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    // Select group
    await user.click(screen.getByRole('button', { name: '분류를 선택하세요' }))
    const groupDialog = await screen.findByRole('dialog')
    await user.click(within(groupDialog).getByRole('button', { name: '백엔드' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    expect(screen.getByRole('button', { name: '주제를 선택하세요' })).not.toBeDisabled()
  })

  it('토픽 선택 시 onChange를 호출한다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const user = userEvent.setup()
    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    await user.click(screen.getByRole('button', { name: '분야를 선택하세요' }))
    const categoryDialog = await screen.findByRole('dialog')
    await user.click(within(categoryDialog).getByRole('button', { name: '개발' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    await user.click(screen.getByRole('button', { name: '분류를 선택하세요' }))
    const groupDialog = await screen.findByRole('dialog')
    await user.click(within(groupDialog).getByRole('button', { name: '백엔드' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    await user.click(screen.getByRole('button', { name: '주제를 선택하세요' }))
    const topicDialog = await screen.findByRole('dialog')
    await user.click(within(topicDialog).getByRole('button', { name: 'Spring' }))

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

    render(
      <CategorySelector
        value={100}
        onChange={mockOnChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '개발' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '백엔드' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Spring' })).toBeInTheDocument()
    })
  })

  it('여러 그룹 중에서 올바른 그룹을 선택한다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const user = userEvent.setup()
    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    await user.click(screen.getByRole('button', { name: '분야를 선택하세요' }))
    const dialog = await screen.findByRole('dialog')

    // Both groups should be shown when category dialog is open
    await user.click(within(dialog).getByRole('button', { name: '개발' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    // Click group button to open group dialog
    await user.click(screen.getByRole('button', { name: '분류를 선택하세요' }))
    const groupDialog = await screen.findByRole('dialog')

    expect(within(groupDialog).getByText('백엔드')).toBeInTheDocument()
    expect(within(groupDialog).getByText('프론트엔드')).toBeInTheDocument()
  })

  it('전체 선택 흐름을 완료할 수 있다', async () => {
    mockUseCategories({
      data: mockCategoriesData,
      isLoading: false,
      isError: false,
    })

    const user = userEvent.setup()
    render(
      <CategorySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    // 1단계: 카테고리 선택 → onChange(0) 호출
    await user.click(screen.getByRole('button', { name: '분야를 선택하세요' }))
    const categoryDialog = await screen.findByRole('dialog')
    await user.click(within(categoryDialog).getByRole('button', { name: '개발' }))
    expect(mockOnChange).toHaveBeenCalledWith(0)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    // 2단계: 그룹 선택 → onChange(0) 호출
    await user.click(screen.getByRole('button', { name: '분류를 선택하세요' }))
    const groupDialog = await screen.findByRole('dialog')
    await user.click(within(groupDialog).getByRole('button', { name: '백엔드' }))
    expect(mockOnChange).toHaveBeenCalledWith(0)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 1000 })

    // 3단계: 토픽 선택 → onChange(100) 호출
    mockOnChange.mockClear()
    await user.click(screen.getByRole('button', { name: '주제를 선택하세요' }))
    const topicDialog = await screen.findByRole('dialog')
    await user.click(within(topicDialog).getByRole('button', { name: 'Spring' }))
    expect(mockOnChange).toHaveBeenCalledWith(100)
  })
})
