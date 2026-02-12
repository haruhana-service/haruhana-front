import { createContext } from 'react'
import type { MemberProfileResponse, TokenResponse } from '../types/models'

// ============================================
// AuthContext Types
// ============================================

export interface AuthContextType {
  user: MemberProfileResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (tokenResponse: TokenResponse) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: MemberProfileResponse) => void
  refetchProfile: () => Promise<void>
}

// ============================================
// AuthContext
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
