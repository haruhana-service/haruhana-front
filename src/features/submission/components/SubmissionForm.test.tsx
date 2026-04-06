import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/utils'
import { SubmissionForm } from './SubmissionForm'
import type { SubmissionResponse, FeedbackResponse } from '../../../types/models'

const mockFeedback: FeedbackResponse = {
  feedbackId: 1,
  grade: 'GOOD',
  strengths: '핵심 개념을 잘 이해했습니다',
  weaknesses: '더 자세한 설명이 필요합니다',
  suggestion: '실제 코드 예시를 추가해보세요',
  gradedAt: '2026-02-10T14:31:00Z',
}

// 폴링 훅 모킹 - 테스트마다 상태를 제어
let feedbackState: { feedback: FeedbackResponse | null; isPolling: boolean; isTimeout: boolean } = {
  feedback: null,
  isPolling: false,
  isTimeout: false,
}

vi.mock('../hooks/useSubmissionFeedback', () => ({
  useSubmissionFeedback: () => feedbackState,
}))

describe('SubmissionForm', () => {
  const mockSubmissionResponse: SubmissionResponse = {
    submissionId: 1,
    dailyProblemId: 1,
    userAnswer: '이것은 충분히 긴 테스트 답변입니다.',
    submittedAt: '2026-02-10T14:30:00Z',
    isOnTime: true,
    aiAnswer: 'AI가 생성한 예시 답변입니다.',
  }

  let mockOnSubmit: Mock<(answer: string) => Promise<SubmissionResponse>>

  beforeEach(() => {
    mockOnSubmit = vi.fn() as Mock<(answer: string) => Promise<SubmissionResponse>>
    feedbackState = { feedback: null, isPolling: false, isTimeout: false }
  })

  // ============================================
  // 답변 제출 폼 테스트
  // ============================================

  it('빈 답변 제출 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('답변은 최소 10자 이상이어야 합니다')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('10자 미만 답변 제출 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '짧은답변')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
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

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('이것은 충분히 긴 테스트 답변입니다.')
    })
  })

  it('제출 성공 시 채점 중 상태를 표시한다', async () => {
    const user = userEvent.setup()
    feedbackState = { feedback: null, isPolling: true, isTimeout: false }
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('내가 제출한 답변')).toBeInTheDocument()
      expect(screen.getByText('AI 채점 중...')).toBeInTheDocument()
    })
  })

  it('피드백 도착 시 구조화된 채점 결과를 표시한다', async () => {
    const user = userEvent.setup()
    feedbackState = { feedback: mockFeedback, isPolling: false, isTimeout: false }
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('AI 멘토의 채점 결과')).toBeInTheDocument()
      expect(screen.getByText('잘한 점')).toBeInTheDocument()
      expect(screen.getByText('핵심 개념을 잘 이해했습니다')).toBeInTheDocument()
      expect(screen.getByText('부족한 점')).toBeInTheDocument()
      expect(screen.getByText('더 자세한 설명이 필요합니다')).toBeInTheDocument()
      expect(screen.getByText('개선 방향')).toBeInTheDocument()
      expect(screen.getByText('실제 코드 예시를 추가해보세요')).toBeInTheDocument()
    })
  })

  it('제출 성공 시 내 답변을 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('내가 제출한 답변')).toBeInTheDocument()
      expect(screen.getByText('이것은 충분히 긴 테스트 답변입니다.')).toBeInTheDocument()
    })
  })

  it('채점 타임아웃 시 안내 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    feedbackState = { feedback: null, isPolling: false, isTimeout: true }
    mockOnSubmit.mockResolvedValue(mockSubmissionResponse)

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/채점에 시간이 오래 걸리고 있어요/)).toBeInTheDocument()
    })
  })

  it('제출 실패 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockRejectedValue(new Error('서버 오류가 발생했습니다'))

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충분히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument()
    })
  })

  it('제출 중에는 버튼이 비활성화되고 "제출 중..." 텍스트를 표시한다', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSubmissionResponse), 1000))
    )

    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.type(textarea, '이것은 충뵘4히 긴 테스트 답변입니다.')

    const submitButton = screen.getByRole('button', { name: /오늘의 챌린지 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('제출 중...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /제출 중/i })).toBeDisabled()
    })
  })

  // ============================================
  // 답변 수정 테스트
  // ============================================

  it('기존 답변이 있으면 폼에 미리 채워진다', () => {
    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충분히 긴 답변."
        onSubmit={mockOnSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    expect(textarea).toHaveValue('기존에 작성했던 답변입니다. 충분히 긴 답변.')
  })

  it('기존 답변이 있으면 "나의 생각 정리하기" 제목을 표시한다', () => {
    render(
      <SubmissionForm
        existingAnswer="기존에 작성했던 답변입니다. 충뵘4히 긴 당변."
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByText('나의 생각 정리하기')).toBeInTheDocument()
  })

  it('기존 답변이 없으면 "나의 생각 정리하기" 제목을 표시한다', () => {
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText('나의 생각 정리하기')).toBeInTheDocument()
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

  it('기존 답변이 없으면 "오늘의 챌린지 완료!" 버튼을 표시한다', () => {
    render(<SubmissionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('button', { name: /오늘의 챌린지 완료/i })).toBeInTheDocument()
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

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
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

    const textarea = screen.getByPlaceholderText(/답변을 입력해주세요/i)
    await user.clear(textarea)
    await user.type(textarea, '짧은')

    const submitButton = screen.getByRole('button', { name: /수정 완료/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('답변은 최소 10자 이상이어야 합니다')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('수정 제출 성공 후 내 답변과 채점 로딩을 표시한다', async () => {
    const user = userEvent.setup()
    feedbackState = { feedback: null, isPolling: true, isTimeout: false }
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
      expect(screen.getByText('내가 제출한 답변')).toBeInTheDocument()
      expect(screen.getByText('AI 채점 중...')).toBeInTheDocument()
    })
  })
})
