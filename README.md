# HaruHaru - 하루하루 면접 문제 학습 플랫폼

매일 하나씩 면접 문제를 풀고, 스트릭을 쌓아가며 성장하는 학습 플랫폼입니다.

## 🎯 주요 기능

- **📚 매일 새로운 문제**: 선택한 난이도와 주제에 맞는 면접 문제 제공
- **✍️ 답변 제출**: 자신의 답변을 작성하고 AI 예시 답변과 비교
- **🔥 스트릭 시스템**: 연속 학습 일수를 추적하여 학습 습관 형성
- **📅 학습 기록**: 월별 캘린더로 학습 이력 확인
- **⚙️ 맞춤 설정**: 난이도와 학습 주제를 자유롭게 변경

## 🛠️ 기술 스택

- **Frontend**: React 19.2.0 + TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router 7
- **State Management**: React Query (서버 상태), Context API (전역 상태)
- **Form**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Testing Library
- **PWA**: Vite PWA Plugin

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- pnpm 8+

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 테스트 실행
pnpm test

# 테스트 커버리지
pnpm test:coverage
```

## 🌐 환경 변수

프로젝트 루트에 `.env.development` 또는 `.env.production` 파일을 생성하세요.

```bash
# API 서버 주소
VITE_API_BASE_URL=https://api.haruharu.online

# 환경 구분
VITE_ENV=development
```

## 📦 빌드 결과

- **메인 번들**: 338KB (gzip: 109KB)
- **페이지별 청크 분리**: 초기 로딩 최적화
- **PWA 지원**: 오프라인 캐싱 (970KB)

## 🧪 테스트

- **총 테스트**: 142개 ✅ (73% 증가)
- **커버리지**: 주요 기능 및 공통 UI 컴포넌트 테스트 완료
- **테스트 파일**: 17개

## 📱 배포

이 프로젝트는 Vercel에 배포하도록 설정되어 있습니다.

```bash
# 프로덕션 빌드 테스트
pnpm build

# Vercel CLI로 배포 (선택사항)
vercel deploy
```

## 📂 프로젝트 구조

```
src/
├── components/       # 공통 UI 컴포넌트
├── features/         # 기능별 모듈
│   ├── auth/        # 인증
│   ├── problem/     # 문제
│   ├── streak/      # 스트릭
│   └── submission/  # 제출
├── hooks/           # 커스텀 훅
├── services/        # API 서비스
├── types/           # 타입 정의
├── utils/           # 유틸리티
├── constants/       # 상수
├── routes/          # 라우트 정의
└── pages/           # 페이지 컴포넌트
```

## 🔐 인증

- JWT 기반 인증
- Access Token + Refresh Token
- 자동 로그인 지원

## 📄 라이선스

MIT

---

**개발 중 문제가 발생하면 [WORKFLOW.md](WORKFLOW.md)를 참고하세요.**
