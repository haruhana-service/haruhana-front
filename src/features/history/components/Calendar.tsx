import { useState } from 'react'

interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  completedDates?: Set<string> // YYYY-MM-DD 형식
}

export function Calendar({ selectedDate, onDateSelect, completedDates = new Set() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // 월의 첫날과 마지막날
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 첫 주의 시작 (일요일)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  // 마지막 주의 끝 (토요일)
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const weeks: Date[][] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isCompleted = (date: Date): boolean => {
    return completedDates.has(formatDateKey(date))
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month
  }

  const handleDateClick = (date: Date) => {
    if (!isCurrentMonth(date)) return
    onDateSelect?.(date)
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          {year}년 {month + 1}월
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs sm:text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-slate-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="space-y-1 sm:space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week.map((date, dateIndex) => {
              const isCurrentMonthDate = isCurrentMonth(date)
              const isSelectedDate = isSelected(date)
              const isTodayDate = isToday(date)
              const isCompletedDate = isCompleted(date)

              const dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${isCompletedDate ? ' (완료)' : ''}${isTodayDate ? ' (오늘)' : ''}`
              const tooltip = `${date.getMonth() + 1}월 ${date.getDate()}일${isCompletedDate ? ' - 풀이 완료' : ''}`

              return (
                <button
                  key={dateIndex}
                  onClick={() => handleDateClick(date)}
                  disabled={!isCurrentMonthDate}
                  aria-label={isCurrentMonthDate ? dateLabel : undefined}
                  aria-current={isTodayDate ? 'date' : undefined}
                  title={isCurrentMonthDate ? tooltip : undefined}
                  className={`
                    aspect-square rounded-lg sm:rounded-xl text-sm sm:text-base font-medium
                    transition-all duration-200
                    ${!isCurrentMonthDate ? 'text-slate-300 cursor-not-allowed' : 'text-slate-900'}
                    ${isSelectedDate ? 'bg-indigo-600 text-white shadow-lg scale-105' : ''}
                    ${!isSelectedDate && isTodayDate ? 'ring-2 ring-indigo-600 ring-inset' : ''}
                    ${!isSelectedDate && isCompletedDate && isCurrentMonthDate ? 'bg-indigo-50 text-indigo-600' : ''}
                    ${!isSelectedDate && !isTodayDate && !isCompletedDate && isCurrentMonthDate ? 'hover:bg-slate-50' : ''}
                    ${dateIndex === 0 && isCurrentMonthDate ? 'text-red-500' : ''}
                    ${dateIndex === 6 && isCurrentMonthDate ? 'text-blue-500' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
