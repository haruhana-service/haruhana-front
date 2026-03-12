import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { AppRoutes } from './routes'
import { queryClient } from './services/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  border: '1px solid #ebf0ff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(74, 105, 255, 0.12)',
                  color: '#1a1f36',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
