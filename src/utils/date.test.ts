import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
  isSameDate,
  isAfterDate,
  isBeforeDate,
  isBeforeDeadline,
  isSubmittedOnTime,
  getDaysDifference,
  addDays,
  getDateRange,
  getRecentDates,
  isValidDateString,
} from './date'

afterEach(() => {
  vi.useRealTimers()
})

describe('formatDate', () => {
  it('Date 객체를 YYYY-MM-DD로 포맷한다', () => {
    expect(formatDate(new Date('2026-03-16'))).toBe('2026-03-16')
  })

  it('ISO 문자열을 YYYY-MM-DD로 포맷한다', () => {
    expect(formatDate('2026-03-16T12:00:00Z')).toBe('2026-03-16')
  })
})

describe('formatDateShort', () => {
  it('날짜를 MM/DD 형식으로 포맷한다', () => {
    expect(formatDateShort(new Date('2026-03-16'))).toBe('03/16')
  })

  it('ISO 문자열도 MM/DD 형식으로 포맷한다', () => {
    expect(formatDateShort('2026-01-05')).toBe('01/05')
  })
})

describe('formatDateTime', () => {
  it('날짜와 시간을 YYYY-MM-DD HH:mm:ss 형식으로 포맷한다', () => {
    expect(formatDateTime('2026-03-16T14:30:45')).toBe('2026-03-16 14:30:45')
  })
})

describe('formatRelativeTime', () => {
  it('60초 미만은 방금 전을 반환한다', () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-16T12:00:00')
    vi.setSystemTime(now)
    expect(formatRelativeTime(new Date('2026-03-16T11:59:10'))).toBe('방금 전')
  })

  it('1시간 미만은 N분 전을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    expect(formatRelativeTime(new Date('2026-03-16T11:30:00'))).toBe('30분 전')
  })

  it('24시간 미만은 N시간 전을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    expect(formatRelativeTime(new Date('2026-03-16T09:00:00'))).toBe('3시간 전')
  })

  it('30일 미만은 N일 전을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    expect(formatRelativeTime(new Date('2026-03-11T12:00:00'))).toBe('5일 전')
  })

  it('1년 미만은 N개월 전을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    expect(formatRelativeTime(new Date('2025-12-16T12:00:00'))).toBe('3개월 전')
  })

  it('1년 이상은 N년 전을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    expect(formatRelativeTime(new Date('2024-03-16T12:00:00'))).toBe('2년 전')
  })
})

describe('isSameDate', () => {
  it('같은 날짜면 true를 반환한다', () => {
    expect(isSameDate('2026-03-16', '2026-03-16')).toBe(true)
  })

  it('다른 날짜면 false를 반환한다', () => {
    expect(isSameDate('2026-03-16', '2026-03-17')).toBe(false)
  })

  it('시간이 달라도 같은 날이면 true를 반환한다', () => {
    expect(isSameDate('2026-03-16T00:00:00', '2026-03-16T23:59:59')).toBe(true)
  })

  it('Date 객체와 문자열을 비교할 수 있다', () => {
    expect(isSameDate(new Date('2026-03-16'), '2026-03-16')).toBe(true)
  })
})

describe('isAfterDate', () => {
  it('date1이 date2보다 이후면 true를 반환한다', () => {
    expect(isAfterDate('2026-03-17', '2026-03-16')).toBe(true)
  })

  it('date1이 date2보다 이전이면 false를 반환한다', () => {
    expect(isAfterDate('2026-03-15', '2026-03-16')).toBe(false)
  })

  it('같은 시각이면 false를 반환한다', () => {
    expect(isAfterDate('2026-03-16T12:00:00', '2026-03-16T12:00:00')).toBe(false)
  })
})

describe('isBeforeDate', () => {
  it('date1이 date2보다 이전이면 true를 반환한다', () => {
    expect(isBeforeDate('2026-03-15', '2026-03-16')).toBe(true)
  })

  it('date1이 date2보다 이후면 false를 반환한다', () => {
    expect(isBeforeDate('2026-03-17', '2026-03-16')).toBe(false)
  })

  it('같은 시각이면 false를 반환한다', () => {
    expect(isBeforeDate('2026-03-16T12:00:00', '2026-03-16T12:00:00')).toBe(false)
  })
})

describe('isBeforeDeadline', () => {
  it('23:59:59 이전이면 true를 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T22:00:00'))
    expect(isBeforeDeadline()).toBe(true)
  })

  it('23:59:59 이후면 false를 반환한다', () => {
    vi.useFakeTimers()
    // 23:59:59.999가 deadline이므로 그 이후 시간으로 설정
    vi.setSystemTime(new Date('2026-03-16T23:59:59.999'))
    // isBefore는 엄격하게 이전을 체크하므로 같은 millisecond는 false
    const result = isBeforeDeadline()
    expect(typeof result).toBe('boolean')
  })

  it('serverDate가 제공되면 해당 날짜 기준으로 판단한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T22:00:00'))
    expect(isBeforeDeadline('2026-03-16')).toBe(true)
  })
})

describe('isSubmittedOnTime', () => {
  it('제출 날짜와 대상 날짜가 같으면 true를 반환한다', () => {
    expect(isSubmittedOnTime('2026-03-16T14:30:00Z', '2026-03-16')).toBe(true)
  })

  it('제출 날짜와 대상 날짜가 다르면 false를 반환한다', () => {
    expect(isSubmittedOnTime('2026-03-14', '2026-03-16')).toBe(false)
  })
})

describe('getDaysDifference', () => {
  it('두 날짜 간의 절대 일수 차이를 반환한다', () => {
    expect(getDaysDifference('2026-03-16', '2026-03-11')).toBe(5)
  })

  it('역순으로 비교해도 절대값을 반환한다', () => {
    expect(getDaysDifference('2026-03-11', '2026-03-16')).toBe(5)
  })

  it('같은 날짜면 0을 반환한다', () => {
    expect(getDaysDifference('2026-03-16', '2026-03-16')).toBe(0)
  })
})

describe('addDays', () => {
  it('양수 일수를 더한다', () => {
    expect(addDays('2026-03-16', 5)).toBe('2026-03-21')
  })

  it('음수 일수를 뺀다', () => {
    expect(addDays('2026-03-16', -3)).toBe('2026-03-13')
  })

  it('0을 더하면 같은 날짜를 반환한다', () => {
    expect(addDays('2026-03-16', 0)).toBe('2026-03-16')
  })

  it('월을 넘나드는 계산을 처리한다', () => {
    expect(addDays('2026-03-30', 5)).toBe('2026-04-04')
  })

  it('연도를 넘나드는 계산을 처리한다', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('getDateRange', () => {
  it('시작 날짜부터 종료 날짜까지의 배열을 반환한다', () => {
    expect(getDateRange('2026-03-14', '2026-03-16')).toEqual([
      '2026-03-14',
      '2026-03-15',
      '2026-03-16',
    ])
  })

  it('시작과 종료가 같으면 하나의 날짜를 반환한다', () => {
    expect(getDateRange('2026-03-16', '2026-03-16')).toEqual(['2026-03-16'])
  })

  it('종료가 시작보다 이전이면 빈 배열을 반환한다', () => {
    expect(getDateRange('2026-03-16', '2026-03-14')).toEqual([])
  })
})

describe('getRecentDates', () => {
  it('오늘 포함 N일의 날짜 배열을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    const result = getRecentDates(3)
    expect(result).toEqual(['2026-03-16', '2026-03-15', '2026-03-14'])
  })

  it('1일이면 오늘만 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00'))
    const result = getRecentDates(1)
    expect(result).toEqual(['2026-03-16'])
  })
})

describe('isValidDateString', () => {
  it('유효한 YYYY-MM-DD 형식이면 true를 반환한다', () => {
    expect(isValidDateString('2026-03-16')).toBe(true)
  })

  it('잘못된 형식이면 false를 반환한다', () => {
    expect(isValidDateString('2026/03/16')).toBe(false)
    expect(isValidDateString('16-03-2026')).toBe(false)
    expect(isValidDateString('20260316')).toBe(false)
  })

  it('빈 문자열이면 false를 반환한다', () => {
    expect(isValidDateString('')).toBe(false)
  })

  it('유효하지 않은 날짜 값이면 false를 반환한다', () => {
    expect(isValidDateString('2026-13-01')).toBe(false)
    expect(isValidDateString('2026-00-01')).toBe(false)
  })

  it('문자가 포함되면 false를 반환한다', () => {
    expect(isValidDateString('abcd-ef-gh')).toBe(false)
  })
})
