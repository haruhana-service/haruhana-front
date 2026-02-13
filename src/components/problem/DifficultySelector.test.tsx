import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DifficultySelector } from './DifficultySelector'
import type { Difficulty } from '../../types/models'

describe('DifficultySelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('세 가지 난이도 옵션을 렌더링한다', () => {
    render(
      <DifficultySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('쉬움')).toBeInTheDocument()
    expect(screen.getByText('보통')).toBeInTheDocument()
    expect(screen.getByText('어려움')).toBeInTheDocument()
  })

  it('각 난이도마다 설명을 표시한다', () => {
    render(
      <DifficultySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('기초적인 개념과 간단한 문제')).toBeInTheDocument()
    expect(screen.getByText('실무에 필요한 중급 수준의 문제')).toBeInTheDocument()
    expect(screen.getByText('심화 학습과 복잡한 문제')).toBeInTheDocument()
  })

  it('난이도 버튼 클릭 시 onChange를 호출한다', async () => {
    const user = userEvent.setup()
    render(
      <DifficultySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    const easyButton = screen.getByRole('button', { name: /쉬움/i })
    await user.click(easyButton)

    expect(mockOnChange).toHaveBeenCalledWith('EASY')
  })

  it('선택된 난이도는 aria-pressed="true"를 가진다', () => {
    render(
      <DifficultySelector
        value="MEDIUM"
        onChange={mockOnChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    const mediumButton = buttons.find(btn => btn.textContent?.includes('보통'))

    expect(mediumButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('선택되지 않은 난이도는 aria-pressed="false"를 가진다', () => {
    render(
      <DifficultySelector
        value="EASY"
        onChange={mockOnChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    const hardButton = buttons.find(btn => btn.textContent?.includes('어려움'))

    expect(hardButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('에러 메시지를 표시한다', () => {
    render(
      <DifficultySelector
        value={undefined}
        onChange={mockOnChange}
        error="난이도를 선택해주세요"
      />
    )

    expect(screen.getByText('난이도를 선택해주세요')).toBeInTheDocument()
  })

  it('모든 난이도 버튼을 클릭할 수 있다', async () => {
    const user = userEvent.setup()
    const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

    render(
      <DifficultySelector
        value={undefined}
        onChange={mockOnChange}
      />
    )

    for (const difficulty of difficulties) {
      mockOnChange.mockClear()
      const buttons = screen.getAllByRole('button')
      const difficultyIndex = difficulties.indexOf(difficulty)
      await user.click(buttons[difficultyIndex])
      expect(mockOnChange).toHaveBeenCalledWith(difficulty)
    }
  })

  it('선택된 난이도를 업데이트할 수 있다', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DifficultySelector
        value="EASY"
        onChange={mockOnChange}
      />
    )

    let buttons = screen.getAllByRole('button')
    const mediumButton = buttons.find(btn => btn.textContent?.includes('보통'))!
    await user.click(mediumButton)

    expect(mockOnChange).toHaveBeenCalledWith('MEDIUM')

    rerender(
      <DifficultySelector
        value="MEDIUM"
        onChange={mockOnChange}
      />
    )

    buttons = screen.getAllByRole('button')
    const updatedMediumButton = buttons.find(btn => btn.textContent?.includes('보통'))
    expect(updatedMediumButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('에러가 없을 때는 에러 메시지를 표시하지 않는다', () => {
    render(
      <DifficultySelector
        value="EASY"
        onChange={mockOnChange}
      />
    )

    const errorElements = screen.queryAllByRole('status')
    expect(errorElements).not.toContainEqual(expect.objectContaining({
      textContent: expect.stringMatching(/난이도/)
    }))
  })
})
