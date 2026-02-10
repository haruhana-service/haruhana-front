import { format, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns'
import { ko } from 'date-fns/locale'

// ============================================
// Date Formatting
// ============================================

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 * @param date - Date 객체 또는 ISO 문자열
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 포맷
 * @param date - Date 객체 또는 ISO 문자열
 */
export function formatDateKorean(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko })
}

/**
 * 날짜를 MM/DD 형식으로 포맷
 * @param date - Date 객체 또는 ISO 문자열
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MM/dd')
}

/**
 * 날짜와 시간을 YYYY-MM-DD HH:mm:ss 형식으로 포맷
 * @param date - Date 객체 또는 ISO 문자열
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 상대 시간 표시 (예: "방금 전", "3시간 전", "2일 전")
 * @param date - Date 객체 또는 ISO 문자열
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
  return `${Math.floor(diffInSeconds / 31536000)}년 전`
}

// ============================================
// Date Comparison
// ============================================

/**
 * 두 날짜가 같은 날인지 확인 (YYYY-MM-DD 기준)
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  return formatDate(date1) === formatDate(date2)
}

/**
 * date1이 date2보다 이후인지 확인
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 */
export function isAfterDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isAfter(d1, d2)
}

/**
 * date1이 date2보다 이전인지 확인
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 */
export function isBeforeDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isBefore(d1, d2)
}

// ============================================
// Time Validation
// ============================================

/**
 * 현재 시간이 당일 23:59:59 이전인지 확인
 * ⚠️ 주의: 이 함수는 클라이언트 시간 기준입니다.
 * 실제 스트릭 계산은 서버에서 수행되어야 합니다.
 *
 * @param serverDate - 서버에서 제공한 현재 날짜 (선택사항)
 */
export function isBeforeDeadline(serverDate?: string): boolean {
  // 서버 날짜가 제공된 경우 사용
  if (serverDate) {
    const now = new Date()
    const deadline = parseISO(serverDate)
    deadline.setHours(23, 59, 59, 999)
    return isBefore(now, deadline)
  }

  // 서버 날짜가 없으면 클라이언트 시간 사용 (경고: 부정확할 수 있음)
  const now = new Date()
  const deadline = new Date(now)
  deadline.setHours(23, 59, 59, 999)
  return isBefore(now, deadline)
}

/**
 * 제출 시간이 당일 제출인지 확인
 * @param submittedAt - 제출 시간
 * @param targetDate - 대상 날짜 (YYYY-MM-DD)
 */
export function isSubmittedOnTime(submittedAt: string, targetDate: string): boolean {
  return isSameDate(submittedAt, targetDate)
}

// ============================================
// Date Calculation
// ============================================

/**
 * 두 날짜 사이의 일수 차이 계산
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return Math.abs(differenceInDays(d1, d2))
}

/**
 * 날짜에 일수를 더하거나 뺌
 * @param date - 기준 날짜
 * @param days - 더할 일수 (음수면 빼기)
 */
export function addDays(date: Date | string, days: number): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const result = new Date(dateObj)
  result.setDate(result.getDate() + days)
  return formatDate(result)
}

// ============================================
// Date Range
// ============================================

/**
 * 시작 날짜부터 종료 날짜까지의 날짜 배열 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 */
export function getDateRange(startDate: Date | string, endDate: Date | string): string[] {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const dates: string[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 최근 N일 날짜 배열 생성 (오늘 포함)
 * @param days - 일수
 */
export function getRecentDates(days: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(formatDate(date))
  }

  return dates
}

// ============================================
// Validation
// ============================================

/**
 * 유효한 날짜 문자열인지 확인 (YYYY-MM-DD)
 * @param dateString - 확인할 날짜 문자열
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  try {
    const date = parseISO(dateString)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}
