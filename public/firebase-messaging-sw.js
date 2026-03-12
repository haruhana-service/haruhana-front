/* global importScripts, firebase */

/**
 * Firebase Cloud Messaging Service Worker
 * 백그라운드에서 푸시 메시지를 수신하고 처리합니다
 *
 * 주의: 이 파일은 Vite를 통해 처리되지 않으므로
 * Firebase SDK를 CDN에서 로드합니다
 */

// Firebase SDK 로드 (compat 버전)
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyB1fyEoXol2OAXgz1YZaS7vhmU1Mv7h4Z4',
  authDomain: 'haruhana-22767.firebaseapp.com',
  projectId: 'haruhana-22767',
  storageBucket: 'haruhana-22767.firebasestorage.app',
  messagingSenderId: '487581121426',
  appId: '1:487581121426:web:724307ca7bae68a2679f4b',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM-SW] Background message received:', payload)

    const notificationTitle = payload.notification?.title || '하루하루'
    const notificationBody = payload.notification?.body || ''
    const notificationIcon = payload.notification?.icon || '/pwa-192x192.png'
    const notificationBadge = '/pwa-64x64.png'

    const notificationOptions = {
      body: notificationBody,
      icon: notificationIcon,
      badge: notificationBadge,
      tag: 'fcm-notification',
      requireInteraction: false,
      data: payload.data || {},
    }

    // 네이티브 알림 표시
    return self.registration.showNotification(notificationTitle, notificationOptions)
  })

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM-SW] Notification clicked:', event)

  const notification = event.notification
  const data = notification.data || {}
  const problemId = data.problemId

  // 알림 닫기
  notification.close()

  // 클릭 시 이동할 URL 결정
  let urlToOpen = '/'
  if (problemId) {
    urlToOpen = `/problem/${problemId}`
  }

  // 기존 클라이언트 중 문제 URL이 있으면 포커스
  // 없으면 새 윈도우 열기
  // 절대 URL로 변환 (client.url은 항상 절대 URL이므로 비교를 위해 맞춤)
  const targetUrl = new URL(urlToOpen, self.location.origin).href

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // 기존 윈도우 찾기
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus()
          }
        }

        // 없으면 새 윈도우 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})
