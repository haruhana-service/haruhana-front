import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authService from './authService'

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../../../services/api'

const mockProfile = {
  loginId: 'testuser',
  nickname: '테스트유저',
  createdAt: '2025-01-01T00:00:00',
  categoryTopicName: 'Spring',
  difficulty: 'MEDIUM' as const,
  role: 'ROLE_MEMBER' as const,
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signup', () => {
    it('회원가입 후 생성된 회원 ID를 반환한다', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { data: 1 } })

      const result = await authService.signup({
        loginId: 'testuser',
        password: 'password123',
        nickname: '테스트유저',
        categoryTopicId: 1,
        difficulty: 'EASY',
      })

      expect(result).toBe(1)
      expect(api.post).toHaveBeenCalledWith('/v1/members/sign-up', expect.any(Object))
    })
  })

  describe('checkLoginIdAvailability', () => {
    it('로그인 ID 사용 가능 여부를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: true } })

      const result = await authService.checkLoginIdAvailability('testuser')

      expect(result).toBe(true)
      expect(api.get).toHaveBeenCalledWith('/v1/members/login-id', expect.objectContaining({
        params: { loginId: 'testuser' },
      }))
    })
  })

  describe('checkNicknameAvailability', () => {
    it('닉네임 사용 가능 여부를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: false } })

      const result = await authService.checkNicknameAvailability('nickname')

      expect(result).toBe(false)
      expect(api.get).toHaveBeenCalledWith('/v1/members/nickname', expect.objectContaining({
        params: { nickname: 'nickname' },
      }))
    })
  })

  describe('login', () => {
    it('로그인 후 토큰을 반환한다', async () => {
      const tokenResponse = { accessToken: 'token', refreshToken: 'refresh' }
      vi.mocked(api.post).mockResolvedValue({ data: { data: tokenResponse } })

      const result = await authService.login({ loginId: 'testuser', password: 'password123' })

      expect(result).toEqual(tokenResponse)
      expect(api.post).toHaveBeenCalledWith('/v1/auth/login', expect.any(Object))
    })
  })

  describe('logout', () => {
    it('액세스 토큰으로 로그아웃한다', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await authService.logout('access-token')

      expect(api.post).toHaveBeenCalledWith(
        '/v1/auth/logout',
        {},
        expect.objectContaining({ headers: { Authorization: 'Bearer access-token' } })
      )
    })

    it('토큰 없이 로그아웃 시 에러를 던진다', async () => {
      await expect(authService.logout(undefined)).rejects.toThrow('Access token missing')
    })
  })

  describe('deleteMember', () => {
    it('회원 탈퇴 API를 호출한다', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await authService.deleteMember()

      expect(api.delete).toHaveBeenCalledWith('/v1/members')
    })
  })

  describe('getProfile', () => {
    it('프로필 정보를 반환한다', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProfile } })

      const result = await authService.getProfile()

      expect(result).toEqual(mockProfile)
      expect(api.get).toHaveBeenCalledWith('/v1/members')
    })
  })

  describe('updateProfile', () => {
    it('프로필 업데이트 후 수정된 프로필을 반환한다', async () => {
      const updatedProfile = { ...mockProfile, nickname: '새닉네임' }
      vi.mocked(api.patch).mockResolvedValue({ data: { data: updatedProfile } })

      const result = await authService.updateProfile({ nickname: '새닉네임' })

      expect(result).toEqual(updatedProfile)
      expect(api.patch).toHaveBeenCalledWith('/v1/members', { nickname: '새닉네임' })
    })
  })

  describe('updatePreference', () => {
    it('학습 설정 업데이트 API를 호출한다', async () => {
      vi.mocked(api.patch).mockResolvedValue({})

      await authService.updatePreference({ difficulty: 'HARD', categoryTopicId: 1 })

      expect(api.patch).toHaveBeenCalledWith('/v1/members/preferences', { difficulty: 'HARD', categoryTopicId: 1 })
    })
  })
})
