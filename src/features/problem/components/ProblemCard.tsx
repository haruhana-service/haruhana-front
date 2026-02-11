import type { TodayProblemResponse } from '../../../types/models'

interface ProblemCardProps {
  problem: TodayProblemResponse
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <div className="space-y-2 animate-fade-up stagger-2">
      {/* Topic & Level Cards - 더 컴팩트하게 */}
      <div className="flex gap-2.5 px-1">
        <div className="flex-1 flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-haru-500"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">TOPIC</span>
            <span className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]">{problem.categoryTopicName}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-slate-500">LV</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">LEVEL</span>
            <span className="text-[13px] font-bold text-slate-800">{getDifficultyLabel(problem.difficulty)}</span>
          </div>
        </div>
      </div>

      {/* Problem Content - 더 세련된 카드 디자인 */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative group/card animate-fade-up stagger-3">
        {/* 장식용 아이콘 */}
        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover/card:scale-110 transition-transform duration-700">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45zM11 10h2v4h-2v-4zm0 6h2v2h-2v-2z" />
          </svg>
        </div>

        <div className="px-6 pt-6 pb-2">
          <h3 className="text-[13px] font-extrabold text-slate-700 tracking-tight leading-tight uppercase">오늘의 챌린지</h3>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">매일 조금씩, 당신의 성장을 돕습니다</p>
        </div>

        <div className="px-6 py-5 space-y-3 relative z-10">
          <h4 className="text-[22px] font-extrabold text-slate-900 leading-tight tracking-tight">
            {problem.title}
          </h4>
          <p className="text-slate-500 text-[14px] leading-relaxed font-medium opacity-90 line-clamp-2">
            {problem.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
  }
  return labels[difficulty] || difficulty
}
