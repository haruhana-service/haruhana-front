import { getToken, onMessage, deleteToken, type MessagePayload, type Unsubscribe } from 'firebase/messaging'
import { getFirebaseMessaging } from '../utils/firebase'
import { syncDeviceToken, deleteDeviceToken } from './deviceService'
import { FCM_TOKEN_KEY, FCM_PERMISSION_DENIED_KEY } from '../constants'

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
 * 3. 백엔드에 동기화
 * @returns FCM 토큰 또는 null (실패 시)
 */
export async function requestAndSyncFCMToken(): Promise<string | null> {
  try {
    // 이전에 거부된 경우 다시 요청하지 않음
    if (wasPermissionDenied()) {
      console.log('[FCM] Permission previously denied, skipping')
      return null
    }

    const permission = await Notification.requestPermission()

    // 권한 거부 또는 미지원 시 처리
    if (permission === 'denied') {
      markPermissionDenied()
      console.log('[FCM] Permission denied by user')
      return null
    }

    if (permission !== 'granted') {
      console.log('[FCM] Permission not granted:', permission)
      return null
    }

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

    // 이전 토큰과 비교 (동일하면 API 호출 생략)
    const previousToken = localStorage.getItem(FCM_TOKEN_KEY)
    if (previousToken === currentToken) {
      console.log('[FCM] Token unchanged, skipping sync')
      return currentToken
    }

    // 백엔드에 토큰 동기화
    await syncDeviceToken(currentToken)

    // 로컬 스토리지에 저장
    localStorage.setItem(FCM_TOKEN_KEY, currentToken)

    console.log('[FCM] Token synced successfully')
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
  try {
    const messaging = getFirebaseMessaging()
    if (!messaging) {
      // Firebase 미사용 환경에서는 로컬 토큰만 정리
      localStorage.removeItem(FCM_TOKEN_KEY)
      return
    }
    await deleteToken(messaging)

    // 백엔드에서도 토큰 삭제
    await deleteDeviceToken()

    // 로컬 스토리지에서도 삭제
    localStorage.removeItem(FCM_TOKEN_KEY)

    console.log('[FCM] Token deleted successfully')
  } catch (error) {
    console.error('[FCM] Failed to delete token:', error)
    // 토큰 삭제 실패해도 로그아웃은 계속 진행하도록 에러를 로그하기만 함
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
