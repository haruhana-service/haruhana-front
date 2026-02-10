import api from '../../../services/api'
import type {
  SignupRequest,
  LoginRequest,
  TokenResponse,
  TokenReissueRequest,
  MemberProfileResponse,
  ProfileUpdateRequest,
  PreferenceUpdateRequest,
  ApiResponseLong,
} from '../../../types/models'

// ============================================
// Auth API Service
// ============================================

/**
 * 회원가입
 * POST /v1/members/sign-up
 */
export async function signup(data: SignupRequest): Promise<number> {
  const response = await api.post<ApiResponseLong>('/v1/members/sign-up', data)
  return response.data.data // 생성된 회원 ID
}

/**
 * 로그인
 * POST /v1/auth/login
 */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<{ data: TokenResponse }>('/v1/auth/login', data)
  return response.data.data
}

/**
 * 토큰 재발급
 * POST /v1/auth/reissue
 */
export async function reissueToken(data: TokenReissueRequest): Promise<TokenResponse> {
  const response = await api.post<{ data: TokenResponse }>('/v1/auth/reissue', data)
  return response.data.data
}

/**
 * 로그아웃
 * POST /v1/auth/logout
 */
export async function logout(): Promise<void> {
  await api.post('/v1/auth/logout')
}

// ============================================
// Member API Service
// ============================================

/**
 * 프로필 조회
 * GET /v1/members
 */
export async function getProfile(): Promise<MemberProfileResponse> {
  const response = await api.get<{ data: MemberProfileResponse }>('/v1/members')
  return response.data.data
}

/**
 * 프로필 수정
 * PATCH /v1/members
 */
export async function updateProfile(data: ProfileUpdateRequest): Promise<void> {
  await api.patch('/v1/members', data)
}

/**
 * 학습 설정 수정
 * PATCH /v1/members/preferences
 */
export async function updatePreference(data: PreferenceUpdateRequest): Promise<void> {
  await api.patch('/v1/members/preferences', data)
}
