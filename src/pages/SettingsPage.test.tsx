import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/utils'
import { SettingsPage } from './SettingsPage'
import * as authService from '../features/auth/services/authService'
import * as storageService from '../services/storageService'

vi.mock('../features/auth/services/authService', () => ({
  getProfile: vi.fn(),
  signup: vi.fn(),
  login: vi.fn(),
  updateProfile: vi.fn(),
  deleteMember: vi.fn(),
}))

vi.mock('../services/fcmService', () => ({
  getNotificationPermission: vi.fn().mockReturnValue('default'),
  getSavedFCMToken: vi.fn().mockReturnValue(null),
  requestAndSyncFCMToken: vi.fn(),
  deleteFCMToken: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../services/storageService', () => ({
  uploadProfileImage: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockLogout = vi.fn()
const mockRefetchProfile = vi.fn()
const mockUser = {
  loginId: 'testuser',
  nickname: '테스트유저',
  createdAt: '2025-01-01T00:00:00',
  memberPreferences: [{ preferenceId: 1, categoryTopicName: 'Spring', difficulty: 'MEDIUM' }],
  role: 'ROLE_MEMBER' as const,
  profileImageUrl: undefined as string | undefined,
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

    mockUser.nickname = '테스트유저'
    mockUser.memberPreferences = [{ preferenceId: 1, categoryTopicName: 'Spring', difficulty: 'MEDIUM' }]
    mockUser.profileImageUrl = undefined
  })

  it('사용자 프로필 정보가 올바르게 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('테스트유저님')).toBeInTheDocument()
    expect(screen.getByText('학습자 프로필')).toBeInTheDocument()
  })

  it('학습 설정 목록이 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText(/학습 설정/)).toBeInTheDocument()
    expect(screen.getByText('Spring')).toBeInTheDocument()
    expect(screen.getByText('보통')).toBeInTheDocument()
  })

  it('학습 설정 수정 버튼 클릭 시 편집 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: '수정' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/settings/preference/1',
      expect.objectContaining({ state: expect.any(Object) })
    )
  })

  it('프로필 수정 모드를 열고 닫을 수 있다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const editButton = screen.getByTitle('프로필 수정')
    await user.click(editButton)

    expect(screen.getByText('프로필 수정')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('닉네임 입력')).toBeInTheDocument()

    const cancelButtons = screen.getAllByRole('button', { name: '취소' })
    await user.click(cancelButtons[0])

    expect(screen.getByText('테스트유저님')).toBeInTheDocument()
  })

  it('프로필 수정 모드에서 닉네임을 변경하고 저장할 수 있다', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({
      ...mockUser,
      nickname: '새닉네임',
    })

    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByTitle('프로필 수정'))

    const nicknameInput = screen.getByPlaceholderText('닉네임 입력')
    await user.clear(nicknameInput)
    await user.type(nicknameInput, '새닉네임')

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

  it('알림 설정 섹션이 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('알림 설정')).toBeInTheDocument()
    expect(screen.getByText('푸시 알림')).toBeInTheDocument()
  })

  it('Notification 미지원 환경에서 안내 메시지를 표시한다', () => {
    render(<SettingsPage />)

    expect(screen.getByText('이 브라우저에서 지원하지 않습니다')).toBeInTheDocument()
  })

  it('가입일이 올바르게 표시된다', () => {
    render(<SettingsPage />)

    expect(screen.getByText(/가입/)).toBeInTheDocument()
  })

  it('프로필 이미지가 없을 때 닉네임 첫 글자가 표시된다', () => {
    render(<SettingsPage />)

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

    const file = new File(['image'], 'test.png', { type: 'image/png' })
    const fileInput = document.getElementById('profile-image-upload-edit') as HTMLInputElement
    await user.upload(fileInput, file)

    await user.click(screen.getByText('저장'))

    await waitFor(() => {
      // uploadProfileImage is called with (file, progressCallback)
      expect(storageService.uploadProfileImage).toHaveBeenCalledWith(file, expect.any(Function))
      expect(authService.updateProfile).toHaveBeenCalledWith({
        nickname: '테스트유저',
        profileImageKey: 'uploaded-image-key',
      })
    })
  })

  it('회원 탈퇴 버튼 클릭 시 탈퇴 다이얼로그가 열린다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    await user.click(deleteButtons[0])

    await screen.findByRole('dialog')
    expect(screen.getByText('정말 탈퇴하시겠어요?')).toBeInTheDocument()
  })

  it('탈퇴 다이얼로그에서 취소 버튼 클릭 시 닫힌다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    await user.click(deleteButtons[0])

    await screen.findByRole('dialog')

    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('탈퇴 사유 선택 후 탈퇴 문구 입력 시 탈퇴 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    await user.click(deleteButtons[0])

    await screen.findByRole('dialog')

    await user.click(screen.getByLabelText('기타'))

    const confirmInput = screen.getByPlaceholderText('탈퇴')
    await user.type(confirmInput, '탈퇴')

    const confirmButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    const confirmBtn = confirmButtons[confirmButtons.length - 1]
    expect(confirmBtn).not.toBeDisabled()
  })

  it('회원 탈퇴 성공 시 로그인 페이지로 이동한다', async () => {
    vi.mocked(authService.deleteMember).mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<SettingsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    await user.click(deleteButtons[0])

    await screen.findByRole('dialog')

    await user.click(screen.getByLabelText('기타'))

    const confirmInput = screen.getByPlaceholderText('탈퇴')
    await user.type(confirmInput, '탈퇴')

    const confirmButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    const confirmBtn = confirmButtons[confirmButtons.length - 1]
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(authService.deleteMember).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('회원 탈퇴 실패 시 다이얼로그가 닫힌다', async () => {
    vi.mocked(authService.deleteMember).mockRejectedValue(new Error('Delete failed'))

    const user = userEvent.setup()
    render(<SettingsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    await user.click(deleteButtons[0])

    await screen.findByRole('dialog')

    await user.click(screen.getByLabelText('기타'))

    const confirmInput = screen.getByPlaceholderText('탈퇴')
    await user.type(confirmInput, '탈퇴')

    const confirmButtons = screen.getAllByRole('button', { name: /회원 탈퇴/ })
    const confirmBtn = confirmButtons[confirmButtons.length - 1]
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(authService.deleteMember).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('학습 설정이 없을 때 안내 메시지가 표시된다', () => {
    mockUser.memberPreferences = []

    render(<SettingsPage />)

    expect(screen.getByText('학습 설정이 없습니다')).toBeInTheDocument()
  })
})
