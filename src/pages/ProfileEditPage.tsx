import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../features/auth/services/authService'
import { ROUTES } from '../constants'
import { toast } from 'sonner'
import { formatDateKorean } from '../utils/date'

export function ProfileEditPage() {
  const { user, refetchProfile } = useAuth()
  const navigate = useNavigate()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [editedNickname, setEditedNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartEditProfile = () => {
    setEditedNickname(user?.nickname || '')
    setIsEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    if (!editedNickname.trim()) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (editedNickname.length < 2) {
      toast.error('닉네임은 2자 이상이어야 합니다.')
      return
    }

    if (editedNickname.length > 50) {
      toast.error('닉네임은 50자를 초과할 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      await updateProfile({ nickname: editedNickname })
      await refetchProfile()
      toast.success('프로필이 성공적으로 업데이트되었습니다.')
      setIsEditingProfile(false)
      setProfileImage(null)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('프로필 업데이트에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEditProfile = () => {
    setEditedNickname('')
    setProfileImage(null)
    setIsEditingProfile(false)
  }

  const handleBack = () => {
    navigate(ROUTES.SETTINGS)
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4 sm:py-8 pb-24 animate-fade-in min-w-0">
      {/* 헤더 */}
      <div className="flex items-center gap-3 animate-slide-in-left">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">프로필 수정</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">닉네임과 프로필 사진을 변경할 수 있습니다</p>
        </div>
      </div>

      {/* 프로필 카드 - 프리미엄 디자인 */}
      <div className="animate-slide-in-up min-w-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-haru-500 via-haru-600 to-haru-700 rounded-xl sm:rounded-2xl shadow-premium-lg min-w-0">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative px-4 sm:px-6 py-4 sm:py-6 min-w-0">
            {/* 수정 버튼 - 우측 상단 고정 */}
            {!isEditingProfile && (
              <button
                onClick={handleStartEditProfile}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all group z-10"
                title="프로필 수정"
              >
                <svg
                  className="w-4 h-4 text-white/80 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}

            {isEditingProfile ? (
              // 프로필 수정 모드
              <div className="space-y-3 sm:space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow"></div>
                    <p className="text-haru-100 text-xs font-semibold tracking-wide uppercase">프로필 수정</p>
                  </div>
                  <button
                    onClick={handleCancelEditProfile}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
                    disabled={isSubmitting}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 프로필 이미지 + 닉네임 입력 (항상 가로 배치) */}
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* 프로필 이미지 업로드 */}
                  <div className="relative group flex-shrink-0">
                    <input
                      type="file"
                      id="profile-image-upload-edit"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="profile-image-upload-edit"
                      className={`block w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg transition-all hover:border-white/50 ${
                        isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                          {(editedNickname || user?.nickname || 'H')[0]}
                        </div>
                      )}
                      {!isSubmitting && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* 닉네임 입력 */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-white/80 text-xs sm:text-sm font-medium mb-1.5">닉네임</label>
                    <input
                      type="text"
                      value={editedNickname}
                      onChange={(e) => setEditedNickname(e.target.value)}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="닉네임 입력"
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancelEditProfile}
                    className="flex-1 px-3 py-2.5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={!editedNickname.trim() || isSubmitting}
                    className="flex-1 px-3 py-2.5 sm:py-3 rounded-xl bg-white text-haru-600 text-sm font-bold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              // 일반 표시 모드
              <div className="pr-10 sm:pr-12">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* 프로필 이미지 */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                          {(user?.nickname || 'H')[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow"></div>
                      <p className="text-haru-100 text-[10px] sm:text-xs font-semibold tracking-wide uppercase">
                        학습자 프로필
                      </p>
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5 truncate">
                      {user?.nickname || '-'}님
                    </h2>

                    {user?.createdAt && (
                      <div className="inline-flex items-center gap-1.5 text-white/70">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-medium">{formatDateKorean(user.createdAt)} 가입</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      {!isEditingProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slide-in-up delay-100">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 mb-1">프로필 수정하기</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                우측 상단의 수정 버튼을 클릭하여 프로필 사진과 닉네임을 변경할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
