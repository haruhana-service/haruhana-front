import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { AppRoutes } from './routes'
import { queryClient } from './services/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  useEffect(() => {
    const findScrollableAncestor = (start: HTMLElement | null) => {
      let el = start
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.getAttribute('data-scroll-container') === 'true') {
          return el
        }

        const style = window.getComputedStyle(el)
        const overflowY = style.overflowY
        const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight
        if (canScroll) {
          return el
        }

        el = el.parentElement
      }
        return null
      }

    const onTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null
      const scrollContainer = findScrollableAncestor(target)

      // 스크롤 가능한 컨테이너 밖에서만 바운스를 차단
      if (!scrollContainer) {
        event.preventDefault()
      }
    }

    document.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

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
