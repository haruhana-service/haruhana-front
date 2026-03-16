import { describe, it, expect } from 'vitest'
import {
  signupSchema,
  loginSchema,
  submitAnswerSchema,
  profileUpdateSchema,
  preferenceUpdateSchema,
} from './validations'
import { VALIDATION } from '../constants'

describe('loginSchema', () => {
  it('유효한 로그인 데이터를 통과시킨다', () => {
    const result = loginSchema.safeParse({ loginId: 'user1', password: 'pass1234' })
    expect(result.success).toBe(true)
  })

  it('loginId가 빈 문자열이면 실패한다', () => {
    const result = loginSchema.safeParse({ loginId: '', password: 'pass1234' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('로그인 ID를 입력해주세요')
  })

  it('password가 빈 문자열이면 실패한다', () => {
    const result = loginSchema.safeParse({ loginId: 'user1', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('비밀번호를 입력해주세요')
  })
})

describe('signupSchema', () => {
  const validData = {
    loginId: 'testuser',
    password: 'Password1',
    passwordConfirm: 'Password1',
    nickname: '테스트유저',
    categoryTopicId: 1,
    difficulty: 'EASY' as const,
  }

  it('유효한 회원가입 데이터를 통과시킨다', () => {
    const result = signupSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('loginId가 빈 문자열이면 실패한다', () => {
    const result = signupSchema.safeParse({ ...validData, loginId: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('로그인 ID를 입력해주세요')
  })

  it(`loginId가 ${VALIDATION.LOGIN_ID_MAX_LENGTH}자 초과이면 실패한다`, () => {
    const result = signupSchema.safeParse({
      ...validData,
      loginId: 'a'.repeat(VALIDATION.LOGIN_ID_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain(`로그인 ID는 최대 ${VALIDATION.LOGIN_ID_MAX_LENGTH}자입니다`)
  })

  it(`비밀번호가 ${VALIDATION.PASSWORD_MIN_LENGTH}자 미만이면 실패한다`, () => {
    const result = signupSchema.safeParse({ ...validData, password: 'Pa1', passwordConfirm: 'Pa1' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자입니다`)
  })

  it('비밀번호에 대문자가 없으면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'password1',
      passwordConfirm: 'password1',
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다')
  })

  it('비밀번호에 소문자가 없으면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'PASSWORD1',
      passwordConfirm: 'PASSWORD1',
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다')
  })

  it('비밀번호에 숫자가 없으면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'PasswordOnly',
      passwordConfirm: 'PasswordOnly',
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다')
  })

  it('비밀번호와 비밀번호 확인이 다르면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: 'Password1',
      passwordConfirm: 'Password2',
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('비밀번호가 일치하지 않습니다')
  })

  it('닉네임이 빈 문자열이면 실패한다', () => {
    const result = signupSchema.safeParse({ ...validData, nickname: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('닉네임을 입력해주세요')
  })

  it(`닉네임이 ${VALIDATION.NICKNAME_MAX_LENGTH}자 초과이면 실패한다`, () => {
    const result = signupSchema.safeParse({
      ...validData,
      nickname: 'a'.repeat(VALIDATION.NICKNAME_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain(`닉네임은 최대 ${VALIDATION.NICKNAME_MAX_LENGTH}자입니다`)
  })

  it('categoryTopicId가 없으면 실패한다', () => {
    const { categoryTopicId: _, ...rest } = validData
    const result = signupSchema.safeParse(rest)
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('카테고리를 선택해주세요')
  })

  it('유효하지 않은 difficulty이면 실패한다', () => {
    const result = signupSchema.safeParse({ ...validData, difficulty: 'VERY_HARD' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('난이도를 선택해주세요')
  })

  it('difficulty가 MEDIUM, HARD도 통과된다', () => {
    expect(signupSchema.safeParse({ ...validData, difficulty: 'MEDIUM' }).success).toBe(true)
    expect(signupSchema.safeParse({ ...validData, difficulty: 'HARD' }).success).toBe(true)
  })
})

describe('submitAnswerSchema', () => {
  it('유효한 답변을 통과시킨다', () => {
    const result = submitAnswerSchema.safeParse({ userAnswer: '이것은 테스트 답변입니다.' })
    expect(result.success).toBe(true)
  })

  it('빈 답변이면 실패한다', () => {
    const result = submitAnswerSchema.safeParse({ userAnswer: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('답변을 입력해주세요')
  })

  it(`답변이 ${VALIDATION.ANSWER_MAX_LENGTH}자 초과이면 실패한다`, () => {
    const result = submitAnswerSchema.safeParse({
      userAnswer: 'a'.repeat(VALIDATION.ANSWER_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      `답변은 최대 ${VALIDATION.ANSWER_MAX_LENGTH}자입니다`
    )
  })

  it(`정확히 ${VALIDATION.ANSWER_MAX_LENGTH}자인 답변은 통과된다`, () => {
    const result = submitAnswerSchema.safeParse({
      userAnswer: 'a'.repeat(VALIDATION.ANSWER_MAX_LENGTH),
    })
    expect(result.success).toBe(true)
  })
})

describe('profileUpdateSchema', () => {
  it('유효한 닉네임을 통과시킨다', () => {
    const result = profileUpdateSchema.safeParse({ nickname: '새닉네임' })
    expect(result.success).toBe(true)
  })

  it('빈 닉네임이면 실패한다', () => {
    const result = profileUpdateSchema.safeParse({ nickname: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('닉네임을 입력해주세요')
  })

  it(`닉네임이 ${VALIDATION.NICKNAME_MAX_LENGTH}자 초과이면 실패한다`, () => {
    const result = profileUpdateSchema.safeParse({
      nickname: 'a'.repeat(VALIDATION.NICKNAME_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      `닉네임은 최대 ${VALIDATION.NICKNAME_MAX_LENGTH}자입니다`
    )
  })
})

describe('preferenceUpdateSchema', () => {
  it('유효한 설정 데이터를 통과시킨다', () => {
    const result = preferenceUpdateSchema.safeParse({ categoryTopicId: 1, difficulty: 'MEDIUM' })
    expect(result.success).toBe(true)
  })

  it('categoryTopicId가 없으면 실패한다', () => {
    const result = preferenceUpdateSchema.safeParse({ difficulty: 'EASY' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('카테고리를 선택해주세요')
  })

  it('유효하지 않은 difficulty이면 실패한다', () => {
    const result = preferenceUpdateSchema.safeParse({
      categoryTopicId: 1,
      difficulty: 'INVALID',
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message)
    expect(messages).toContain('난이도를 선택해주세요')
  })

  it('EASY, MEDIUM, HARD 모두 통과된다', () => {
    for (const difficulty of ['EASY', 'MEDIUM', 'HARD'] as const) {
      const result = preferenceUpdateSchema.safeParse({ categoryTopicId: 1, difficulty })
      expect(result.success).toBe(true)
    }
  })
})
