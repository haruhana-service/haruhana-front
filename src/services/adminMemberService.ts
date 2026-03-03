import api from './api'

// ============================================
// Admin Member API Service
// ============================================

export interface AdminMemberPreviewResponse {
  id: number
  loginId: string
  nickname: string
  role: 'ROLE_MEMBER' | 'ROLE_ADMIN'
  lastLoginAt: string | null
  createdAt: string
  status: 'ACTIVE' | 'DELETED'
}

export interface AdminMemberPreferenceResponse {
  id: number
  memberId: number
  categoryTopic: string
  difficulty: string
  effectiveAt: string
}

export interface MembersListResponse {
  contents: AdminMemberPreviewResponse[]
  hasNext: boolean
}

/**
 * 사용자 목록 조회 (관리자용)
 * GET /v1/admin/members?search={search}&sortBy={sortBy}&page={page}&size={size}
 */
export async function getMembers(params?: {
  search?: string
  sortBy?: string
  page?: number
  size?: number
}): Promise<MembersListResponse> {
  const response = await api.get<{ data: MembersListResponse }>(
    '/v1/admin/members',
    { params }
  )
  return response.data.data
}

/**
 * 회원 닉네임 변경 (관리자용)
 * PATCH /v1/admin/members/{memberId}/nicknames
 */
export async function updateMemberNickname(memberId: number, nickname: string): Promise<void> {
  await api.patch(`/v1/admin/members/${memberId}/nicknames`, { nickname })
}

/**
 * 사용자 역할 변경 (관리자용)
 * PATCH /v1/admin/members/{memberId}/roles
 */
export async function updateMemberRole(memberId: number, role: 'ROLE_MEMBER' | 'ROLE_ADMIN'): Promise<void> {
  await api.patch(`/v1/admin/members/${memberId}/roles`, { role })
}

/**
 * 사용자 삭제 (관리자용)
 * DELETE /v1/admin/members/{memberId}
 */
export async function deleteMember(memberId: number): Promise<void> {
  await api.delete(`/v1/admin/members/${memberId}`)
}

/**
 * 사용자 선호도 조회 (관리자용)
 * GET /v1/admin/members/{memberId}/preferences
 */
export async function getMemberPreferences(memberId: number): Promise<AdminMemberPreferenceResponse> {
  const response = await api.get<{ data: AdminMemberPreferenceResponse }>(
    `/v1/admin/members/${memberId}/preferences`
  )
  return response.data.data
}
