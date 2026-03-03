import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as adminMemberService from '../services/adminMemberService'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

// ============================================
// Admin Members Page
// ============================================

const PAGE_SIZE = 20

type SelectedMember = { id: number; nickname: string; role: 'ROLE_MEMBER' | 'ROLE_ADMIN' }

export function AdminMembersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')
  const [isNicknameEdit, setIsNicknameEdit] = useState(false)
  const queryClient = useQueryClient()

  // 회원 목록
  const { data: membersData, isLoading, error } = useQuery({
    queryKey: ['admin-members', page, search],
    queryFn: () => adminMemberService.getMembers({ page, size: PAGE_SIZE, search: search || undefined }),
  })

  // 회원 학습 정보
  const { data: preferences, isLoading: prefLoading } = useQuery({
    queryKey: ['admin-member-preferences', selectedMember?.id],
    queryFn: () => adminMemberService.getMemberPreferences(selectedMember!.id),
    enabled: selectedMember !== null,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminMemberService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success('사용자가 삭제되었습니다')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'ROLE_MEMBER' | 'ROLE_ADMIN' }) =>
      adminMemberService.updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success('역할이 변경되었습니다')
      setSelectedMember(null)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    },
  })

  const updateNicknameMutation = useMutation({
    mutationFn: ({ id, nickname }: { id: number; nickname: string }) =>
      adminMemberService.updateMemberNickname(id, nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      toast.success('닉네임이 변경되었습니다')
      setIsNicknameEdit(false)
      setNicknameInput('')
      setSelectedMember(null)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    },
  })

  const members = membersData?.contents || []
  const hasNext = membersData?.hasNext || false

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const handleDeleteMember = async (id: number, nickname: string) => {
    if (window.confirm(`${nickname} 사용자를 삭제하시겠습니까?`)) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleRoleChange = (newRole: 'ROLE_MEMBER' | 'ROLE_ADMIN') => {
    if (!selectedMember || selectedMember.role === newRole) return
    if (!window.confirm(`역할을 변경하시겠습니까?`)) return
    updateRoleMutation.mutate({ id: selectedMember.id, role: newRole })
  }

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !nicknameInput.trim()) return
    updateNicknameMutation.mutate({ id: selectedMember.id, nickname: nicknameInput.trim() })
  }

  const openMemberDetail = (member: { id: number; nickname: string; role: 'ROLE_MEMBER' | 'ROLE_ADMIN' }) => {
    setSelectedMember({ id: member.id, nickname: member.nickname, role: member.role })
    setNicknameInput(member.nickname)
    setIsNicknameEdit(false)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : '오류가 발생했습니다'} />

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return { label: '관리자', cls: 'bg-slate-900 text-white' }
      case 'ROLE_MEMBER': return { label: '회원', cls: 'bg-slate-100 text-slate-700' }
      default: return { label: role, cls: 'bg-slate-50 text-slate-400' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: '활성', cls: 'text-emerald-600' }
      case 'DELETED': return { label: '삭제됨', cls: 'text-red-400' }
      default: return { label: status, cls: 'text-slate-400' }
    }
  }

  const difficultyLabel: Record<string, string> = {
    EASY: '쉬움', MEDIUM: '보통', HARD: '어려움',
  }

  const visiblePages = Array.from({ length: 5 }, (_, i) => page - 2 + i).filter((p) => p >= 0)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <h1 className="text-2xl font-black tracking-tight text-slate-900">사용자 관리</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="닉네임 또는 아이디 검색"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
        >
          검색
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(0) }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            초기화
          </button>
        )}
      </form>

      {/* List */}
      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          {search ? '검색 결과가 없습니다' : '등록된 사용자가 없습니다'}
        </div>
      ) : (
        <>
          {/* 모바일 카드 */}
          <div className="space-y-2 sm:hidden">
            {members.map((member) => {
              const role = getRoleLabel(member.role)
              const status = getStatusLabel(member.status)
              return (
                <div key={member.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{member.nickname}</p>
                      <p className="text-xs text-slate-400 truncate">{member.loginId}</p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${role.cls}`}>
                      {role.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className={status.cls}>{status.label}</span>
                      <span>{new Date(member.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openMemberDetail(member)}
                        className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.nickname)}
                        className="rounded px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">사용자</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">역할</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">상태</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">가입일</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => {
                  const role = getRoleLabel(member.role)
                  const status = getStatusLabel(member.status)
                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{member.nickname}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{member.loginId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${role.cls}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openMemberDetail(member)}
                            className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900 transition-colors"
                          >
                            상세
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.nickname)}
                            className="rounded px-2.5 py-1.5 text-xs font-semibold text-red-500 border border-red-100 hover:border-red-300 hover:bg-red-50 transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              처음
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded w-8 h-8 text-xs font-bold transition-colors ${
                  p === page
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        </>
      )}

      {/* 상세 모달 (닉네임 변경 + 역할 변경 + 학습 정보) */}
      <Modal
        isOpen={selectedMember !== null}
        onClose={() => { setSelectedMember(null); setIsNicknameEdit(false); setNicknameInput('') }}
        title={selectedMember?.nickname ?? ''}
        size="sm"
      >
        <div className="space-y-5">
          {/* 닉네임 변경 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">닉네임 변경</p>
              {!isNicknameEdit && (
                <button
                  onClick={() => setIsNicknameEdit(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  수정
                </button>
              )}
            </div>
            {isNicknameEdit ? (
              <form onSubmit={handleNicknameSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={50}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={updateNicknameMutation.isPending || !nicknameInput.trim()}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => { setIsNicknameEdit(false); setNicknameInput(selectedMember?.nickname ?? '') }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
              </form>
            ) : (
              <p className="text-sm font-semibold text-slate-900 px-1">{selectedMember?.nickname}</p>
            )}
          </div>

          {/* 역할 변경 */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">역할 변경</p>
            <div className="flex gap-2">
              {[
                { value: 'ROLE_ADMIN' as const, label: '관리자' },
                { value: 'ROLE_MEMBER' as const, label: '회원' },
              ].map((opt) => {
                const isCurrent = selectedMember?.role === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleRoleChange(opt.value)}
                    disabled={isCurrent || updateRoleMutation.isPending}
                    className={`flex-1 rounded py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900 disabled:opacity-40'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 학습 정보 */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">학습 정보</p>
            {prefLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : preferences ? (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500">카테고리 토픽</span>
                  <span className="text-sm font-semibold text-slate-900">{preferences.categoryTopic || '미설정'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500">난이도</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {difficultyLabel[preferences.difficulty] || preferences.difficulty || '미설정'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500">적용 시작일</span>
                  <span className="text-sm font-semibold text-slate-900">{preferences.effectiveAt}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">학습 정보가 없습니다</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => { setSelectedMember(null); setIsNicknameEdit(false); setNicknameInput('') }}
            fullWidth
          >
            닫기
          </Button>
        </div>
      </Modal>
    </div>
  )
}
