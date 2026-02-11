// ============================================
// HaruHaru Domain Models (실제 API 스펙 기반)
// ============================================

// Enums
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type UploadType = 'PROFILE_IMAGE'

// ============================================
// Auth (인증)
// ============================================

export interface SignupRequest {
  loginId: string // 최대 50자
  password: string // 8자 이상, 대소문자+숫자 포함
  nickname: string // 최대 50자
  categoryTopicId: number
  difficulty: Difficulty
}

export interface LoginRequest {
  loginId: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface TokenReissueRequest {
  refreshToken: string
}

// ============================================
// Member (회원)
// ============================================

export interface MemberProfileResponse {
  loginId: string
  nickname: string
  createdAt: string // date-time
  categoryTopicName: string
  difficulty: string
}

export interface ProfileUpdateRequest {
  nickname: string
  profileImageKey?: string // 선택사항
}

export interface PreferenceUpdateRequest {
  categoryTopicId: number
  difficulty: Difficulty
}

export interface DeviceTokenSyncRequest {
  deviceToken: string // FCM 토큰
}

// ============================================
// Category (카테고리)
// ============================================

export interface CategoryTopic {
  id: number
  name: string
}

export interface CategoryGroup {
  id: number
  name: string
  topics: CategoryTopic[]
}

export interface Category {
  id: number
  name: string
  groups: CategoryGroup[]
}

export interface CategoryListResponse {
  categories: Category[]
}

// 관리자용
export interface CategoryCreateRequest {
  name: string
}

export interface CategoryGroupCreateRequest {
  categoryId: number
  name: string
}

export interface CategoryTopicCreateRequest {
  groupId: number
  name: string
}

// ============================================
// Problem (문제)
// ============================================

export interface TodayProblemResponse {
  id: number
  title: string
  description: string
  difficulty: string
  categoryTopicName: string
  isSolved: boolean
}

export interface DailyProblemResponse {
  id: number
  difficulty: string
  categoryTopic: string
  title: string
  isSolved: boolean
}

export interface DailyProblemDetailResponse {
  id: number
  difficulty: string
  categoryTopic: string
  assignedAt: string // date-time
  title: string
  description: string
  userAnswer: string | null
  submittedAt: string | null // date-time
  aiAnswer: string | null
}

// ============================================
// Problem Preference (문제 설정)
// ============================================

export interface ProblemPreferenceUpdateRequest {
  categoryTopicId: number
  difficulty: Difficulty
}

// ============================================
// Submission (제출)
// ============================================

export interface SubmitSolutionRequest {
  userAnswer: string // 최대 5000자
}

export interface SubmissionResponse {
  submissionId: number
  dailyProblemId: number
  userAnswer: string
  submittedAt: string // date-time
  isOnTime: boolean // 스트릭 증가 여부
  aiAnswer: string
}

// ============================================
// Streak (스트릭)
// ============================================

export interface StreakResponse {
  currentStreak: number
  maxStreak: number
}

// ============================================
// Storage (스토리지)
// ============================================

export interface PresignedCreateRequest {
  fileName: string
  uploadType: UploadType
}

export interface PresignedUrlResponse {
  presignedUrl: string // 3분 유효
  objectKey: string
}

export interface StorageUploadCompleteRequest {
  objectKey: string // 최대 512자
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
  code?: string
}

export interface ApiResponseLong {
  data: number // 생성된 ID
}

// ============================================
// API Error Response
// ============================================

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// 백엔드 에러 응답 구조: { result: "ERROR", data: null, error: { code, message, data } }
export interface ApiErrorResponse {
  result: string
  data: null
  error?: {
    code?: string
    message?: string
    data?: unknown
  }
  // 백엔드가 error 객체 없이 바로 message, code를 반환하는 경우도 처리
  message?: string
  code?: string
  details?: unknown
}
