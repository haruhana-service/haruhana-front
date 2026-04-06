import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { TodayPage } from './TodayPage'

// Mock hooks directly to avoid retry/animation issues
vi.mock('../features/problem/hooks/useTodayProblem')
vi.mock('../features/streak/hooks/useStreak')
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      loginId: 'testuser',
      nickname: 'Test User',
      createdAt: '2025-01-01T00:00:00Z',
      memberPreferences: [{ preferenceId: 1, categoryTopicName: 'React', difficulty: 'MEDIUM' }],
      role: 'ROLE_MEMBER' as const,
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    refetchProfile: vi.fn(),
  }),
}))

// Mock useCountUp to return target immediately
vi.mock('../hooks/useCountUp', () => ({
  useCountUp: ({ target }: { target: number }) => target,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Import the hooks after mocking
import { useTodayProblem } from '../features/problem/hooks/useTodayProblem'
import { useStreak } from '../features/streak/hooks/useStreak'

describe('TodayPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const mockProblem = {
    id: 1,
    title: 'React Hooks 이해하기',
    description: 'useState와 useEffect의 차이점을 설명하세요.',
    difficulty: 'MEDIUM',
    categoryTopicName: 'React',
    isSolved: false,
  }

  const mockStreak = {
    currentStreak: 5,
    maxStreak: 10,
    weeklySolvedStatus: [
      { date: '2025-01-06', isSolved: true },
      { date: '2025-01-07', isSolved: true },
      { date: '2025-01-08', isSolved: true },
      { date: '2025-01-09', isSolved: true },
      { date: '2025-01-10', isSolved: true },
      { date: '2025-01-11', isSolved: false },
      { date: '2025-01-12', isSolved: false },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockNavigate.mockClear()

    vi.mocked(useTodayProblem).mockReturnValue({
      data: [mockProblem],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    vi.mocked(useStreak).mockReturnValue({
      data: mockStreak,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as any)
  })

  it('페이지 헤더가 올바르게 렌더링된다', () => {
    render(<TodayPage />)

    expect(screen.getByText('오늘의 챌린지')).toBeInTheDocument()
  })

  it('로딩 중에 로딩 스피너를 표시한다', () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    expect(screen.getByText('Loading Next Goal...')).toBeInTheDocument()
  })

  it('문제 조회 성공 시 문제 카드를 표시한다', async () => {
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('React Hooks 이해하기')).toBeInTheDocument()
      expect(screen.getByText('useState와 useEffect의 차이점을 설명하세요.')).toBeInTheDocument()
    })
  })

  it('API 에러 발생 시 에러 메시지를 표시한다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('네트워크 오류가 발생했습니다'),
      isSuccess: false,
      isError: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('챌린지 불러오기 실패')).toBeInTheDocument()
    })
  })

  it('빈 문제 응답 에러 시 생성 지연 안내 문구를 표시한다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('EMPTY_TODAY_PROBLEM'),
      isSuccess: false,
      isError: true,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByText('오늘의 챌린지를 준비 중이에요')).toBeInTheDocument()
      expect(screen.getByText('문제 생성이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('해결하지 않은 문제는 "챌린지 시작하기" 버튼을 표시한다', async () => {
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /챌린지 시작/i })).toBeInTheDocument()
    })
  })

  it('해결한 문제는 "제출 기록 확인" 버튼을 표시한다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: [{ ...mockProblem, isSolved: true }],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제출 기록 확인/i })).toBeInTheDocument()
    })
  })

  it('"챌린지 시작하기" 버튼 클릭 시 문제 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /챌린지 시작/i })).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /챌린지 시작/i })
    await user.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/problem/1')
  })

  it('"제출 기록 확인" 버튼 클릭 시 문제 상세 페이지로 이동한다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: [{ ...mockProblem, isSolved: true }],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    const user = userEvent.setup()
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /제출 기록 확인/i })).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /제출 기록 확인/i })
    await user.click(button)

    expect(mockNavigate).toHaveBeenCalledWith('/problem/1')
  })

  it('스트릭 로딩 중 Loading... 텍스트를 표시한다', () => {
    vi.mocked(useStreak).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
    } as any)

    render(<TodayPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('스트릭 데이터가 없을 때 스트릭 정보를 불러올 수 없다는 메시지를 표시한다', () => {
    vi.mocked(useStreak).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    } as any)

    render(<TodayPage />)

    expect(screen.getByText('스트릭 정보를 불러올 수 없습니다.')).toBeInTheDocument()
  })

  it('문제 데이터가 없을 때 준비 중 메시지를 표시한다', () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    expect(screen.getByText('챌린지를 준비 중입니다.')).toBeInTheDocument()
  })

  it('에러 상태에서 다시 시도 버튼을 클릭하면 refetch가 호출된다', async () => {
    const mockRefetch = vi.fn()
    vi.mocked(useTodayProblem).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('network error'),
      isSuccess: false,
      isError: true,
      refetch: mockRefetch,
      isRefetching: false,
    } as any)

    const user = userEvent.setup()
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('미풀이 문제가 있을 때 리마인더 모달이 표시된다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: [{ ...mockProblem, isSolved: false }],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    render(<TodayPage />)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('아직 오늘의 문제를 풀지 않았어요')).toBeInTheDocument()
  })

  it('리마인더 모달에서 나중에 버튼 클릭 시 닫힌다', async () => {
    vi.mocked(useTodayProblem).mockReturnValue({
      data: [{ ...mockProblem, isSolved: false }],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    const user = userEvent.setup()
    render(<TodayPage />)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const laterButton = screen.getByRole('button', { name: '나중에' })
    await user.click(laterButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('사용자의 학습 주제와 난이도가 표시된다', async () => {
    render(<TodayPage />)

    await waitFor(() => {
      expect(screen.getAllByText('React').length).toBeGreaterThan(0)
      expect(screen.getAllByText('보통').length).toBeGreaterThan(0)
    })
  })
})
