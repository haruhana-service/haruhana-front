import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { SettingsPage } from './SettingsPage'
import * as authService from '../features/auth/services/authService'
import * as storageService from '../services/storageService'

// Mock auth service
vi.mock('../features/auth/services/authService', () => ({
  getProfile: vi.fn(),
  signup: vi.fn(),
  login: vi.fn(),
  updateProfile: vi.fn(),
}))

// Mock storage service
vi.mock('../services/storageService', () => ({
  uploadProfileImage: vi.fn(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useAuth
const mockLogout = vi.fn()
const mockRefetchProfile = vi.fn()
const mockUser = {
  loginId: 'testuser',
  nickname: '테스트유저',
  createdAt: '2025-01-01T00:00:00',
  categoryTopicName: 'Spring',
  difficulty: 'MEDIUM',
  profileImageUrl: undefined,
}

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: mockLogout,
    updateUser: vi.fn(),
    refetchProfile: mockRefetchProfile,
  }),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockLogout.mockClear()
    mockRefetchProfile.mockResolvedValue(undefined)

    // Reset user data
    mockUser.nickname = '테스트유저'
    mockUser.categoryTopicName = 'Spring'
    mockUser.difficulty = 'MEDIUM'
    mockUser.profileImageUrl = undefined
  })

  it('사용자 프로필 정보가 올바르게 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('테스트유저님')).toBeInTheDocument()
    expect(screen.getByText('학습자 프로필')).toBeInTheDocument()
  })

  it('현재 학습 설정이 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('현재 학습 설정')).toBeInTheDocument()
    expect(screen.getByText('보통 (심화)')).toBeInTheDocument()
    expect(screen.getByText('Spring')).toBeInTheDocument()
  })

  it('설정 변경 버튼 클릭 시 설정 편집 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByText('변경'))

    expect(mockNavigate).toHaveBeenCalledWith('/settings/preference')
  })

  it('프로필 수정 모드를 열고 닫을 수 있다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    // 수정 버튼 클릭 (title="프로필 수정")
    const editButton = screen.getByTitle('프로필 수정')
    await user.click(editButton)

    // 수정 모드 UI 표시
    expect(screen.getByText('프로필 수정')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('닉네임 입력')).toBeInTheDocument()

    // 취소 버튼 클릭 (버튼 역할의 "취소" 텍스트)
    const cancelButtons = screen.getAllByRole('button', { name: '취소' })
    await user.click(cancelButtons[0])

    // 일반 모드로 복귀
    expect(screen.getByText('테스트유저님')).toBeInTheDocument()
  })

  it('프로필 수정 모드에서 닉네임을 변경하고 저장할 수 있다', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...mockUser,
      nickname: '새닉네임',
    })

    const user = userEvent.setup()
    render(<SettingsPage />)

    // 수정 모드 진입
    await user.click(screen.getByTitle('프로필 수정'))

    // 닉네임 변경
    const nicknameInput = screen.getByPlaceholderText('닉네임 입력')
    await user.clear(nicknameInput)
    await user.type(nicknameInput, '새닉네임')

    // 저장
    await user.click(screen.getByText('저장'))

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        nickname: '새닉네임',
        profileImageKey: undefined,
      })
    })

    expect(mockRefetchProfile).toHaveBeenCalled()
  })

  it('빈 닉네임으로 저장 시도 시 저장 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByTitle('프로필 수정'))

    const nicknameInput = screen.getByPlaceholderText('닉네임 입력')
    await user.clear(nicknameInput)

    const saveButton = screen.getByText('저장')
    expect(saveButton).toBeDisabled()
  })

  it('로그아웃 버튼 클릭 시 로그아웃 함수가 호출된다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByText('서비스 로그아웃'))

    expect(mockLogout).toHaveBeenCalled()
  })

  it('알림 설정 섹션이 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('알림 설정')).toBeInTheDocument()
    expect(screen.getByText('푸시 알림')).toBeInTheDocument()
  })

  it('Notification 미지원 환경에서 안내 메시지를 표시한다', () => {
    render(<SettingsPage />)

    // jsdom에서는 Notification API가 없으므로 미지원 메시지 표시
    expect(screen.getByText('이 브라우저에서 지원하지 않습니다')).toBeInTheDocument()
  })

  it('가입일이 올바르게 표시된다', () => {
    render(<SettingsPage />)

    // formatDateKorean으로 포맷된 가입일 + "가입" 텍스트 확인
    expect(screen.getByText(/가입/)).toBeInTheDocument()
  })

  it('프로필 이미지가 없을 때 닉네임 첫 글자가 표시된다', () => {
    render(<SettingsPage />)

    // 닉네임 '테스트유저'의 첫 글자 '테'가 아바타로 표시
    const avatars = screen.getAllByText('테')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('프로필 업데이트 실패 시 에러가 처리된다', async () => {
    vi.mocked(authService.updateProfile).mockRejectedValue(new Error('Update failed'))

    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByTitle('프로필 수정'))

    const nicknameInput = screen.getByPlaceholderText('닉네임 입력')
    await user.clear(nicknameInput)
    await user.type(nicknameInput, '새닉네임')

    await user.click(screen.getByText('저장'))

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalled()
    })

    // 에러 후에도 수정 모드가 유지됨 (수정 모드를 종료하지 않음)
    expect(screen.getByPlaceholderText('닉네임 입력')).toBeInTheDocument()
  })

  it('이미지 업로드와 함께 프로필을 저장할 수 있다', async () => {
    vi.mocked(storageService.uploadProfileImage).mockResolvedValue('uploaded-image-key')
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...mockUser,
      nickname: '테스트유저',
      profileImageUrl: 'https://example.com/image.jpg',
    })

    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByTitle('프로필 수정'))

    // 파일 업로드 시뮬레이션
    const file = new File(['image'], 'test.png', { type: 'image/png' })
    const fileInput = document.getElementById('profile-image-upload-edit') as HTMLInputElement
    await user.upload(fileInput, file)

    await user.click(screen.getByText('저장'))

    await waitFor(() => {
      expect(storageService.uploadProfileImage).toHaveBeenCalledWith(file)
      expect(authService.updateProfile).toHaveBeenCalledWith({
        nickname: '테스트유저',
        profileImageKey: 'uploaded-image-key',
      })
    })
  })
})
