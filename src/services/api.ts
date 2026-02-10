import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY, REFRESH_TOKEN_KEY, ERROR_MESSAGES } from '../constants'
import type { ApiError } from '../types/models'

// ============================================
// Axios Instance
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// Request Interceptor (토큰 자동 추가)
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor (에러 처리 및 토큰 갱신)
// ============================================

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config

    // 401 Unauthorized - 토큰 갱신 시도
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // 토큰 갱신 API 호출
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        // 새 토큰 저장
        const newAccessToken = data.accessToken
        localStorage.setItem(TOKEN_KEY, newAccessToken)

        // 원래 요청에 새 토큰 적용
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        // 원래 요청 재시도
        return api(originalRequest)
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)

        // 로그인 페이지로 리다이렉트 (이벤트 발생)
        window.dispatchEvent(new Event('auth:logout'))

        return Promise.reject(refreshError)
      }
    }

    // 에러 응답 가공
    const apiError: ApiError = {
      message: error.response?.data?.message || getErrorMessage(error.response?.status),
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    }

    return Promise.reject(apiError)
  }
)

// ============================================
// Error Message Mapping
// ============================================

function getErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return ERROR_MESSAGES.NOT_FOUND
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      return ERROR_MESSAGES.NETWORK_ERROR
  }
}

// ============================================
// Token Management
// ============================================

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearAuthTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// ============================================
// Type Guard
// ============================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  )
}

// ============================================
// Export
// ============================================

export default api

// TypeScript 타입 확장 (retry flag)
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}
