import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock FCM service (jsdom에서 Firebase Messaging 미지원)
vi.mock('../services/fcmService', () => ({
  requestAndSyncFCMToken: vi.fn().mockResolvedValue(null),
  deleteFCMToken: vi.fn().mockResolvedValue(undefined),
  onMessageReceived: vi.fn().mockReturnValue(null),
  getNotificationPermission: vi.fn().mockReturnValue('default'),
  wasPermissionDenied: vi.fn().mockReturnValue(false),
  getSavedFCMToken: vi.fn().mockReturnValue(null),
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})
