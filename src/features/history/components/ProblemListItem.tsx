interface ProblemListItemProps {
  title: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  status: 'completed' | 'incomplete'
  date: string
  onClick?: () => void
}

const difficultyLabel: Record<string, string> = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
}

const difficultyColor: Record<string, string> = {
  EASY: 'bg-green-50 text-green-600',
  MEDIUM: 'bg-yellow-50 text-yellow-600',
  HARD: 'bg-red-50 text-red-600',
}

const statusLabel: Record<string, string> = {
  completed: '완료',
  incomplete: '미완료',
}

const statusColor: Record<string, string> = {
  completed: 'bg-indigo-50 text-indigo-600',
  incomplete: 'bg-slate-50 text-slate-500',
}

export function ProblemListItem({ title, category, difficulty, status, date, onClick }: ProblemListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5
                 hover:shadow-md hover:border-indigo-200 transition-all duration-200
                 flex items-center justify-between group"
    >
      <div className="flex-1 text-left space-y-2">
        {/* 태그들 */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
            {category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor[difficulty]}`}>
            {difficultyLabel[difficulty]}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[status]}`}>
            {statusLabel[status]}
          </span>
        </div>

        {/* 문제 제목 */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        {/* 날짜 */}
        <p className="text-xs sm:text-sm text-slate-500">
          {date}
        </p>
      </div>

      {/* 화살표 아이콘 */}
      <div className="ml-4 flex-shrink-0">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-indigo-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
