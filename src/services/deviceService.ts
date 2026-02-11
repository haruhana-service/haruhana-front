import api from './api'
import type { DeviceTokenSyncRequest } from '../types/models'

// ============================================
// Device API Service (FCM Device Token)
// ============================================

/**
 * FCM 디바이스 토큰 동기화
 * PATCH /v1/members/devices
 * @param deviceToken - FCM 토큰
 */
export async function syncDeviceToken(deviceToken: string): Promise<void> {
  const data: DeviceTokenSyncRequest = { deviceToken }
  await api.patch('/v1/members/devices', data)
}

/**
 * FCM 디바이스 토큰 삭제
 * DELETE /v1/members/devices
 */
export async function deleteDeviceToken(): Promise<void> {
  await api.delete('/v1/members/devices')
}
