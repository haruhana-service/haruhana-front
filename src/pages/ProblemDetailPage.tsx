import { useState, memo, useCallback, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Markdown from 'markdown-to-jsx'
import confetti from 'canvas-confetti'
import { useProblemDetail } from '../features/problem/hooks/useProblemDetail'
import { useSubmitAnswer } from '../features/submission/hooks/useSubmitAnswer'
import { useUpdateAnswer } from '../features/submission/hooks/useUpdateAnswer'
import { useSubmissionFeedback } from '../features/submission/hooks/useSubmissionFeedback'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import type { SubmissionResponse, FeedbackGrade } from '../types/models'

interface ChildrenProps {
  children: ReactNode
}

interface LinkProps {
  children: ReactNode
  href?: string
}

interface CodeProps {
  children: ReactNode
  inline?: boolean
}

const MIN_ANSWER_LENGTH = 10

const GRADE_CONFIG: Record<FeedbackGrade, { label: string; bg: string; text: string; border: string }> = {
  EXCELLENT: { label: '우수', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  GOOD:      { label: '양호', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  FAIR:      { label: '보통', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  POOR:      { label: '미흡', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
}

const submissionCacheKey = (problemId: number) => `haruharu:submission:${problemId}`

// Markdown 렌더러 옵션
const markdownOptions = {
  overrides: {
    h1: {
      component: ({ children }: ChildrenProps) => (
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-5 sm:mt-6 text-slate-800">
          {children}
        </h1>
      ),
    },
    h2: {
      component: ({ children }: ChildrenProps) => (
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-slate-800">
          {children}
        </h2>
      ),
    },
    h3: {
      component: ({ children }: ChildrenProps) => (
        <h3 className="text-base sm:text-lg font-bold mb-2 mt-3 sm:mt-4 text-slate-700">
          {children}
        </h3>
      ),
    },
    h4: {
      component: ({ children }: ChildrenProps) => (
        <h4 className="text-sm sm:text-base font-bold mb-2 mt-2 sm:mt-3 text-slate-700">
          {children}
        </h4>
      ),
    },
    p: {
      component: ({ children }: ChildrenProps) => (
        <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base text-slate-700">
          {children}
        </p>
      ),
    },
    ul: {
      component: ({ children }: ChildrenProps) => (
        <ul className="list-disc list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
          {children}
        </ul>
      ),
    },
    ol: {
      component: ({ children }: ChildrenProps) => (
        <ol className="list-decimal list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
          {children}
        </ol>
      ),
    },
    li: {
      component: ({ children }: ChildrenProps) => (
        <li className="leading-relaxed marker:text-slate-500">{children}</li>
      ),
    },
    code: {
      component: ({ children, inline }: CodeProps) => {
        if (inline) {
          return (
            <code className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-slate-100 text-slate-800 border border-slate-200">
              {children}
            </code>
          )
        }
        return (
          <code className="text-xs sm:text-sm">{children}</code>
        )
      },
    },
    pre: {
      component: ({ children }: ChildrenProps) => (
        <pre className="p-3 sm:p-4 rounded-lg sm:rounded-xl overflow-x-auto mb-3 sm:mb-4 border bg-slate-50 border-slate-200">
          {children}
        </pre>
      ),
    },
    blockquote: {
      component: ({ children }: ChildrenProps) => (
        <blockquote className="border-l-4 pl-3 sm:pl-4 py-2 my-3 sm:my-4 italic text-sm sm:text-base border-haru-400 bg-haru-50/30 text-slate-600">
          {children}
        </blockquote>
      ),
    },
    a: {
      component: ({ children, href }: LinkProps) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-2 underline-offset-2 transition-colors text-sm sm:text-base break-words text-haru-600 hover:text-haru-700 decoration-haru-400/50"
        >
          {children}
        </a>
      ),
    },
    hr: {
      component: () => <hr className="my-4 sm:my-6 border-t border-slate-300" />,
    },
    table: {
      component: ({ children }: ChildrenProps) => (
        <div className="overflow-x-auto mb-3 sm:mb-4 -mx-2 sm:mx-0">
          <table className="min-w-full border-collapse text-xs sm:text-sm border-slate-200">
            {children}
          </table>
        </div>
      ),
    },
    thead: {
      component: ({ children }: ChildrenProps) => (
        <thead className="bg-slate-50">{children}</thead>
      ),
    },
    tbody: {
      component: ({ children }: ChildrenProps) => (
        <tbody className="divide-slate-200">{children}</tbody>
      ),
    },
    tr: {
      component: ({ children }: ChildrenProps) => (
        <tr className="border-b border-slate-200">{children}</tr>
      ),
    },
    th: {
      component: ({ children }: ChildrenProps) => (
        <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left font-semibold text-slate-700">
          {children}
        </th>
      ),
    },
    td: {
      component: ({ children }: ChildrenProps) => (
        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-slate-600">{children}</td>
      ),
    },
    strong: {
      component: ({ children }: ChildrenProps) => (
        <strong className="font-bold text-slate-800">{children}</strong>
      ),
    },
    em: {
      component: ({ children }: ChildrenProps) => (
        <em className="text-slate-700">{children}</em>
      ),
    },
  },
}

const darkMarkdownOptions = {
  overrides: {
    h1: { component: ({ children }: ChildrenProps) => <h1 className="text-base font-bold mb-2 mt-4 first:mt-0 text-indigo-300">{children}</h1> },
    h2: { component: ({ children }: ChildrenProps) => <h2 className="text-[15px] font-bold mb-2 mt-4 first:mt-0 text-indigo-300">{children}</h2> },
    h3: { component: ({ children }: ChildrenProps) => <h3 className="text-sm font-bold mb-1.5 mt-3 first:mt-0 text-indigo-300">{children}</h3> },
    h4: { component: ({ children }: ChildrenProps) => <h4 className="text-sm font-bold mb-1.5 mt-2 first:mt-0 text-indigo-300">{children}</h4> },
    p:  { component: ({ children }: ChildrenProps) => <p className="text-[14px] leading-[1.75] mb-3 last:mb-0 text-white/85">{children}</p> },
    strong: { component: ({ children }: ChildrenProps) => <strong className="font-bold text-white">{children}</strong> },
    em: { component: ({ children }: ChildrenProps) => <em className="italic text-white/75">{children}</em> },
    ul: { component: ({ children }: ChildrenProps) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1">{children}</ul> },
    ol: { component: ({ children }: ChildrenProps) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1">{children}</ol> },
    li: { component: ({ children }: ChildrenProps) => <li className="text-[14px] text-white/85 leading-relaxed">{children}</li> },
    code: { component: ({ children, inline }: CodeProps) => inline
      ? <code className="bg-white/10 text-indigo-200 px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>
      : <code className="text-[13px] font-mono">{children}</code>
    },
    pre: { component: ({ children }: ChildrenProps) => <pre className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3 overflow-x-auto">{children}</pre> },
    blockquote: { component: ({ children }: ChildrenProps) => <blockquote className="border-l-4 border-indigo-400/50 pl-4 py-1 my-3 italic text-white/60">{children}</blockquote> },
    hr: { component: () => <hr className="my-4 border-t border-white/10" /> },
    a: { component: ({ children, href }: LinkProps) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-300 underline decoration-indigo-400/50 hover:text-indigo-200">{children}</a> },
  },
}

// Memoized Markdown renderers - prevent re-parsing on every keystroke
const ProblemDescription = memo(({ description }: { description: string }) => (
  <Markdown options={markdownOptions}>{description}</Markdown>
))

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const problemId = id ? parseInt(id) : null
  const { data: problem, isLoading, error } = useProblemDetail(problemId)
  const { mutateAsync: submitAnswerMutation } = useSubmitAnswer(problemId)
  const { mutateAsync: updateAnswerMutation } = useUpdateAnswer(problemId)

  const [isEditing, setIsEditing] = useState(false)
  const [editAnswer, setEditAnswer] = useState('')
  const [answer, setAnswer] = useState('')
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ai-answer' | 'feedback'>('ai-answer')

  // 피드백 폴링: 현재 세션 제출 결과 또는 localStorage 캐시에서 submissionId 조회
  const [feedbackSubmissionId, setFeedbackSubmissionId] = useState<number | null>(() => {
    if (!problemId) return null
    const cached = localStorage.getItem(submissionCacheKey(problemId))
    return cached ? Number(cached) : null
  })
  const { feedback, isPolling, isTimeout } = useSubmissionFeedback(
    submissionResult?.submissionId ?? feedbackSubmissionId
  )

  const handleBack = useCallback(() => {
    navigate('/today')
  }, [navigate])

  // 미제출 상태에서 제출
  const handleSubmit = useCallback(async () => {
    if (!problemId || answer.length < MIN_ANSWER_LENGTH) return
    setIsSubmitting(true)
    setApiError(null)
    try {
      const result = await submitAnswerMutation(answer)
      setSubmissionResult(result)
      if (problemId) {
        localStorage.setItem(submissionCacheKey(problemId), String(result.submissionId))
        setFeedbackSubmissionId(result.submissionId)
      }
      toast.success('답변이 제출되었습니다.')
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#4a69ff', '#668cff', '#ccd8ff', '#ffffff', '#a78bfa'],
        scalar: 1.1,
      })
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setApiError(err.message as string)
      } else {
        setApiError('답변 제출에 실패했습니다')
      }
      toast.error('답변 제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [problemId, answer, submitAnswerMutation])

  // 수정 모드 시작
  const handleEditStart = useCallback(() => {
    setEditAnswer(problem?.userAnswer || '')
    setIsEditing(true)
  }, [problem?.userAnswer])

  // 수정 제출
  const handleEditSubmit = useCallback(async () => {
    if (!problemId || editAnswer.length < MIN_ANSWER_LENGTH) return
    setIsSubmitting(true)
    setApiError(null)
    try {
      const result = await updateAnswerMutation(editAnswer)
      if (problemId) {
        localStorage.setItem(submissionCacheKey(problemId), String(result.submissionId))
        setFeedbackSubmissionId(result.submissionId)
      }
      setIsEditing(false)
      toast.success('답변이 수정되었습니다.')
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setApiError(err.message as string)
      } else {
        setApiError('답변 수정에 실패했습니다')
      }
      toast.error('답변 수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [problemId, editAnswer, updateAnswerMutation])

  // 제출 후 결과에서 사용할 데이터
  const userAnswer = submissionResult?.userAnswer || problem?.userAnswer
  const submittedAt = submissionResult?.submittedAt || problem?.submittedAt
  const isSolved = !!submissionResult || !!problem?.userAnswer
  const aiAnswer = submissionResult?.aiAnswer || problem?.aiAnswer

  const getDifficultyKorean = (d: string) => {
    const map: Record<string, string> = { EASY: '쉬움', MEDIUM: '보통', HARD: '어려움' }
    return map[d] || d
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header with Back Button and Date */}
      <div className="flex items-center gap-3 py-1">
        <button onClick={handleBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-400">
          {problem?.assignedAt ? new Date(problem.assignedAt).toISOString().split('T')[0] : ''}
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-[3px] border-haru-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-slate-400 font-medium">문제를 불러오는 중...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <p className="text-sm font-medium text-red-700 text-center">문제를 불러올 수 없습니다</p>
        </div>
      )}

      {/* Content */}
      {problem && !isLoading && !error && (
        <div className="space-y-6">

          {/* Badges */}
          <div className="flex gap-2 items-center">
            <span className="bg-indigo-50 text-indigo-600 text-[11px] font-semibold px-2 py-1 rounded-md">
              {problem.categoryTopic}
            </span>
            <span className="bg-slate-100 text-slate-500 text-[11px] font-semibold px-2 py-1 rounded-md">
              {getDifficultyKorean(problem.difficulty)}
            </span>
            {isSolved && (
              <span className="bg-green-50 text-green-600 text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                제출 완료
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {problem.title}
            </h2>
          </div>

          {/* Problem Description Card */}
          <div className="bg-[#f8faff] rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-indigo-50/50">
              <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
              <span className="text-sm font-semibold text-indigo-500">문제 설명</span>
            </div>
            <div className="p-4">
              <div className="prose prose-slate max-w-none text-slate-600 [&_p]:text-[14px] [&_p]:leading-[1.6] [&_p]:mb-3 last:[&_p]:mb-0 [&_code]:bg-slate-50 [&_code]:p-1 [&_code]:rounded [&_pre]:bg-[#f4f7ff] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-indigo-50/40">
                <ProblemDescription description={problem.description} />
              </div>
            </div>
          </div>

          {/* === 미제출 상태: 답변 작성 폼 === */}
          {!isSolved && !submissionResult && (
            <section className="space-y-4 animate-fade-in pt-4">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-slate-800">나의 답변 작성</h3>
                  </div>

                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
                    <p className="text-sm text-red-700 font-medium">{apiError}</p>
                  </div>
                )}

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full h-36 p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none resize-none text-[14px] transition-all font-medium leading-[1.6]"
                  placeholder={`오늘의 생각을 여기에 기록해보세요. (최소 ${MIN_ANSWER_LENGTH}자)`}
                />
              </div>
              <Button
                fullWidth
                size="md"
                onClick={handleSubmit}
                disabled={answer.length < MIN_ANSWER_LENGTH || isSubmitting}
                className="h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/8 font-semibold"
              >
                {isSubmitting ? '제출 중...' : '문제 제출하기'}
              </Button>
            </section>
          )}

          {/* === 제출 완료 상태 === */}
          {isSolved && (
            <div className="space-y-5 animate-fade-in pt-2">

              {/* 답변 & 피드백 통합 카드 */}
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                {/* 제출한 답변 섹션 */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-800">제출한 답변</h3>
                    {!isEditing && (
                      <button
                        onClick={handleEditStart}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50"
                        aria-label="답변 수정"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      {apiError && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                          <p className="text-xs text-red-700 font-medium">{apiError}</p>
                        </div>
                      )}
                      <textarea
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        className="w-full h-40 p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none resize-none text-sm transition-all font-medium leading-[1.6]"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 rounded-xl"
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleEditSubmit}
                          disabled={editAnswer.length < MIN_ANSWER_LENGTH || isSubmitting}
                          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {isSubmitting ? '수정 중...' : '수정 완료'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-600 text-sm leading-[1.8] font-medium mb-4 whitespace-pre-wrap">
                        {userAnswer}
                      </p>
                      {submittedAt && (
                        <div className="text-xs font-bold text-slate-300">
                          제출 시간: {new Date(submittedAt).toLocaleString('ko-KR', {
                            year: 'numeric', month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* AI 답변 & 피드백 탭 섹션 */}
                <div className="bg-gradient-to-br from-slate-50 to-white">
                  {/* 탭 헤더 */}
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ai-answer')}
                      className={`flex-1 py-3.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
                        activeTab === 'ai-answer'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      AI 모범 답안
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('feedback')}
                      className={`flex-1 py-3.5 text-sm font-bold border-b-2 -mb-px transition-colors flex items-center justify-center gap-1.5 ${
                        activeTab === 'feedback'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      AI 피드백
                      {isPolling && !feedback && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                      {feedback && (
                        <div className={`text-[10px] font-black px-1.5 py-0.5 rounded ${GRADE_CONFIG[feedback.grade].bg} ${GRADE_CONFIG[feedback.grade].text}`}>
                          {GRADE_CONFIG[feedback.grade].label}
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="p-5">
                    {/* AI 모범 답안 탭 */}
                    {activeTab === 'ai-answer' && (
                      <div className="animate-fade-in">
                        {aiAnswer ? (
                          <div className="bg-[#1a2035] rounded-xl overflow-hidden shadow-lg">
                            {/* 헤더 */}
                            <div className="flex items-center gap-3 px-5 pt-5 pb-4">
                              <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-white tracking-tight">AI 멘토의 조언</h3>
                                <p className="text-[11px] text-white/50 font-medium mt-0.5">문제 풀이에 도움이 되는 피드백입니다</p>
                              </div>
                            </div>
                            <div className="mx-5 h-px bg-white/10" />
                            {/* 내용 */}
                            <div className="px-5 py-4">
                              <Markdown options={darkMarkdownOptions}>{aiAnswer}</Markdown>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-4">AI 답변 정보가 없습니다.</p>
                        )}
                      </div>
                    )}

                    {/* AI 피드백 탭 */}
                    {activeTab === 'feedback' && (
                      <div className="animate-fade-in">
                        {isPolling && !feedback && (
                          <div className="mesh-gradient text-white rounded-xl p-5 shadow-lg">
                            <div className="flex items-center gap-4">
                              <div className="relative w-9 h-9 shrink-0">
                                <div className="absolute inset-0 border-[3px] border-white/30 rounded-full" />
                                <div className="absolute inset-0 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                              <div>
                                <p className="font-black text-sm tracking-tight">AI 채점 중...</p>
                                <p className="text-white/70 text-[12px] font-medium mt-0.5">잠시만 기다려 주세요</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {isTimeout && !feedback && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-amber-800 font-bold text-sm">
                              채점에 시간이 오래 걸리고 있어요. 잠시 후 페이지를 새로고침해 주세요.
                            </p>
                          </div>
                        )}

                        {feedback && (() => {
                          const gradeConfig = GRADE_CONFIG[feedback.grade]
                          return (
                            <div className="space-y-4">
                              {/* 등급 헤더 */}
                              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                  </div>
                                  <h3 className="font-black text-sm tracking-tight text-slate-800">AI 멘토 피드백</h3>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-black text-xs ${gradeConfig.bg} ${gradeConfig.text} ${gradeConfig.border}`}>
                                  <span>{gradeConfig.label}</span>
                                  <span className="text-[10px] opacity-60">({feedback.grade})</span>
                                </div>
                              </div>

                              {/* 피드백 내용 */}
                              <div className="space-y-3">
                                {/* 잘한 점 */}
                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <h4 className="text-xs font-black text-emerald-700 tracking-wide">잘한 점</h4>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-7">
                                    {feedback.strengths}
                                  </p>
                                </div>

                                {/* 부족한 점 */}
                                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                      </svg>
                                    </div>
                                    <h4 className="text-xs font-black text-amber-700 tracking-wide">부족한 점</h4>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-7">
                                    {feedback.weaknesses}
                                  </p>
                                </div>

                                {/* 개선 방향 */}
                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                    </div>
                                    <h4 className="text-xs font-black text-blue-700 tracking-wide">개선 방향</h4>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-7">
                                    {feedback.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 대시보드로 돌아가기 */}
              <Button
                fullWidth
                onClick={handleBack}
                className="h-16 rounded-[24px] bg-indigo-400 text-white font-black text-[17px] shadow-md shadow-indigo-300/40 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-400/50 hover:scale-[1.02] border-none transition-all duration-200 active:scale-[0.98]"
              >
                대시보드로 돌아가기
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
