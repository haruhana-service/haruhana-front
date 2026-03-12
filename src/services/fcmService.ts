import { getToken, onMessage, deleteToken, type MessagePayload, type Unsubscribe } from 'firebase/messaging'
import { getFirebaseMessaging } from '../utils/firebase'
import { syncDeviceToken, deleteDeviceToken } from './deviceService'
import { FCM_TOKEN_KEY, FCM_PERMISSION_DENIED_KEY } from '../constants'
import { getAccessToken } from './api'

// ============================================
// FCM Service Types
// ============================================

export type MessageCallback = (payload: MessagePayload) => void

// ============================================
// FCM Permission Management
// ============================================

/**
 * 현재 알림 권한 상태 조회
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission
}

/**
 * 이전에 알림 권한이 거부되었는지 확인
 */
export function wasPermissionDenied(): boolean {
  return localStorage.getItem(FCM_PERMISSION_DENIED_KEY) === 'true'
}

/**
 * 알림 권한 거부 상태 기록
 */
function markPermissionDenied(): void {
  localStorage.setItem(FCM_PERMISSION_DENIED_KEY, 'true')
}

/**
 * 알림 권한 거부 상태 해제
 */
function clearPermissionDenied(): void {
  localStorage.removeItem(FCM_PERMISSION_DENIED_KEY)
}

// ============================================
// FCM Token Management
// ============================================

/**
 * Service Worker 등록 가져오기
 */
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready
    } catch (error) {
      console.error('[FCM] Service worker not ready:', error)
      return undefined
    }
  }
  return undefined
}

/**
 * FCM 토큰 요청 및 백엔드 동기화
 * 1. 권한 요청
 * 2. FCM 토큰 획득
 * 3. 백엔드에 동기화 (로그인 시 강제, 그 외에는 변경 시에만)
 * @returns FCM 토큰 또는 null (실패 시)
 */
export interface RequestAndSyncFCMTokenOptions {
  forceSync?: boolean
}

export async function requestAndSyncFCMToken(options: RequestAndSyncFCMTokenOptions = {}): Promise<string | null> {
  try {
    const currentPermission = getNotificationPermission()

    // 현재 권한이 거부 상태면 즉시 종료
    if (currentPermission === 'denied') {
      markPermissionDenied()
      console.log('[FCM] Permission denied by user')
      return null
    }

    // 이전에 거부한 기록이 있고, 현재도 허용이 아니면 재요청하지 않음
    if (wasPermissionDenied() && currentPermission !== 'granted') {
      console.log('[FCM] Permission previously denied, skipping')
      return null
    }

    // 이미 허용된 경우는 재요청 없이 진행
    let permission: NotificationPermission = currentPermission
    if (permission !== 'granted') {
      permission = await Notification.requestPermission()
    }

    // 권한 거부 또는 미지원 시 처리
    if (permission !== 'granted') {
      console.log('[FCM] Permission not granted:', permission)
      return null
    }

    // 권한이 허용되었으면 거부 플래그 제거
    clearPermissionDenied()

    // FCM 토큰 획득
    const messaging = getFirebaseMessaging()
    if (!messaging) {
      console.warn('[FCM] Firebase Messaging not available')
      return null
    }
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

    const swRegistration = await getServiceWorkerRegistration()
    if (!swRegistration) {
      console.warn('[FCM] Service Worker not registered, cannot get token')
      return null
    }

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    })

    if (!currentToken) {
      console.log('[FCM] No token available')
      return null
    }

    const accessToken = getAccessToken()
    const savedToken = getSavedFCMToken()
    const shouldSync = options.forceSync || !savedToken || savedToken !== currentToken

    if (shouldSync) {
      await syncDeviceToken(currentToken, accessToken ?? undefined)
      console.log('[FCM] Token synced successfully')
    } else {
      console.log('[FCM] Token unchanged, skipping backend sync')
    }

    // 로컬 스토리지에 저장
    localStorage.setItem(FCM_TOKEN_KEY, currentToken)
    return currentToken
  } catch (error) {
    console.error('[FCM] Failed to request/sync token:', error)
    return null
  }
}

/**
 * FCM 토큰 삭제 (로그아웃 시 호출)
 */
export async function deleteFCMToken(): Promise<void> {
  const accessToken = getAccessToken()
  const messaging = getFirebaseMessaging()
  const deviceToken = getSavedFCMToken()

  try {
    if (messaging) {
      await deleteToken(messaging)
      console.log('[FCM] Firebase token deleted')
    } else {
      console.log('[FCM] Firebase Messaging not available, skipping SDK token delete')
    }
  } catch (error) {
    console.error('[FCM] Failed to delete Firebase token:', error)
  }

  try {
    if (!accessToken) {
      console.warn('[FCM] Access token missing, skipping backend token delete')
    } else if (!deviceToken) {
      throw new Error('Device token missing')
    } else {
      await deleteDeviceToken(deviceToken, accessToken)
      console.log('[FCM] Backend token deleted')
    }
  } catch (error) {
    console.error('[FCM] Failed to delete backend token:', error)
  } finally {
    localStorage.removeItem(FCM_TOKEN_KEY)
    console.log('[FCM] Local token deleted')
  }
}

/**
 * 저장된 FCM 토큰 가져오기 (이미 동기화된 토큰)
 */
export function getSavedFCMToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY)
}

// ============================================
// FCM Message Handling
// ============================================

/**
 * Foreground 메시지 리스너 등록
 * 앱이 포커스 상태일 때 메시지 수신
 * @param callback 메시지 수신 시 호출할 콜백
 * @returns 리스너 해제 함수
 */
export function onMessageReceived(callback: MessageCallback): Unsubscribe | null {
  const messaging = getFirebaseMessaging()
  if (!messaging) {
    console.warn('[FCM] Firebase Messaging not available, skipping foreground listener')
    return null
  }
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message received:', payload)
    callback(payload)
  })
}
