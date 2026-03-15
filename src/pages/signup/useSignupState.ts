import { useEffect, useMemo, useState } from 'react'
import { checkLoginIdAvailability, checkNicknameAvailability } from '../../features/auth/services/authService'
import { isApiError } from '../../services/api'

interface UseSignupStateParams {
  loginIdValue: string
  passwordValue: string
  passwordConfirmValue: string
  nicknameValue: string
  categoryTopicIdValue: number | undefined
  difficultyValue: string | undefined
  checkedLoginId: string
  setCheckedLoginId: (value: string) => void
  checkedNickname: string
  setCheckedNickname: (value: string) => void
  trigger: (fields: Array<'loginId' | 'password' | 'passwordConfirm' | 'nickname'>) => Promise<boolean>
  getValues: (name: 'loginId' | 'password' | 'passwordConfirm') => string
  setApiError: (message: string | undefined) => void
  setIsLoginIdChecked: (value: boolean) => void
  setIsLoginIdAvailable: (value: boolean | null) => void
  setIsCheckingLoginId: (value: boolean) => void
  isLoginIdChecked: boolean
  isLoginIdAvailable: boolean | null
  isCheckingLoginId: boolean
  setIsNicknameChecked: (value: boolean) => void
  setIsNicknameAvailable: (value: boolean | null) => void
  setIsCheckingNickname: (value: boolean) => void
  isCheckingNickname: boolean
  isNicknameChecked: boolean
  isNicknameAvailable: boolean | null
}

export function useSignupState({
  loginIdValue,
  passwordValue,
  passwordConfirmValue,
  nicknameValue,
  categoryTopicIdValue,
  difficultyValue,
  checkedLoginId,
  setCheckedLoginId,
  checkedNickname,
  setCheckedNickname,
  trigger,
  getValues,
  setApiError,
  setIsLoginIdChecked,
  setIsLoginIdAvailable,
  setIsCheckingLoginId,
  isLoginIdChecked,
  isLoginIdAvailable,
  isCheckingLoginId,
  setIsNicknameChecked,
  setIsNicknameAvailable,
  setIsCheckingNickname,
  isNicknameChecked,
  isCheckingNickname,
}: UseSignupStateParams) {
  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false)

  useEffect(() => {
    const normalizedLoginId = loginIdValue.trim()
    if (normalizedLoginId !== checkedLoginId) {
      setIsLoginIdChecked(false)
      setIsLoginIdAvailable(null)
    }
  }, [checkedLoginId, loginIdValue, setIsLoginIdChecked, setIsLoginIdAvailable])

  useEffect(() => {
    const normalizedNickname = nicknameValue.trim()
    if (normalizedNickname !== checkedNickname) {
      setIsNicknameChecked(false)
      setIsNicknameAvailable(null)
    }
  }, [checkedNickname, nicknameValue, setIsNicknameChecked, setIsNicknameAvailable])

  useEffect(() => {
    setIsPasswordMismatch(
      passwordValue.length > 0 && passwordConfirmValue.length > 0 && passwordValue !== passwordConfirmValue
    )
  }, [passwordValue, passwordConfirmValue])

  const canProceedStep1 = useMemo(() => {
    const normalizedLoginId = loginIdValue.trim()
    const hasAccountValues =
      normalizedLoginId.length > 0 && passwordValue.length > 0 && passwordConfirmValue.length > 0
    const isPasswordMatch = passwordValue === passwordConfirmValue

    return (
      hasAccountValues &&
      isPasswordMatch &&
      isLoginIdChecked &&
      isLoginIdAvailable === true &&
      checkedLoginId === normalizedLoginId
    )
  }, [
    checkedLoginId,
    isLoginIdAvailable,
    isLoginIdChecked,
    loginIdValue,
    passwordConfirmValue,
    passwordValue,
  ])

  const isStep3Incomplete = useMemo(
    () => !categoryTopicIdValue || !difficultyValue,
    [categoryTopicIdValue, difficultyValue]
  )

  const handleCheckLoginId = async (reason: 'manual' | 'auto' = 'manual') => {
    if (reason === 'manual') {
      setApiError(undefined)
    }

    const isValid = await trigger(['loginId'])
    if (!isValid) return

    const normalizedLoginId = getValues('loginId').trim()

    try {
      setIsCheckingLoginId(true)
      const available = await checkLoginIdAvailability(normalizedLoginId)

      setCheckedLoginId(normalizedLoginId)
      setIsLoginIdChecked(true)
      setIsLoginIdAvailable(available)

      if (!available && reason === 'manual') {
        setApiError('이미 사용 중인 아이디입니다')
      }
    } catch (error) {
      console.error('Login ID check failed:', error)
      setIsLoginIdChecked(false)
      setIsLoginIdAvailable(null)

      if (isApiError(error)) {
        if (reason === 'manual') {
          setApiError(error.message || '아이디 중복 확인 중 오류가 발생했습니다')
        }
      } else if (reason === 'manual') {
        setApiError('아이디 중복 확인 중 오류가 발생했습니다')
      }
    } finally {
      setIsCheckingLoginId(false)
    }
  }

  const handleCheckNickname = async (reason: 'manual' | 'auto' = 'manual') => {
    if (reason === 'manual') {
      setApiError(undefined)
    }

    const isValid = await trigger(['nickname'])
    if (!isValid) return

    const normalizedNickname = nicknameValue.trim()

    try {
      setIsCheckingNickname(true)
      const available = await checkNicknameAvailability(normalizedNickname)

      setCheckedNickname(normalizedNickname)
      setIsNicknameChecked(true)
      setIsNicknameAvailable(available)

      if (!available && reason === 'manual') {
        setApiError('이미 사용 중인 닉네임입니다')
      }
    } catch (error) {
      console.error('Nickname check failed:', error)
      setIsNicknameChecked(false)
      setIsNicknameAvailable(null)

      if (isApiError(error)) {
        if (reason === 'manual') {
          setApiError(error.message || '닉네임 중복 확인 중 오류가 발생했습니다')
        }
      } else if (reason === 'manual') {
        setApiError('닉네임 중복 확인 중 오류가 발생했습니다')
      }
    } finally {
      setIsCheckingNickname(false)
    }
  }

  useEffect(() => {
    const normalizedLoginId = loginIdValue.trim()
    if (normalizedLoginId.length === 0) return
    if (isCheckingLoginId) return
    if (isLoginIdChecked && checkedLoginId === normalizedLoginId) return

    const timeoutId = window.setTimeout(() => {
      void handleCheckLoginId('auto')
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [checkedLoginId, isCheckingLoginId, isLoginIdChecked, loginIdValue])

  useEffect(() => {
    const normalizedNickname = nicknameValue.trim()
    if (normalizedNickname.length === 0) return
    if (isCheckingNickname) return
    if (isNicknameChecked && checkedNickname === normalizedNickname) return

    const timeoutId = window.setTimeout(() => {
      void handleCheckNickname('auto')
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [checkedNickname, isCheckingNickname, isNicknameChecked, nicknameValue])

  return {
    isPasswordMismatch,
    canProceedStep1,
    isStep3Incomplete,
  }
}
