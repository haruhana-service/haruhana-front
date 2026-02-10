import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/utils'
import { SubmissionForm } from './SubmissionForm'
import type { SubmissionResponse } from '../../../types/models'

describe('SubmissionForm', () => {
  const mockSubmissionResponse: SubmissionResponse = {
    submissionId: 1,
    dailyProblemId: 1,
    userAnswer: '이것은 충분히 긴 테스트 답변입니다.',
    submittedAt: '2026-02-10T14:30:00Z',
    isOnTime: true,
    aiAnswer: 'AI가 생성한 예시 답변입니다.',
  }

  let mockOnSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn()
  })

  // ============================================
  // 4.2 답변 제출 폼 테스트
  // ============================================

  it('빈 답변 제출 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('답변은 최소 10자 이상이어야 합니다')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('10자 미만 답변 제출 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '짧은답변')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('답변은 최소 10자 이상이어야 합니다')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('10자 이상 답변 제출 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('이것은 충분히 긴 테스트 답변입니다.')
    })
  })

  it('제출 성공 시 AI 예시 답변을 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('AI 예시 답변')).toBeInTheDocument()
      expect(screen.getByText('AI가 생성한 예시 답변입니다.')).toBeInTheDocument()
    })
  })

  it('제출 성공 시 내 답변을 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('내 답변')).toBeInTheDocument()
      expect(screen.getByText('답변이 제출되었습니다!')).toBeInTheDocument()
    })
  })

  it('제시간 제출(isOnTime=true) 시 스트릭 증가 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue({ ...mockSubmissionResponse, isOnTime: true })

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/스트릭이 증가했습니다/)).toBeInTheDocument()
    })
  })

  it('늦은 제출(isOnTime=false) 시 스트릭 미반영 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue({ ...mockSubmissionResponse, isOnTime: false })

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/스트릭에 반영되지 않습니다/)).toBeInTheDocument()
    })
  })

  it('제출 실패 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockRejectedValue(new Error('서버 오류가 발생했습니다'))

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument()
    })
  })

  it('제출 중에는 버튼이 비활성화되고 "제출 중..." 텍스트를 표시한다', async () => {
    const user = userEvent.setup()
    // 느린 응답 시뮬레이션
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSubmissionResponse), 1000))
    )

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /제출하기/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('제출 중...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /제출 중/i })).toBeDisabled()
    })
  })

  // ============================================
  // 4.3 답변 수정 테스트
  // ============================================

  it('기존 답변이 있으면 폼에 미리 채워진다', () => {
    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    expect(textarea).toHaveValue('기존에 작성했던 답변입니다. 충분히 긴 답변.')
  })

  it('기존 답변이 있으면 "답변 수정" 제목을 표시한다', () => {
    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByText('답변 수정')).toBeInTheDocument()
  })

  it('기존 답변이 없으면 "답변 작성" 제목을 표시한다', () => {
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText('답변 작성')).toBeInTheDocument()
  })

  it('기존 답변이 있으면 "수정 완료" 버튼을 표시한다', () => {
    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByRole('button', { name: /수정 완료/i })).toBeInTheDocument()
  })

  it('기존 답변이 없으면 "제출하기" 버튼을 표시한다', () => {
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /제출하기/i })).toBeInTheDocument()
  })

  it('기존 답변을 수정하여 다시 제출할 수 있다', async () => {
    const user = userEvent.setup()
    const updatedResponse: SubmissionResponse = {
      ...mockSubmissionResponse,
      userAnswer: '수정된 답변입니다. 충분히 긴 수정된 답변.',
    }
    mockOnSubmit.mockResolvedValue(updatedResponse)

    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.clear(textarea)
    await user.type(textarea, '수정된 답변입니다. 충분히 긴 수정된 답변.')

    const submitButton = screen.getByRole('button', { name: /수정 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('수정된 답변입니다. 충분히 긴 수정된 답변.')
    })
  })

  it('기존 답변을 10자 미만으로 수정하면 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()

    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /답변/i })
    await user.clear(textarea)
    await user.type(textarea, '짧은')

    const submitButton = screen.getByRole('button', { name: /수정 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('답변은 최소 10자 이상이어야 합니다')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('수정 제출 성공 시 AI 답변을 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByRole('button', { name: /수정 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('AI 예시 답변')).toBeInTheDocument()
      expect(screen.getByText('AI가 생성한 예시 답변입니다.')).toBeInTheDocument()
      expect(screen.getByText('답변이 제출되었습니다!')).toBeInTheDocument()
    })
  })
})
