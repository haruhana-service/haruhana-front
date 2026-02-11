import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Card } from '../components/ui/Card'
import { useSubmissionHistory } from '../features/submission/hooks/useSubmissionHistory'

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
}

export function HistoryPage() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), 'yyyy-MM-dd')
  )

  // API 연동: 월별 제출 기록 조회
  const { data: problemsMap, isLoading } = useSubmissionHistory(currentMonth)

  // 선택된 날짜의 문제
  const problem = selectedDate && problemsMap ? problemsMap.get(selectedDate) : null

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))
    return days
  }

  const days = getDaysInMonth(currentMonth)

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (selectedDate === dateStr) {
      setSelectedDate(null)
    } else {
      setSelectedDate(dateStr)
    }
  }

  const handleItemClick = (problemId: number) => {
    navigate(`/problem/${problemId}`)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleResetToToday = () => {
    setSelectedDate(null)
    setCurrentMonth(new Date())
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">나의 기록</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">날짜를 선택하여 문제 확인하세요.</p>
      </div>

      {/* 캘린더 */}
      <Card className="mb-6 !p-4">
        <div className="flex justify-between items-center mb-3">
          <button onClick={handlePrevMonth} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-[17px] font-bold text-slate-900">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h3>
          <button onClick={handleNextMonth} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} className="text-[11px] font-bold text-slate-400 py-1 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`}></div>

            const dateStr = format(date, 'yyyy-MM-dd')
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === today

            const problemData = problemsMap?.get(dateStr)
            const hasProblem = !!problemData
            const isSolved = problemData?.isSolved ?? false

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[14px] transition-all
                  ${isSelected ? 'bg-haru-500 text-white shadow-lg shadow-haru-500/30 font-bold' : 
                    isToday ? 'bg-haru-50 text-haru-700 font-extrabold ring-2 ring-haru-500' : 
                    'hover:bg-slate-50 text-slate-700 font-semibold'}
                  ${hasProblem && !isSelected && !isToday ? (isSolved ? 'text-haru-600 font-bold' : 'text-slate-500') : ''}
                `}
              >
                {date.getDate()}
                {hasProblem && !isSelected && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${isSolved ? 'bg-haru-500' : 'bg-slate-200'}`}></div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* 선택된 날짜 문제 표시 */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-[15px]">
            {selectedDate ? `${selectedDate} 문제` : '오늘의 문제'}
          </h3>
          {selectedDate && (
            <button onClick={handleResetToToday} className="text-[13px] text-haru-600 font-semibold hover:text-haru-700 transition-colors">전체 보기</button>
          )}
        </div>

        <div className="pb-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
              <p className="text-sm font-medium">로딩 중...</p>
            </div>
          ) : !problem ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
              <p className="text-sm font-medium">
                {selectedDate ? '해당 날짜에 문제가 없습니다.' : '기록이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-haru-300 hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => handleItemClick(problem.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="bg-haru-50 text-haru-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase">
                        {problem.categoryTopic}
                      </span>
                      <span className="bg-slate-100 text-slate-500 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase">
                        {DIFFICULTY_LABELS[problem.difficulty] || problem.difficulty}
                      </span>
                      {problem.isSolved ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold rounded">✓ 완료</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-bold rounded">미완료</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">{problem.title}</h3>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
