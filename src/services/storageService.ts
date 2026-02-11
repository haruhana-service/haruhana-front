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
  console.log('[S3 Upload] Starting upload...', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    url: presignedUrl.substring(0, 100) + '...',
  })

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  console.log('[S3 Upload] Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[S3 Upload] Error details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    })
    throw new Error(`파일 업로드에 실패했습니다. (${response.status} ${response.statusText})`)
  }

  console.log('[S3 Upload] Upload successful!')
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
  console.log('[Upload Process] Starting profile image upload...', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  })

  try {
    // 1. Presigned URL 생성
    console.log('[Upload Process] Step 1: Creating Presigned URL...')
    const { presignedUrl, objectKey } = await createPresignedUrl({
      fileName: file.name,
      uploadType: 'PROFILE_IMAGE',
    })
    console.log('[Upload Process] Presigned URL created:', { objectKey })

    // 2. S3에 파일 업로드
    console.log('[Upload Process] Step 2: Uploading to S3...')
    await uploadToS3(presignedUrl, file)
    console.log('[Upload Process] S3 upload complete')

    // 3. 업로드 완료 알림
    console.log('[Upload Process] Step 3: Notifying upload complete...')
    await notifyUploadComplete({ objectKey })
    console.log('[Upload Process] Upload complete notification sent')

    console.log('[Upload Process] ✅ All steps completed successfully!')
    return objectKey
  } catch (error) {
    console.error('[Upload Process] ❌ Upload failed:', error)
    throw error
  }
}
