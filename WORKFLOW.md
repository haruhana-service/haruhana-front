# HaruHaru 개발 워크플로우

이 문서는 HaruHaru 프로젝트의 단계별 개발 작업 순서와 체크리스트를 정의합니다.

## 개발 원칙

- ✅ TDD 방식: Red → Green → Refactor
- ✅ 기능 단위로 브랜치 생성
- ✅ 각 단계 완료 후 커밋
- ✅ API 연동 전 Mock 데이터로 UI 먼저 구현
- ✅ 모바일 퍼스트 (반응형 디자인)

---

## Phase 0: 프로젝트 초기 설정 ✅ 완료

- [x] Vite + React + TypeScript 프로젝트 생성
- [x] pnpm 설치 및 의존성 설치
- [x] ESLint 설정 확인
- [x] CLAUDE.md 작성
- [x] WORKFLOW.md 작성

---

## Phase 1: 개발 환경 구축 ✅ 완료

### 1.1 필수 패키지 설치

```bash
# 라우팅
pnpm add react-router-dom
pnpm add -D @types/react-router-dom

# 상태 관리 (서버 상태)
pnpm add @tanstack/react-query
pnpm add axios

# 폼 관리
pnpm add react-hook-form
pnpm add zod @hookform/resolvers

# UI/스타일링 (선택)
# Option 1: Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Option 2: CSS Modules (이미 지원됨)

# 날짜 처리
pnpm add date-fns

# 테스트
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**체크리스트:**
- [x] 패키지 설치 완료
- [x] 스타일링 방식 결정 (Tailwind CSS v4 선택)
- [x] Tailwind 선택 시 설정 완료

### 1.2 프로젝트 구조 설정

```bash
src/
├── components/       # 공통 UI 컴포넌트
├── features/         # 기능별 모듈
│   ├── auth/
│   ├── problem/
│   ├── streak/
│   └── submission/
├── hooks/            # 커스텀 훅
├── services/         # API 서비스
│   └── api.ts
├── types/            # 타입 정의
│   └── models.ts
├── utils/            # 유틸리티
│   └── date.ts
├── constants/        # 상수
│   └── index.ts
├── routes/           # 라우트 정의
└── pages/            # 페이지 컴포넌트
```

**체크리스트:**
- [x] 디렉토리 구조 생성
- [x] `src/types/models.ts` 도메인 타입 정의
- [x] `src/services/api.ts` axios 인스턴스 설정
- [x] `src/constants/index.ts` 상수 정의
- [x] `src/utils/date.ts` 날짜 유틸리티 작성

### 1.3 라우팅 설정

**구현 파일:**
- `src/routes/index.tsx`
- `src/App.tsx` (Router 설정)

**라우트 구조:**
```
/ (홈 - 로그인 여부에 따라 리다이렉트)
/login (로그인)
/signup (회원가입)
/today (오늘의 문제 - 인증 필요)
/history (풀이 기록)
/settings (설정 변경)
```

**참고:**
- `/setup` 라우트는 제거됨 (회원가입 시 문제 설정 통합)
- GUEST/MEMBER role 시스템 제거 (인증/비인증만 구분)

**체크리스트:**
- [x] react-router-dom 설정
- [x] 라우트 정의
- [x] Protected Route 컴포넌트 작성 (인증 필요 페이지용)
- [x] ~~GuestOnly Route 컴포넌트 작성~~ (role 시스템 제거로 불필요)

### 1.4 전역 상태 및 API 설정

**구현 파일:**
- `src/services/api.ts` - axios 인스턴스, 인터셉터
- `src/services/queryClient.ts` - React Query 설정
- `src/contexts/AuthContext.tsx` - 인증 상태 관리
- `src/hooks/useAuth.ts` - 인증 훅

**체크리스트:**
- [x] axios 기본 설정 (baseURL, timeout)
- [x] 요청 인터셉터 (JWT 토큰 자동 추가)
- [x] 응답 인터셉터 (에러 처리, 토큰 갱신)
- [x] React Query 설정 (기본 옵션)
- [x] AuthContext 구현 (user, isAuthenticated, login, logout)
- [x] useAuth 훅 구현 및 테스트

---

## Phase 2: 인증 기능 구현 ✅ 완료

### 2.1 회원가입

**구현 파일:**
- ~~`src/features/auth/components/SignupForm.tsx`~~ (SignupPage에 통합)
- `src/features/auth/services/authService.ts` ✅
- ~~`src/features/auth/hooks/useSignup.ts`~~ (SignupPage에서 직접 처리)
- `src/pages/SignupPage.tsx` ✅

**기능:**
- 로그인 ID, 비밀번호, 닉네임 입력 폼 ✅
- 카테고리 선택 (CategorySelector) ✅
- 난이도 선택 (DifficultySelector) ✅
- 유효성 검증 (Zod 스키마) ✅
- 비밀번호 확인 필드 ✅
- 회원가입 성공 시 로그인 페이지로 이동 ✅

**테스트:**
```typescript
// SignupForm.test.tsx
- 필수 필드 미입력 시 에러 메시지 표시
- 비밀번호 불일치 시 에러 메시지
- 중복 ID 입력 시 에러 메시지
- 회원가입 성공 시 /login으로 리다이렉트
```

**체크리스트:**
- [x] 회원가입 폼 UI 구현
- [x] react-hook-form + zod 검증 설정
- [x] ~~useSignup 훅 구현~~ (페이지에서 직접 처리)
- [x] authService.signup API 호출 함수 작성
- [ ] 테스트 작성 및 통과 (TODO)
- [x] 에러 처리 (네트워크 에러, API 에러)

### 2.2 로그인

**구현 파일:**
- ~~`src/features/auth/components/LoginForm.tsx`~~ (LoginPage에 통합)
- ~~`src/features/auth/hooks/useLogin.ts`~~ (AuthContext 사용)
- `src/pages/LoginPage.tsx` ✅

**기능:**
- 로그인 ID, 비밀번호 입력 ✅
- JWT 토큰 저장 (localStorage) ✅
- 로그인 성공 시 `/today`로 이동 ✅
- 프로필 자동 조회 ✅

**테스트:**
```typescript
// LoginForm.test.tsx
- 필수 필드 미입력 시 에러
- 잘못된 자격증명 시 에러 메시지
- 로그인 성공 시 /today로 리다이렉트
```

**체크리스트:**
- [x] 로그인 폼 UI 구현
- [x] ~~useLogin 훅 구현~~ (AuthContext 사용)
- [x] authService.login API 호출 함수 작성
- [x] JWT 토큰 저장/관리 로직
- [x] ~~role 기반 리다이렉트 로직~~ (role 시스템 제거, /today로 통일)
- [ ] 테스트 작성 및 통과 (TODO)

### 2.3 로그아웃 및 자동 로그인

**구현 파일:**
- ~~`src/features/auth/hooks/useLogout.ts`~~ (AuthContext 사용)
- `src/components/Header.tsx` (로그아웃 버튼) - TODO

**기능:**
- 로그아웃 버튼 클릭 시 토큰 제거 ✅
- 페이지 로드 시 토큰 확인 및 자동 로그인 ✅

**체크리스트:**
- [x] ~~useLogout 훅 구현~~ (AuthContext에 통합)
- [x] 로그아웃 시 localStorage 클리어
- [x] 자동 로그인 로직 (App 초기화 시 토큰 검증)
- [x] 토큰 만료 시 자동 로그아웃

---

## Phase 3: 문제 설정 (온보딩) ✅ 부분 완료

**참고:** 회원가입 시 문제 설정을 통합하여 `/setup` 페이지는 제거됨

### 3.1 난이도 선택

**구현 파일:**
- `src/components/problem/DifficultySelector.tsx` ✅
- ~~`src/pages/SetupPage.tsx`~~ (제거됨, SignupPage에 통합)

**기능:**
- EASY, MEDIUM, HARD 선택 UI ✅
- 각 난이도 설명 표시 ✅
- 선택 상태 관리 ✅

**체크리스트:**
- [x] DifficultySelector 컴포넌트 UI
- [x] 카드 형태 선택 UI
- [ ] 접근성 (키보드 탐색, ARIA 레이블) - TODO
- [ ] 테스트 작성 - TODO

### 3.2 카테고리 선택

**구현 파일:**
- `src/components/problem/CategorySelector.tsx` ✅
- `src/services/categoryService.ts` ✅
- `src/hooks/useCategories.ts` ✅

**기능:**
- 카테고리 계층 표시 (Category → Group → Topic) ✅
- 3단계 드롭다운 선택 UI ✅
- 최종 Topic ID 선택 ✅

**체크리스트:**
- [x] 카테고리 목록 API 연동
- [x] useCategories 훅 구현
- [x] 3단계 선택 UI 구현
- [x] 선택 상태 관리
- [ ] 테스트 작성 - TODO

### 3.3 설정 제출 및 첫 문제 생성

**참고:** 회원가입 API가 난이도 + 카테고리를 함께 받으므로 별도 설정 제출은 불필요

**구현 파일:**
- ~~`src/features/problem/hooks/useSetupPreference.ts`~~ (불필요, 회원가입에 통합)
- `src/features/auth/services/authService.ts` (설정 변경용 API 함수만 필요)

**기능:**
- ~~난이도 + 카테고리 제출~~ (회원가입에 통합) ✅
- ~~role이 GUEST → MEMBER로 변경~~ (role 시스템 제거) N/A
- ~~첫 문제 즉시 생성~~ (백엔드에서 자동 처리) ✅
- ~~`/today`로 리다이렉트~~ (로그인 후 /today로 이동) ✅

**체크리스트:**
- [x] ~~useSetupPreference 훅 구현~~ (회원가입에 통합)
- [x] ~~preferenceService.setup API 연동~~ (불필요)
- [x] ~~제출 성공 시 AuthContext 업데이트~~ (회원가입 플로우로 처리)
- [x] ~~리다이렉트 로직~~ (로그인 후 자동 처리)
- [ ] 테스트 작성 및 통과 - TODO

---

## Phase 4: 오늘의 문제 표시 및 제출

### 4.1 오늘의 문제 조회

**구현 파일:**
- `src/features/problem/hooks/useTodayProblem.ts`
- `src/features/problem/services/problemService.ts`
- `src/features/problem/components/ProblemCard.tsx`
- `src/pages/TodayPage.tsx`

**기능:**
- 오늘 날짜 기준 문제 조회
- 문제 제목, 설명 표시
- 로딩/에러 상태 처리
- 문제 없음 상태 (아직 생성 안됨)

**체크리스트:**
- [ ] useTodayProblem 훅 구현
- [ ] problemService.getTodayProblem API 연동
- [ ] ProblemCard 컴포넌트 UI
- [ ] 로딩 스피너 표시
- [ ] 에러 메시지 표시
- [ ] 테스트 작성

### 4.2 답변 제출 폼

**구현 파일:**
- `src/features/submission/components/SubmissionForm.tsx`
- `src/features/submission/hooks/useSubmitAnswer.ts`
- `src/features/submission/services/submissionService.ts`

**기능:**
- 텍스트 영역 (답변 입력)
- 최소 10자 검증
- 제출 버튼
- 제출 성공 시 AI 예시 답변 표시
- 이미 제출한 경우 기존 답변 표시 (수정 가능)

**테스트:**
```typescript
// SubmissionForm.test.tsx
- 빈 답변 제출 시 에러
- 10자 미만 제출 시 에러
- 제출 성공 시 AI 답변 표시
- 23:59 이전 제출 시 isOnTime = true
- 자정 이후 제출 시 isOnTime = false
```

**체크리스트:**
- [x] SubmissionForm UI 구현
- [x] react-hook-form 검증
- [x] useSubmitAnswer 훅 구현
- [x] submissionService.submit API 연동
- [x] AI 답변 표시 컴포넌트
- [x] 테스트 작성 및 통과

### 4.3 답변 수정

**구현 파일:**
- `src/features/submission/hooks/useUpdateAnswer.ts`

**기능:**
- 같은 날(23:59 이전)에만 수정 가능
- 기존 답변 불러오기
- 수정 후 재제출

**체크리스트:**
- [x] 기존 제출 여부 확인
- [x] 기존 답변 폼에 표시
- [x] useUpdateAnswer 훅 구현
- [x] 시간 체크 로직 (수정 가능 여부)
- [x] 테스트 작성

---

## Phase 5: 스트릭 시스템

### 5.1 스트릭 표시

**구현 파일:**
- `src/features/streak/components/StreakDisplay.tsx`
- `src/features/streak/hooks/useStreak.ts`
- `src/features/streak/services/streakService.ts`

**기능:**
- 현재 스트릭 큰 숫자로 표시
- 최대 스트릭 표시
- 제출 성공 시 스트릭 업데이트 애니메이션

**체크리스트:**
- [ ] StreakDisplay 컴포넌트 UI
- [ ] useStreak 훅 구현
- [ ] streakService.getStreak API 연동
- [ ] 숫자 애니메이션 효과 (선택)
- [ ] 테스트 작성

### 5.2 스트릭 계산 로직

**구현 파일:**
- `src/utils/streak.ts` (클라이언트 표시용 유틸)

**기능:**
- 서버에서 계산된 스트릭 표시만 (클라이언트 계산 없음)
- 제출 시 낙관적 업데이트

**주의사항:**
- ⚠️ 스트릭 계산은 백엔드에서만 수행
- ⚠️ 클라이언트는 표시만 담당
- ⚠️ 시간은 항상 서버 시간 기준

**체크리스트:**
- [ ] 서버 응답에서 스트릭 데이터 파싱
- [ ] 제출 후 스트릭 쿼리 무효화 (refetch)
- [ ] 낙관적 업데이트 (선택)

---

## Phase 6: 기록 조회

### 6.1 풀이 기록 목록

**구현 파일:**
- `src/features/submission/components/SubmissionHistory.tsx`
- `src/features/submission/hooks/useSubmissionHistory.ts`
- `src/pages/HistoryPage.tsx`

**기능:**
- 날짜별 제출 기록 목록
- 제출 여부, 스트릭 반영 여부 표시
- 페이지네이션 또는 무한 스크롤

**체크리스트:**
- [ ] SubmissionHistory 컴포넌트 UI
- [ ] useSubmissionHistory 훅 구현
- [ ] 날짜 정렬 (최신순)
- [ ] 제출 여부 아이콘/뱃지
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 테스트 작성

### 6.2 풀이 상세 조회

**구현 파일:**
- `src/features/submission/components/SubmissionDetail.tsx`
- `src/features/submission/hooks/useSubmissionDetail.ts`
- `src/pages/SubmissionDetailPage.tsx`

**기능:**
- 특정 날짜의 문제 상세
- 내 답변, AI 예시 답변 표시
- 제출 시간 표시

**체크리스트:**
- [ ] SubmissionDetail 컴포넌트 UI
- [ ] useSubmissionDetail 훅 구현
- [ ] 문제 + 내 답변 + AI 답변 표시
- [ ] 뒤로 가기 버튼
- [ ] 테스트 작성

### 6.3 스트릭 현황 (잔디)

**구현 파일:**
- `src/features/streak/components/StreakCalendar.tsx`

**기능:**
- GitHub 스타일 기여도 그래프
- 문제 푼 날 강조 표시
- 최근 1년 데이터

**체크리스트:**
- [ ] 캘린더 그리드 UI
- [ ] 날짜별 제출 데이터 매핑
- [ ] 색상 구분 (제출 여부)
- [ ] 호버 시 툴팁 (날짜, 제출 여부)
- [ ] 반응형 디자인

---

## Phase 7: 설정 변경

### 7.1 문제 설정 변경

**구현 파일:**
- `src/features/problem/components/PreferenceForm.tsx`
- `src/features/problem/hooks/useUpdatePreference.ts`
- `src/pages/SettingsPage.tsx`

**기능:**
- 현재 설정 표시
- 난이도 변경
- 카테고리 변경
- 변경 사항 저장 (다음날 00:00부터 적용)

**체크리스트:**
- [ ] 현재 설정 불러오기
- [ ] PreferenceForm UI
- [ ] useUpdatePreference 훅 구현
- [ ] 변경 안내 메시지 ("다음날부터 적용됩니다")
- [ ] 테스트 작성

---

## Phase 8: 알림 (향후 구현)

### 8.1 푸시 알림 설정

**구현 파일:**
- `src/features/notification/components/NotificationSettings.tsx`
- `src/features/notification/hooks/useNotificationPermission.ts`

**기능:**
- 브라우저 알림 권한 요청
- 알림 시간 설정
- 알림 켜기/끄기

**체크리스트:**
- [ ] 알림 권한 요청 UI
- [ ] 알림 시간 선택
- [ ] 알림 설정 저장
- [ ] FCM 또는 Web Push API 연동

---

## Phase 9: UI/UX 개선

### 9.1 공통 컴포넌트

**구현 파일:**
- `src/components/Button.tsx`
- `src/components/Input.tsx`
- `src/components/TextArea.tsx`
- `src/components/LoadingSpinner.tsx`
- `src/components/ErrorMessage.tsx`
- `src/components/Modal.tsx`

**체크리스트:**
- [ ] 공통 버튼 컴포넌트 (variant 지원)
- [ ] 공통 인풋 컴포넌트 (에러 상태)
- [ ] 공통 텍스트 영역
- [ ] 로딩 스피너
- [ ] 에러 메시지 컴포넌트
- [ ] 모달 컴포넌트
- [ ] 각 컴포넌트 Storybook 또는 테스트

### 9.2 레이아웃

**구현 파일:**
- `src/components/Layout.tsx`
- `src/components/Header.tsx`
- `src/components/Navigation.tsx`

**기능:**
- 공통 헤더 (로고, 로그아웃)
- 하단 네비게이션 (Today, History, Settings)
- 반응형 레이아웃

**체크리스트:**
- [ ] Layout 컴포넌트
- [ ] Header 컴포넌트
- [ ] Navigation 컴포넌트 (모바일 하단 네비)
- [ ] 반응형 디자인 (모바일 우선)

### 9.3 애니메이션 및 피드백

**체크리스트:**
- [ ] 페이지 전환 애니메이션
- [ ] 버튼 클릭 피드백
- [ ] 스트릭 증가 축하 애니메이션
- [ ] 토스트 알림 (성공/에러)

---

## Phase 10: 테스트 및 최적화

### 10.1 통합 테스트

**테스트 시나리오:**
```typescript
// 전체 플로우 E2E 테스트
1. 회원가입 → 로그인 → 설정 → 문제 풀이 → 스트릭 확인
2. 문제 풀이 → 수정 → AI 답변 확인
3. 기록 조회 → 상세 보기
4. 설정 변경 → 다음날 적용 확인
```

**체크리스트:**
- [ ] 주요 플로우 통합 테스트
- [ ] 에러 케이스 테스트
- [ ] 엣지 케이스 테스트 (시간 경계)

### 10.2 성능 최적화

**체크리스트:**
- [ ] 번들 크기 분석 (`pnpm build` 후 확인)
- [ ] 코드 스플리팅 (React.lazy 적용)
- [ ] 이미지 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] React Query 캐시 전략 최적화
- [ ] Lighthouse 점수 확인 (90+ 목표)

### 10.3 접근성 검사

**체크리스트:**
- [ ] 키보드 탐색 가능
- [ ] 스크린 리더 테스트
- [ ] ARIA 레이블 확인
- [ ] 색상 대비 검사 (WCAG AA 이상)
- [ ] 폼 레이블 및 에러 메시지

---

## Phase 11: 배포 준비

### 11.1 환경 변수 설정

**구현 파일:**
- `.env.development`
- `.env.production`

**변수:**
```bash
VITE_API_BASE_URL=https://api.haruharu.com
VITE_ENV=production
```

**체크리스트:**
- [ ] 환경 변수 파일 생성
- [ ] .gitignore에 .env 추가
- [ ] 배포 환경별 API URL 설정

### 11.2 빌드 및 배포

**배포 플랫폼 선택:**
- Option 1: Vercel (권장 - 자동 배포)
- Option 2: Netlify
- Option 3: AWS S3 + CloudFront

**체크리스트:**
- [ ] 프로덕션 빌드 테스트 (`pnpm build`)
- [ ] 빌드 에러 수정
- [ ] 배포 플랫폼 설정
- [ ] 도메인 연결
- [ ] HTTPS 설정
- [ ] CI/CD 파이프라인 (선택)

### 11.3 모니터링 및 에러 추적

**도구:**
- Sentry (에러 추적)
- Google Analytics (선택)

**체크리스트:**
- [ ] Sentry 설정
- [ ] 에러 바운더리 추가
- [ ] 프로덕션 에러 로깅

---

## 완료 기준

### Phase별 완료 체크리스트

각 Phase는 다음 조건을 만족해야 완료로 간주:

- ✅ 모든 기능이 요구사항대로 작동
- ✅ 단위 테스트 통과
- ✅ 에러 처리 완료 (네트워크 에러, 유효성 검증)
- ✅ 로딩 상태 UI 구현
- ✅ 모바일 반응형 확인
- ✅ 접근성 기본 요구사항 충족
- ✅ Git 커밋 및 브랜치 병합

---

## 참고 사항

### Mock 데이터 작성

API가 준비되지 않은 경우 Mock 데이터 사용:

```typescript
// src/mocks/problemMock.ts
export const mockProblem: Problem = {
  id: '1',
  title: 'Spring의 IoC란 무엇인가요?',
  description: 'Spring Framework의 핵심 개념인 IoC에 대해 설명해주세요.',
  aiAnswer: '제어의 역전(Inversion of Control)은...',
  difficulty: 'MEDIUM',
  topicName: 'Spring',
  problemAt: '2026-02-10',
}
```

### 브랜치 전략

```bash
main              # 프로덕션 브랜치
├── develop       # 개발 브랜치
    ├── feature/auth-signup
    ├── feature/problem-setup
    ├── feature/today-problem
    └── feature/streak-display
```

### 커밋 메시지 예시

```bash
feat: 회원가입 폼 UI 구현
feat: useSignup 훅 및 API 연동
test: 회원가입 폼 유효성 검증 테스트 추가
fix: 로그인 후 리다이렉트 버그 수정
refactor: 날짜 유틸리티 함수 별도 모듈로 분리
style: ProblemCard 컴포넌트 스타일 개선
docs: WORKFLOW.md 업데이트
```

---

## 다음 단계

현재 위치: **Phase 2 완료** ✅

**완료된 Phase:**
- ✅ Phase 0: 프로젝트 초기 설정
- ✅ Phase 1: 개발 환경 구축
- ✅ Phase 2: 인증 기능 구현
- ✅ Phase 3: 문제 설정 (회원가입에 통합)

**다음 작업:** **Phase 4 - 오늘의 문제 표시 및 제출**

Phase 4에서 구현할 내용:
- 오늘의 문제 조회 페이지 (TodayPage)
- 문제 표시 컴포넌트
- 답변 제출 폼
- AI 예시 답변 표시

작업을 계속 진행할 준비가 되었습니다! 🚀
