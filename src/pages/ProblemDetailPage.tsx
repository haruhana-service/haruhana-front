import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Markdown from 'markdown-to-jsx'
import { useProblemDetail } from '../features/problem/hooks/useProblemDetail'
import { useSubmitAnswer } from '../features/submission/hooks/useSubmitAnswer'
import { useUpdateAnswer } from '../features/submission/hooks/useUpdateAnswer'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import type { SubmissionResponse } from '../types/models'

// Markdown 렌더러 옵션
const markdownOptions = {
  overrides: {
    h1: {
      component: ({ children }: any) => (
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-5 sm:mt-6 text-slate-800">
          {children}
        </h1>
      ),
    },
    h2: {
      component: ({ children }: any) => (
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-slate-800">
          {children}
        </h2>
      ),
    },
    h3: {
      component: ({ children }: any) => (
        <h3 className="text-base sm:text-lg font-bold mb-2 mt-3 sm:mt-4 text-slate-700">
          {children}
        </h3>
      ),
    },
    h4: {
      component: ({ children }: any) => (
        <h4 className="text-sm sm:text-base font-bold mb-2 mt-2 sm:mt-3 text-slate-700">
          {children}
        </h4>
      ),
    },
    p: {
      component: ({ children }: any) => (
        <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base text-slate-700">
          {children}
        </p>
      ),
    },
    ul: {
      component: ({ children }: any) => (
        <ul className="list-disc list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
          {children}
        </ul>
      ),
    },
    ol: {
      component: ({ children }: any) => (
        <ol className="list-decimal list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
          {children}
        </ol>
      ),
    },
    li: {
      component: ({ children }: any) => (
        <li className="leading-relaxed marker:text-slate-500">{children}</li>
      ),
    },
    code: {
      component: ({ children, inline }: any) => {
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
      component: ({ children }: any) => (
        <pre className="p-3 sm:p-4 rounded-lg sm:rounded-xl overflow-x-auto mb-3 sm:mb-4 border bg-slate-50 border-slate-200">
          {children}
        </pre>
      ),
    },
    blockquote: {
      component: ({ children }: any) => (
        <blockquote className="border-l-4 pl-3 sm:pl-4 py-2 my-3 sm:my-4 italic text-sm sm:text-base border-haru-400 bg-haru-50/30 text-slate-600">
          {children}
        </blockquote>
      ),
    },
    a: {
      component: ({ children, href }: any) => (
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
      component: ({ children }: any) => (
        <div className="overflow-x-auto mb-3 sm:mb-4 -mx-2 sm:mx-0">
          <table className="min-w-full border-collapse text-xs sm:text-sm border-slate-200">
            {children}
          </table>
        </div>
      ),
    },
    thead: {
      component: ({ children }: any) => (
        <thead className="bg-slate-50">{children}</thead>
      ),
    },
    tbody: {
      component: ({ children }: any) => (
        <tbody className="divide-slate-200">{children}</tbody>
      ),
    },
    tr: {
      component: ({ children }: any) => (
        <tr className="border-b border-slate-200">{children}</tr>
      ),
    },
    th: {
      component: ({ children }: any) => (
        <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left font-semibold text-slate-700">
          {children}
        </th>
      ),
    },
    td: {
      component: ({ children }: any) => (
        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-slate-600">{children}</td>
      ),
    },
    strong: {
      component: ({ children }: any) => (
        <strong className="font-bold text-slate-800">{children}</strong>
      ),
    },
    em: {
      component: ({ children }: any) => (
        <em className="text-slate-700">{children}</em>
      ),
    },
  },
}

// Dark 모드 마크다운 옵션
const darkMarkdownOptions = {
  overrides: {
    h1: {
      component: ({ children }: any) => (
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-5 sm:mt-6 text-haru-200">
          {children}
        </h1>
      ),
    },
    h2: {
      component: ({ children }: any) => (
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-haru-200">
          {children}
        </h2>
      ),
    },
    h3: {
      component: ({ children }: any) => (
        <h3 className="text-base sm:text-lg font-bold mb-2 mt-3 sm:mt-4 text-haru-300">
          {children}
        </h3>
      ),
    },
    h4: {
      component: ({ children }: any) => (
        <h4 className="text-sm sm:text-base font-bold mb-2 mt-2 sm:mt-3 text-haru-300">
          {children}
        </h4>
      ),
    },
    p: {
      component: ({ children }: any) => (
        <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base text-haru-100">
          {children}
        </p>
      ),
    },
    ul: {
      component: ({ children }: any) => (
        <ul className="list-disc list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-haru-100">
          {children}
        </ul>
      ),
    },
    ol: {
      component: ({ children }: any) => (
        <ol className="list-decimal list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-haru-100">
          {children}
        </ol>
      ),
    },
    li: {
      component: ({ children }: any) => (
        <li className="leading-relaxed marker:text-haru-400">{children}</li>
      ),
    },
    code: {
      component: ({ children, inline }: any) => {
        if (inline) {
          return (
            <code className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-slate-700 text-haru-200 border border-slate-600">
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
      component: ({ children }: any) => (
        <pre className="p-3 sm:p-4 rounded-lg sm:rounded-xl overflow-x-auto mb-3 sm:mb-4 border bg-slate-900 border-slate-700">
          {children}
        </pre>
      ),
    },
    blockquote: {
      component: ({ children }: any) => (
        <blockquote className="border-l-4 pl-3 sm:pl-4 py-2 my-3 sm:my-4 italic text-sm sm:text-base border-haru-400 bg-slate-800/50 text-haru-100">
          {children}
        </blockquote>
      ),
    },
    a: {
      component: ({ children, href }: any) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-2 underline-offset-2 transition-colors text-sm sm:text-base break-words text-haru-300 hover:text-haru-200 decoration-haru-400/50"
        >
          {children}
        </a>
      ),
    },
    hr: {
      component: () => <hr className="my-4 sm:my-6 border-t border-slate-700" />,
    },
    table: {
      component: ({ children }: any) => (
        <div className="overflow-x-auto mb-3 sm:mb-4 -mx-2 sm:mx-0">
          <table className="min-w-full border-collapse text-xs sm:text-sm border-slate-700">
            {children}
          </table>
        </div>
      ),
    },
    thead: {
      component: ({ children }: any) => (
        <thead className="bg-slate-800">{children}</thead>
      ),
    },
    tbody: {
      component: ({ children }: any) => (
        <tbody className="divide-slate-700">{children}</tbody>
      ),
    },
    tr: {
      component: ({ children }: any) => (
        <tr className="border-b border-slate-700">{children}</tr>
      ),
    },
    th: {
      component: ({ children }: any) => (
        <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left font-semibold text-haru-200">
          {children}
        </th>
      ),
    },
    td: {
      component: ({ children }: any) => (
        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-haru-100">{children}</td>
      ),
    },
    strong: {
      component: ({ children }: any) => (
        <strong className="font-bold text-white">{children}</strong>
      ),
    },
    em: {
      component: ({ children }: any) => (
        <em className="text-white/90">{children}</em>
      ),
    },
  },
}

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const problemId = id ? parseInt(id) : null
  const { data: problem, isLoading, error, refetch } = useProblemDetail(problemId)
  const { mutateAsync: submitAnswerMutation } = useSubmitAnswer(problemId)
  const { mutateAsync: updateAnswerMutation } = useUpdateAnswer(problemId)

  const [isEditing, setIsEditing] = useState(false)
  const [editAnswer, setEditAnswer] = useState('')
  const [answer, setAnswer] = useState('')
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleBack = () => {
    navigate('/today')
  }

  // 미제출 상태에서 제출
  const handleSubmit = async () => {
    if (!problemId || answer.length < 10) return
    setIsSubmitting(true)
    setApiError(null)
    try {
      const result = await submitAnswerMutation(answer)
      setSubmissionResult(result)
      refetch()
      toast.success('답변이 제출되었습니다.')
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
  }

  // 수정 모드 시작
  const handleEditStart = () => {
    setEditAnswer(problem?.userAnswer || '')
    setIsEditing(true)
  }

  // 수정 제출
  const handleEditSubmit = async () => {
    if (!problemId || editAnswer.length < 10) return
    setIsSubmitting(true)
    setApiError(null)
    try {
      await updateAnswerMutation(editAnswer)
      setIsEditing(false)
      refetch()
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
  }

  // 제출 후 결과에서 사용할 데이터
  const userAnswer = submissionResult?.userAnswer || problem?.userAnswer
  const aiAnswer = submissionResult?.aiAnswer || problem?.aiAnswer
  const submittedAt = submissionResult?.submittedAt || problem?.submittedAt
  const isSolved = !!submissionResult || !!problem?.userAnswer

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
                <Markdown options={markdownOptions}>
                  {problem.description}
                </Markdown>
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
                  placeholder="오늘의 생각을 여기에 기록해보세요..."
                />
              </div>
              <Button
                fullWidth
                size="md"
                onClick={handleSubmit}
                disabled={answer.length < 10 || isSubmitting}
                className="h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/8 font-semibold"
              >
                {isSubmitting ? '제출 중...' : '문제 제출하기'}
              </Button>
            </section>
          )}

          {/* === 제출 완료 상태 === */}
          {isSolved && (
            <div className="space-y-6 animate-fade-in pt-2">

              {/* 제출한 답변 카드 */}
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5 relative">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-black text-slate-800">제출한 답변</h3>
                  {!isEditing && (
                    <button
                      onClick={handleEditStart}
                      className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"
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
                        disabled={editAnswer.length < 10 || isSubmitting}
                        className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {isSubmitting ? '수정 중...' : '수정 완료'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 text-sm leading-[1.6] font-medium mb-5 whitespace-pre-wrap">
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

              {/* AI 멘토의 조언 */}
              {aiAnswer && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-2xl border border-slate-700/50">
                  <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-haru-500/20 border border-haru-500/30">
                      <svg className="w-4 h-4 text-haru-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-haru-200">AI 멘토의 조언</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">문제 풀이에 도움이 되는 피드백입니다</p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none text-white/80 [&_p]:text-[16px] [&_p]:leading-[1.9] [&_p]:mb-5 last:[&_p]:mb-0 [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:leading-tight [&_h3]:mt-3 [&_h3]:mb-3">
                    <Markdown options={darkMarkdownOptions}>
                      {aiAnswer}
                    </Markdown>
                  </div>
                </div>
              )}

              {/* 대시보드로 돌아가기 */}
              <Button
                fullWidth
                onClick={handleBack}
                className="h-16 rounded-[24px] bg-indigo-50 text-indigo-700 font-black text-[17px] shadow-sm hover:bg-indigo-100 border-none transition-all"
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
