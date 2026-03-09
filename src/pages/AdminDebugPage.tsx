import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTES } from '../constants'

const INTERVAL_OPTIONS = [
  { label: '5분', value: 5 * 60 * 1000 },
  { label: '10분', value: 10 * 60 * 1000 },
  { label: '30분', value: 30 * 60 * 1000 },
  { label: '1시간', value: 60 * 60 * 1000 },
] as const

export function AdminDebugPage() {
  const navigate = useNavigate()
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [isReminderRunning, setIsReminderRunning] = useState(false)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [intervalMs, setIntervalMs] = useState(INTERVAL_OPTIONS[3].value)
  const intervalRef = useRef<number | null>(null)

  const isNotificationSupported = useMemo(() => typeof Notification !== 'undefined', [])
  const platformLabel = useMemo(() => {
    const ua = navigator.userAgent || ''
    if (/Mac|iPhone|iPad|iPod/i.test(ua)) return 'Apple (macOS/iOS)'
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Android/i.test(ua)) return 'Android'
    return 'Unknown'
  }, [])
  const serviceWorkerSupported = useMemo(() => 'serviceWorker' in navigator, [])
  const displayMode = useMemo(() => {
    if (typeof window === 'undefined') return 'unknown'
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone'
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui'
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen'
    return 'browser'
  }, [])
  const isChrome = useMemo(() => {
    const ua = navigator.userAgent || ''
    const isChromium = /Chrome|Chromium|Edg/i.test(ua)
    const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)
    return isChromium && !isSafari
  }, [])

  useEffect(() => {
    if (!isNotificationSupported) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)
  }, [isNotificationSupported])

  const updatePermission = (next: NotificationPermission) => {
    setPermission(next)
  }

  const requestPermission = async () => {
    console.log('[AdminDebug] Requesting notification permission')
    if (!isNotificationSupported) {
      toast.error('이 환경에서는 알림을 지원하지 않습니다.')
      console.log('[AdminDebug] Notification not supported')
      return
    }
    try {
      const result = await Notification.requestPermission()
      updatePermission(result)
      console.log('[AdminDebug] Permission result:', result)
      if (result !== 'granted') {
        toast.error(`알림 권한이 허용되지 않았습니다: ${result}`)
      }
    } catch (error) {
      console.error('[AdminDebug] Permission request failed:', error)
      toast.error(`알림 권한 요청 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  const requestAndSendNow = async () => {
    console.log('[AdminDebug] Request and send now')
    try {
      if (!isNotificationSupported) {
        toast.error('이 환경에서는 알림을 지원하지 않습니다.')
        console.log('[AdminDebug] Notification not supported')
        return
      }
      if (Notification.permission !== 'granted') {
        await requestPermission()
      }
      if (Notification.permission !== 'granted') {
        toast.error('알림 권한이 필요합니다.')
        console.log('[AdminDebug] Permission not granted, aborting')
        return
      }
      sendTestNotification()
    } catch (error) {
      console.error('[AdminDebug] Request and send now failed:', error)
      toast.error(`즉시 알림 요청 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  const sendTestNotification = () => {
    console.log('[AdminDebug] Sending test notification')
    const title = '알림 테스트'
    const body = '디버그 페이지에서 발송된 테스트 알림입니다.'
    const handleClick = () => {
      console.log('[AdminDebug] Notification clicked -> navigate to today')
      window.focus()
      navigate(ROUTES.TODAY)
    }

    try {
      if (isNotificationSupported && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-64x64.png',
          tag: 'haru-debug-notification',
        })
        notification.onclick = handleClick
        console.log('[AdminDebug] Native notification dispatched')
      } else {
        if (!isNotificationSupported) {
          toast.error('알림을 지원하지 않는 환경입니다. 인앱 알림으로 대체합니다.')
          console.log('[AdminDebug] Notification not supported, fallback to toast')
        } else if (Notification.permission !== 'granted') {
          toast.error(`알림 권한이 허용되지 않았습니다: ${Notification.permission}. 인앱 알림으로 대체합니다.`)
          console.log('[AdminDebug] Permission not granted, fallback to toast:', Notification.permission)
        }
        toast.info(title, {
          description: body,
          duration: 6000,
          action: {
            label: '오늘 문제',
            onClick: handleClick,
          },
        })
        console.log('[AdminDebug] Toast notification dispatched')
      }
    } catch (error) {
      console.error('[AdminDebug] Notification dispatch failed:', error)
      toast.error(`알림 발송 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }

    const now = new Date().toLocaleString('ko-KR')
    setLastSentAt(now)
    console.log('[AdminDebug] Last sent at updated:', now)
  }

  const startReminder = () => {
    console.log('[AdminDebug] Starting reminder interval')
    if (intervalRef.current) {
      toast.error('주기 알림이 이미 실행 중입니다.')
      console.log('[AdminDebug] Reminder already running')
      return
    }
    try {
      sendTestNotification()
      intervalRef.current = window.setInterval(sendTestNotification, intervalMs)
      setIsReminderRunning(true)
      console.log('[AdminDebug] Reminder interval started:', intervalMs)
    } catch (error) {
      console.error('[AdminDebug] Reminder start failed:', error)
      toast.error(`주기 알림 시작 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  const stopReminder = () => {
    console.log('[AdminDebug] Stopping reminder interval')
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log('[AdminDebug] Reminder interval cleared')
    }
    setIsReminderRunning(false)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">디버그 모드</h1>
        <p className="mt-1 text-sm text-slate-500">알림/푸시 테스트 전용 페이지</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-700">환경 안내</span>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {platformLabel}
          </span>
        </div>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            서비스워커 지원: <span className="font-semibold text-slate-800">{serviceWorkerSupported ? '지원' : '미지원'}</span>
          </p>
          <p>
            실행 모드: <span className="font-semibold text-slate-800">{displayMode}</span>
          </p>
          <p className="text-slate-500">
            Apple(iOS/Safari)와 Windows(Chrome/Edge)는 서비스워커 및 알림 정책이 다를 수 있습니다.
            특히 iOS는 PWA로 설치해야 푸시 동작이 안정적입니다.
          </p>
        </div>
      </div>

      {isChrome && displayMode !== 'browser' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-amber-700">Chrome PWA 알림 안내</span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-600">주의</span>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed">
            Chrome PWA(앱 모드)에서는 알림 권한 팝업이 표시되지 않을 수 있습니다.
            반드시 **Chrome 브라우저 탭**에서 동일 도메인을 열고 알림 권한을 허용해주세요.
          </p>
          <div className="text-sm text-amber-700 space-y-1">
            <p>1. Chrome에서 사이트 열기 → 주소창 자물쇠 → 알림 허용</p>
            <p>2. `chrome://settings/content/notifications` → 허용 목록 확인</p>
            <p>3. macOS 설정 → 알림 → Google Chrome 허용 확인</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-700">알림 권한</span>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {permission}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          앱을 종료하면 주기 알림이 중단됩니다. 알림을 받으려면 최소화 상태로 유지해주세요.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={requestPermission}
            className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all"
          >
            알림 권한 요청
          </button>
          <button
            type="button"
            onClick={requestAndSendNow}
            className="h-10 px-4 rounded-lg bg-haru-500 text-white text-sm font-bold hover:bg-haru-600 active:scale-95 transition-all"
          >
            지금 알림 요청
          </button>
          <button
            type="button"
            onClick={sendTestNotification}
            className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:text-slate-900 active:scale-95 transition-all"
          >
            테스트 알림 보내기
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">주기 알림 테스트</h2>
            <p className="text-sm text-slate-500">설정한 주기로 테스트 알림을 발송합니다.</p>
          </div>
          <span className={`text-xs font-extrabold uppercase tracking-[0.2em] ${isReminderRunning ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isReminderRunning ? 'running' : 'stopped'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">알림 주기</label>
          <select
            value={intervalMs}
            onChange={(event) => setIntervalMs(Number(event.target.value))}
            disabled={isReminderRunning}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-haru-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startReminder}
            disabled={isReminderRunning}
            className="h-10 px-4 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            주기 알림 시작
          </button>
          <button
            type="button"
            onClick={stopReminder}
            disabled={!isReminderRunning}
            className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            주기 알림 중지
          </button>
        </div>

        <div className="text-sm text-slate-500">
          마지막 발송 시간: {lastSentAt || '없음'}
        </div>
      </div>
    </div>
  )
}
