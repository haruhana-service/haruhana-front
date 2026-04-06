import { useState, useEffect, useRef } from 'react'
import { getSubmissionFeedback } from '../services/submissionService'
import type { FeedbackResponse } from '../../../types/models'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 90000 // 90초

interface UseSubmissionFeedbackResult {
  feedback: FeedbackResponse | null
  isPolling: boolean
  isTimeout: boolean
}

/**
 * 제출 후 AI 채점 피드백을 폴링으로 조회하는 훅
 *
 * - submissionId가 null이면 비활성
 * - 3초 간격으로 폴링, 피드백 도착 시 자동 중단
 * - 90초 경과 시 타임아웃
 */
export function useSubmissionFeedback(submissionId: number | null): UseSubmissionFeedbackResult {
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isTimeout, setIsTimeout] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsPolling(false)
  }

  useEffect(() => {
    if (submissionId === null) return

    setFeedback(null)
    setIsTimeout(false)
    setIsPolling(true)

    const poll = async () => {
      try {
        const results = await getSubmissionFeedback(submissionId)
        if (results.length > 0) {
          setFeedback(results[results.length - 1])
          stopPolling()
        }
      } catch {
        // 폴링 중 에러는 무시하고 계속 시도
      }
    }

    // 즉시 첫 번째 폴링
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    // 타임아웃 설정
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setIsTimeout(true)
    }, POLL_TIMEOUT_MS)

    return () => {
      stopPolling()
    }
  }, [submissionId])

  return { feedback, isPolling, isTimeout }
}
