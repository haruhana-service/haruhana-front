import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'

// ============================================
// Firebase Singleton Instances
// ============================================

let firebaseApp: FirebaseApp | null = null
let messaging: Messaging | null = null

// ============================================
// Firebase Initialization
// ============================================

/**
 * Firebase 앱 인스턴스 가져오기 (싱글톤)
 * 첫 호출 시 초기화, 이후 호출은 캐시된 인스턴스 반환
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
    console.log('[Firebase] Initialized successfully')
  }
  return firebaseApp
}

/**
 * Firebase Cloud Messaging 인스턴스 가져오기 (싱글톤)
 * 첫 호출 시 초기화, 이후 호출은 캐시된 인스턴스 반환
 */
export function getFirebaseMessaging(): Messaging {
  if (!messaging) {
    messaging = getMessaging(getFirebaseApp())
    console.log('[Firebase] Messaging initialized successfully')
  }
  return messaging
}

/**
 * 환경 변수 검증
 * 필수 Firebase 설정이 모두 있는지 확인
 */
export function validateFirebaseConfig(): boolean {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_VAPID_KEY',
  ]

  const missing = required.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    console.error('[Firebase] Missing environment variables:', missing)
    return false
  }

  return true
}
