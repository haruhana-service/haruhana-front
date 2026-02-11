import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// TODO: PWA 플러그인 설치 후 활성화
// import { registerSW } from 'virtual:pwa-register'

// Register Service Worker
// TODO: PWA 플러그인 설치 후 활성화
// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
//       updateSW(true)
//     }
//   },
//   onOfflineReady() {
//     console.log('오프라인 모드 준비 완료')
//   },
// })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
