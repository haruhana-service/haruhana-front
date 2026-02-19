// ============================================
// API Constants
// ============================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-staging.haruharu.online'
export const API_TIMEOUT = 10000 // 10 seconds

// ============================================
// Auth Constants
// ============================================

export const TOKEN_KEY = 'haruharu_access_token'
export const REFRESH_TOKEN_KEY = 'haruharu_refresh_token'

// ============================================
// Route Paths
// ============================================

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SETUP: '/setup',
  TODAY: '/today',
  PROBLEM_DETAIL: '/problem/:id',
  HISTORY: '/history',
  SETTINGS: '/settings',
  PREFERENCE_EDIT: '/settings/preference',
  PROFILE_EDIT: '/settings/profile',
} as const

// ============================================
// Difficulty Labels
// ============================================

export const DIFFICULTY_LABELS = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
} as const

export const DIFFICULTY_COLORS = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
} as const

// ============================================
// Time Constants
// ============================================

export const DAY_START_HOUR = 0 // 00:00
export const DAY_END_HOUR = 23 // 23:59
export const DAY_END_MINUTE = 59
export const DAY_END_SECOND = 59

// ============================================
// Validation Constants (API 스펙 기준)
// ============================================

export const VALIDATION = {
  LOGIN_ID_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8, // 대소문자+숫자 포함
  NICKNAME_MAX_LENGTH: 50,
  ANSWER_MAX_LENGTH: 5000,
} as const

// ============================================
// Pagination Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// ============================================
// Query Keys (React Query)
// ============================================

export const QUERY_KEYS = {
  // Member
  PROFILE: ['member', 'profile'] as const,

  // Problem
  TODAY_PROBLEM: ['daily-problem', 'today'] as const,
  DAILY_PROBLEM: (date?: string) => ['daily-problem', date] as const,
  PROBLEM_DETAIL: (id: number) => ['daily-problem', 'detail', id] as const,

  // Streak
  STREAK: ['streak'] as const,

  // Category
  CATEGORIES: ['categories'] as const,
} as const

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다',
  UNAUTHORIZED: '로그인이 필요합니다',
  FORBIDDEN: '권한이 없습니다',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다',
  VALIDATION_ERROR: '입력 값을 확인해주세요',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
} as const

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다',
  LOGIN_SUCCESS: '로그인되었습니다',
  LOGOUT_SUCCESS: '로그아웃되었습니다',
  SETUP_SUCCESS: '설정이 완료되었습니다',
  SUBMIT_SUCCESS: '답변이 제출되었습니다',
  UPDATE_SUCCESS: '수정되었습니다',
} as const

// ============================================
// FCM Constants
// ============================================

export const FCM_TOKEN_KEY = 'haruharu_fcm_token'
export const FCM_PERMISSION_DENIED_KEY = 'haruharu_fcm_permission_denied'
