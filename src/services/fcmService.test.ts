import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('./fcmService')

const mockDeleteToken = vi.fn()
const mockDeleteDeviceToken = vi.fn()
const mockGetFirebaseMessaging = vi.fn()
const mockGetAccessToken = vi.fn()

vi.mock('firebase/messaging', () => ({
  deleteToken: mockDeleteToken,
  getToken: vi.fn(),
  onMessage: vi.fn(),
}))

vi.mock('./deviceService', () => ({
  syncDeviceToken: vi.fn(),
  deleteDeviceToken: mockDeleteDeviceToken,
}))

vi.mock('../utils/firebase', () => ({
  getFirebaseMessaging: mockGetFirebaseMessaging,
}))

vi.mock('./api', () => ({
  getAccessToken: mockGetAccessToken,
}))

describe('deleteFCMToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGetAccessToken.mockReturnValue('access-token')
  })

  it('Firebase 토큰 삭제가 실패해도 백엔드 삭제를 계속 시도한다', async () => {
    const { deleteFCMToken } = await import('./fcmService')

    mockGetFirebaseMessaging.mockReturnValue({ id: 'messaging' })
    mockDeleteToken.mockRejectedValue(new Error('firebase delete failed'))
    mockDeleteDeviceToken.mockResolvedValue(undefined)
    localStorage.setItem('haruharu_fcm_token', 'fcm-token')

    await deleteFCMToken()

    expect(mockDeleteToken).toHaveBeenCalledTimes(1)
    expect(mockDeleteDeviceToken).toHaveBeenCalledWith('fcm-token', 'access-token')
    expect(localStorage.getItem('haruharu_fcm_token')).toBeNull()
  })

  it('Firebase Messaging이 없어도 백엔드 삭제를 시도한다', async () => {
    const { deleteFCMToken } = await import('./fcmService')

    mockGetFirebaseMessaging.mockReturnValue(null)
    mockDeleteDeviceToken.mockResolvedValue(undefined)
    localStorage.setItem('haruharu_fcm_token', 'fcm-token')

    await deleteFCMToken()

    expect(mockDeleteToken).not.toHaveBeenCalled()
    expect(mockDeleteDeviceToken).toHaveBeenCalledWith('fcm-token', 'access-token')
    expect(localStorage.getItem('haruharu_fcm_token')).toBeNull()
  })

  it('로컬 디바이스 토큰이 없으면 오류를 던진다', async () => {
    const { deleteFCMToken } = await import('./fcmService')

    mockGetFirebaseMessaging.mockReturnValue(null)
    mockDeleteDeviceToken.mockResolvedValue(undefined)
    localStorage.removeItem('haruharu_fcm_token')

    await expect(deleteFCMToken()).rejects.toThrow('Device token missing')

    expect(mockDeleteToken).not.toHaveBeenCalled()
    expect(mockDeleteDeviceToken).not.toHaveBeenCalled()
    expect(localStorage.getItem('haruharu_fcm_token')).toBeNull()
  })
})
