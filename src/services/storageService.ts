import api from './api'
import type {
  PresignedCreateRequest,
  PresignedUrlResponse,
  StorageUploadCompleteRequest,
} from '../types/models'

// ============================================
// Storage API Service
// ============================================

/**
 * Presigned URL 생성
 * POST /v1/storage/presigned-url
 * @param data - 파일명과 업로드 타입
 * @returns presignedUrl (3분 유효), objectKey
 */
export async function createPresignedUrl(data: PresignedCreateRequest): Promise<PresignedUrlResponse> {
  const response = await api.post<{ data: PresignedUrlResponse }>('/v1/storage/presigned-url', data)
  return response.data.data
}

/**
 * Presigned URL을 사용하여 S3에 파일 업로드
 * @param presignedUrl - S3 Presigned URL
 * @param file - 업로드할 파일
 */
export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다.')
  }
}

/**
 * 업로드 완료 알림
 * POST /v1/storage/upload-complete
 * @param data - objectKey
 */
export async function notifyUploadComplete(data: StorageUploadCompleteRequest): Promise<void> {
  await api.post('/v1/storage/upload-complete', data)
}

/**
 * 프로필 이미지 전체 업로드 프로세스
 * 1. Presigned URL 생성
 * 2. S3에 파일 업로드
 * 3. 업로드 완료 알림
 * @param file - 업로드할 이미지 파일
 * @returns objectKey - 프로필 업데이트 시 사용할 키
 */
export async function uploadProfileImage(file: File): Promise<string> {
  // 1. Presigned URL 생성
  const { presignedUrl, objectKey } = await createPresignedUrl({
    fileName: file.name,
    uploadType: 'PROFILE_IMAGE',
  })

  // 2. S3에 파일 업로드
  await uploadToS3(presignedUrl, file)

  // 3. 업로드 완료 알림
  await notifyUploadComplete({ objectKey })

  return objectKey
}
