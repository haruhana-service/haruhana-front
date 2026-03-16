import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as problemService from './problemService'

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import api from '../../../services/api'

const mockProblem = {
  id: 1,
  title: 'React Hooks 이해하기',
  description: 'useState와 useEffect의 차이점을 설명하세요.',
  difficulty: 'MEDIUM',
  categoryTopicName: 'React',
  isSolved: false,
}

const mockDetail = {
  id: 1,
  title: 'React Hooks 이해하기',
  description: 'useState와 useEffect의 차이점을 설명하세요.',
  difficulty: 'MEDIUM',
  categoryTopicName: 'React',
  isSolved: false,
  aiAnswer: 'useState는 상태 관리, useEffect는 사이드 이펙트 처리에 사용됩니다.',
}

const mockStreak = {
  currentStreak: 5,
  maxStreak: 10,
  weeklySolvedStatus: [],
}

describe('problemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTodayProblem', () => {
    it('오늘의 문제를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProblem } })

      const result = await problemService.getTodayProblem()

      expect(result).toEqual(mockProblem)
      expect(api.get).toHaveBeenCalledWith('/v1/daily-problem/today')
    })
  })

  describe('getDailyProblem', () => {
    it('날짜가 있을 때 해당 날짜의 문제를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProblem } })

      await problemService.getDailyProblem('2025-01-01')

      expect(api.get).toHaveBeenCalledWith('/v1/daily-problem', { params: { date: '2025-01-01' } })
    })

    it('날짜가 없을 때 빈 params로 요청한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProblem } })

      await problemService.getDailyProblem()

      expect(api.get).toHaveBeenCalledWith('/v1/daily-problem', { params: {} })
    })
  })

  describe('getProblemDetail', () => {
    it('문제 상세를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockDetail } })

      const result = await problemService.getProblemDetail(1)

      expect(result).toEqual(mockDetail)
      expect(api.get).toHaveBeenCalledWith('/v1/daily-problem/1')
    })
  })

  describe('submitSolution', () => {
    it('문제 풀이를 제출한다', async () => {
      const mockSubmission = { id: 1, answer: 'test', isOnTime: true }
      vi.mocked(api.post).mockResolvedValue({ data: { data: mockSubmission } })

      const result = await problemService.submitSolution(1, { userAnswer: 'test' })

      expect(result).toEqual(mockSubmission)
      expect(api.post).toHaveBeenCalledWith('/v1/daily-problem/1/submissions', { userAnswer: 'test' })
    })
  })

  describe('getStreak', () => {
    it('스트릭 정보를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockStreak } })

      const result = await problemService.getStreak()

      expect(result).toEqual(mockStreak)
      expect(api.get).toHaveBeenCalledWith('/v1/streaks')
    })
  })
})
