import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import {
  LoginPage,
  SignupPage,
  TodayPage,
  HistoryPage,
  SettingsPage,
} from '../pages'
import { ROUTES } from '../constants'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes (로그인 전용) */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes (로그인 필요) */}
      <Route
        path={ROUTES.TODAY}
        element={
          <ProtectedRoute>
            <TodayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HISTORY}
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Home Route - 로그인 여부에 따라 리다이렉트 */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
