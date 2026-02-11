import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { ROUTES } from '../constants'
import { MainLayout } from '../components/layout/MainLayout'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('../pages/SignupPage').then(m => ({ default: m.SignupPage })))
const TodayPage = lazy(() => import('../pages/TodayPage').then(m => ({ default: m.TodayPage })))
const HistoryPage = lazy(() => import('../pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const ProblemDetailPage = lazy(() => import('../pages/ProblemDetailPage').then(m => ({ default: m.ProblemDetailPage })))
const PreferenceEditPage = lazy(() => import('../pages/PreferenceEditPage').then(m => ({ default: m.PreferenceEditPage })))
const ProfileEditPage = lazy(() => import('../pages/ProfileEditPage').then(m => ({ default: m.ProfileEditPage })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-haru-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-slate-400 animate-pulse">로딩 중...</p>
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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

        {/* Protected Routes (로그인 필요) - with TabBar */}
        <Route
          path={ROUTES.TODAY}
          element={
            <ProtectedRoute>
              <MainLayout>
                <TodayPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      <Route
        path={ROUTES.HISTORY}
        element={
          <ProtectedRoute>
            <MainLayout>
              <HistoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Preference Edit - NO TabBar (modal-like page) */}
      <Route
        path={ROUTES.PREFERENCE_EDIT}
        element={
          <ProtectedRoute>
            <PreferenceEditPage />
          </ProtectedRoute>
        }
      />
      
      {/* Problem Detail - with TabBar */}
      <Route
        path={ROUTES.PROBLEM_DETAIL}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProblemDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile Edit - with TabBar */}
      <Route
        path={ROUTES.PROFILE_EDIT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfileEditPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Home Route - 로그인 여부에 따라 리다이렉트 */}
      <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  )
}
