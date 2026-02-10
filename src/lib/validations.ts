import { z } from 'zod'
import { VALIDATION } from '../constants'

// ============================================
// 회원가입 스키마
// ============================================

export const signupSchema = z
  .object({
    loginId: z
      .string()
      .min(1, '로그인 ID를 입력해주세요')
      .max(VALIDATION.LOGIN_ID_MAX_LENGTH, `로그인 ID는 최대 ${VALIDATION.LOGIN_ID_MAX_LENGTH}자입니다`),
    password: z
      .string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, `비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자입니다`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
      ),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    nickname: z
      .string()
      .min(1, '닉네임을 입력해주세요')
      .max(VALIDATION.NICKNAME_MAX_LENGTH, `닉네임은 최대 ${VALIDATION.NICKNAME_MAX_LENGTH}자입니다`),
    categoryTopicId: z.number({ message: '카테고리를 선택해주세요' }),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], { message: '난이도를 선택해주세요' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })

export type SignupFormData = z.infer<typeof signupSchema>

// ============================================
// 로그인 스키마
// ============================================

export const loginSchema = z.object({
  loginId: z.string().min(1, '로그인 ID를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================
// 문제 제출 스키마
// ============================================

export const submitAnswerSchema = z.object({
  userAnswer: z
    .string()
    .min(1, '답변을 입력해주세요')
    .max(VALIDATION.ANSWER_MAX_LENGTH, `답변은 최대 ${VALIDATION.ANSWER_MAX_LENGTH}자입니다`),
})

export type SubmitAnswerFormData = z.infer<typeof submitAnswerSchema>

// ============================================
// 프로필 수정 스키마
// ============================================

export const profileUpdateSchema = z.object({
  nickname: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(VALIDATION.NICKNAME_MAX_LENGTH, `닉네임은 최대 ${VALIDATION.NICKNAME_MAX_LENGTH}자입니다`),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// ============================================
// 학습 설정 변경 스키마
// ============================================

export const preferenceUpdateSchema = z.object({
  categoryTopicId: z.number({ message: '카테고리를 선택해주세요' }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], { message: '난이도를 선택해주세요' }),
})

export type PreferenceUpdateFormData = z.infer<typeof preferenceUpdateSchema>
