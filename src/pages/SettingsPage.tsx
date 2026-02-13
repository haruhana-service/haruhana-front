import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../features/auth/services/authService'
import { uploadProfileImage } from '../services/storageService'
import { Card } from '../components/ui/Card'
import { ROUTES } from '../constants'
import { formatDateKorean } from '../utils/date'
import { toast } from 'sonner'
import { getNotificationPermission, requestAndSyncFCMToken, deleteFCMToken, getSavedFCMToken } from '../services/fcmService'

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '쉬움 (기초)',
  MEDIUM: '보통 (심화)',
  HARD: '어려움 (전문가)',
}

export function SettingsPage() {
  const { user, logout, refetchProfile } = useAuth()
  const navigate = useNavigate()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [editedNickname, setEditedNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 알림 설정 상태
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const notificationSupported = 'Notification' in window

  useEffect(() => {
    if (notificationSupported) {
      setNotificationPermission(getNotificationPermission())
      setIsNotificationEnabled(!!getSavedFCMToken())
    }
  }, [notificationSupported])

  const handleEnableNotification = async () => {
    setIsNotificationLoading(true)
    try {
      const token = await requestAndSyncFCMToken()
      setNotificationPermission(getNotificationPermission())
      if (token) {
        setIsNotificationEnabled(true)
        toast.success('알림이 활성화되었습니다.')
      } else if (getNotificationPermission() === 'denied') {
        toast.error('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.')
      }
    } catch {
      toast.error('알림 설정 중 오류가 발생했습니다.')
    } finally {
      setIsNotificationLoading(false)
    }
  }

  const handleDisableNotification = async () => {
    setIsNotificationLoading(true)
    try {
      await deleteFCMToken()
      setIsNotificationEnabled(false)
      toast.success('알림이 비활성화되었습니다.')
    } catch {
      toast.error('알림 해제 중 오류가 발생했습니다.')
    } finally {
      setIsNotificationLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 검증 (예: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('이미지 파일은 5MB 이하만 업로드 가능합니다.')
        return
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.')
        return
      }

      // 파일 객체 저장
      setProfileImageFile(file)

      // 미리보기를 위한 base64 변환
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
      let profileImageKey: string | undefined

      // 프로필 이미지가 변경된 경우 업로드
      if (profileImageFile) {
        try {
          profileImageKey = await uploadProfileImage(profileImageFile)
        } catch (error) {
          console.error('Failed to upload profile image:', error)
          toast.error('프로필 이미지 업로드에 실패했습니다.')
          setIsSubmitting(false)
          return
        }
      }

      // 프로필 업데이트 (닉네임 + 이미지 키)
      await updateProfile({
        nickname: editedNickname,
        profileImageKey,
      })

      await refetchProfile()
      toast.success('프로필이 성공적으로 업데이트되었습니다.')
      setIsEditingProfile(false)
      setProfileImage(null)
      setProfileImageFile(null)
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
    setProfileImageFile(null)
    setIsEditingProfile(false)
  }

  return (
    <div className="animate-fade-up flex flex-col items-center pb-20 pt-4">
      {/* 프로필 헤더 - 프리미엄 디자인 */}
      <div className="w-full">
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
                      {profileImage || user?.profileImageUrl ? (
                        <img
                          src={profileImage || user?.profileImageUrl || ''}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
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
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm sm:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
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

      {/* 설정 리스트 섹션 */}
      <div className="w-full space-y-6 mt-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between ml-1 pr-1">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1 h-4 bg-haru-600 rounded-full"></span>
              현재 학습 설정
            </h3>
            <button
              onClick={() => navigate(ROUTES.PREFERENCE_EDIT)}
              className="text-[12px] font-bold text-haru-600 hover:text-haru-700 transition-colors tracking-wide"
            >
              변경
            </button>
          </div>

          <Card className="!p-0 border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex justify-between items-center group transition-colors hover:bg-slate-50/50">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">현재 난이도</p>
                  <p className="font-bold text-slate-800 text-[15px]">
                    {user?.difficulty ? DIFFICULTY_LABELS[user.difficulty] || user.difficulty : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-haru-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center group transition-colors hover:bg-slate-50/50">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">학습 주제</p>
                  <p className="font-bold text-slate-800 text-[15px]">{user?.categoryTopicName || '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-haru-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 알림 설정 섹션 */}
        <section className="space-y-3">
          <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <span className="w-1 h-4 bg-haru-600 rounded-full"></span>
            알림 설정
          </h3>

          <div className="w-full p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-haru-50 flex items-center justify-center text-haru-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <span className="text-[15px] font-bold text-slate-700">푸시 알림</span>
                  {!notificationSupported ? (
                    <p className="text-[12px] font-medium text-slate-400 mt-0.5">이 브라우저에서 지원하지 않습니다</p>
                  ) : notificationPermission === 'denied' ? (
                    <p className="text-[12px] font-medium text-red-500 mt-0.5">차단됨</p>
                  ) : isNotificationEnabled ? (
                    <p className="text-[12px] font-medium text-green-600 mt-0.5">허용됨</p>
                  ) : (
                    <p className="text-[12px] font-medium text-slate-400 mt-0.5">미설정</p>
                  )}
                </div>
              </div>

              {notificationSupported && notificationPermission !== 'denied' && (
                <button
                  onClick={isNotificationEnabled ? handleDisableNotification : handleEnableNotification}
                  disabled={isNotificationLoading}
                  className={`relative w-[52px] h-[30px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-haru-500/30 disabled:opacity-50 ${
                    isNotificationEnabled ? 'bg-haru-500' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={isNotificationEnabled}
                  aria-label="푸시 알림 토글"
                >
                  <div
                    className={`absolute top-[3px] left-[3px] w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      isNotificationEnabled ? 'translate-x-[22px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            {notificationPermission === 'denied' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                  브라우저에서 알림이 차단되어 있습니다. 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림을 허용해주세요.
                </p>
              </div>
            )}

            {!notificationSupported && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                  현재 브라우저에서는 푸시 알림을 지원하지 않습니다. Chrome, Edge, Firefox 등의 브라우저를 이용해주세요.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">나의 계정</h3>
          <button
            onClick={logout}
            className="w-full p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 hover:bg-red-50/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                서비스 로그아웃
              </span>
            </div>
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-red-300 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        <div className="text-center pt-10 opacity-30">
          <p className="text-[12px] text-slate-400 font-extrabold tracking-[0.3em] uppercase italic">
            HaruHaru Intelligence v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
