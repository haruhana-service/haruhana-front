# CLAUDE.md

이 파일은 Claude Code가 이 레포지토리에서 작업할 때 참고하는 가이드입니다.

**HaruHaru** - 꾸준함을 기르기 위한 하루 1문제 풀이 서비스. 경쟁과 비교 없이 개인의 성장에만 집중합니다.

## 프로젝트 철학

- **하루 딱 1문제** - 가볍고 부담 없이
- **스트릭 시스템** - 완벽함보다 꾸준함
- **경쟁 ❌, 비교 ❌** - 오직 나 자신과의 싸움
- **AI 생성 문제** - 다양한 난이도와 주제

## 기술 스택

- React 19.2.0 + TypeScript 5.9.3
- Vite 7.3.1 (빠른 HMR, 최적화된 빌드)
- pnpm (패키지 매니저 - **반드시 pnpm 사용**, npm/yarn 사용 금지)
- ESLint (React hooks + TypeScript 규칙)

## 명령어

```bash
# 개발
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 시작 (localhost:5173)
pnpm build            # 타입 체크 + 프로덕션 빌드
pnpm lint             # ESLint 실행
pnpm preview          # 프로덕션 빌드 미리보기

# 테스트 (추가 예정)
pnpm test             # 테스트 실행
pnpm test:watch       # 테스트 watch 모드
pnpm test:coverage    # 커버리지 리포트 생성
```

## 개발 원칙

### 켄트 벡의 코딩 원칙

우선순위 순서대로:

1. **작동하게 만들기** - 테스트를 통과시키기
2. **올바르게 만들기** - 의도를 명확하게 표현하기
3. **빠르게 만들기** - 필요할 때만 최적화하기

### TDD 워크플로우

**반드시 Red-Green-Refactor 따르기:**

1. **Red** - 실패하는 테스트를 먼저 작성
2. **Green** - 테스트를 통과하는 최소한의 코드 작성
3. **Refactor** - 테스트를 통과시킨 상태에서 코드 정리

**테스트 파일 네이밍:**
- 컴포넌트: `ComponentName.test.tsx`
- 훅: `useHookName.test.ts`
- 유틸리티: `utilityName.test.ts`

### 코드 스타일

#### TypeScript

```typescript
// ✅ 권장: 유니온과 원시 타입은 type
type Status = 'pending' | 'success' | 'error'

// ✅ 권장: 확장 가능한 객체는 interface
interface ApiResponse extends BaseResponse {
  data: unknown
}

// ✅ 권장: export 함수는 명시적 반환 타입
export function fetchProblem(id: string): Promise<Problem> { }

// ❌ 피하기: 암묵적 any
function process(data) { } // ❌
```

#### React 컴포넌트

```tsx
// ✅ 권장: 명시적 타입의 함수형 컴포넌트
interface ProblemCardProps {
  problem: Problem
  onSubmit: (answer: string) => void
}

export function ProblemCard({ problem, onSubmit }: ProblemCardProps) {
  // 컴포넌트 로직
}

// ✅ 권장: 복잡한 로직은 커스텀 훅으로 추출
function useProblemSubmission(problemId: string) {
  // 훅 로직
}

// ❌ 피하기: default export (named export 사용)
export default ProblemCard // ❌
export { ProblemCard }      // ✅
```

#### 네이밍 컨벤션

```typescript
// 컴포넌트: PascalCase
ProblemCard, StreakDisplay

// 훅: camelCase + 'use' 접두사
useAuth, useProblem, useStreak

// 유틸리티: camelCase
formatDate, calculateStreak

// 상수: UPPER_SNAKE_CASE
API_BASE_URL, MAX_STREAK_DAYS

// 타입/인터페이스: PascalCase
Problem, Member, Submission
```

### 파일 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
├── features/         # 기능별 모듈 (auth, problem, streak, submission)
├── hooks/            # 커스텀 React 훅
├── services/         # API 호출 및 외부 서비스
├── types/            # 공유 TypeScript 타입
├── utils/            # 유틸리티 함수
├── constants/        # 앱 전역 상수
├── routes/           # 라우트 정의
└── pages/            # 페이지 컴포넌트
```

## 도메인 모델 (백엔드 참조용)

**Member (회원)**
- `loginId`, `nickname`, `role` (GUEST → 설정 완료 후 MEMBER)
- 기능 접근 전 반드시 문제 설정 완료 필요

**MemberPreference (회원 설정)**
- `difficulty`: EASY | MEDIUM | HARD
- `topicId`: 카테고리 계층에서 선택
- 변경 사항은 다음날 00:00 KST부터 적용

**Problem (문제)**
- AI 생성 일일 문제
- (날짜 + 난이도 + 토픽)별로 유일
- `aiAnswer` 포함 (예시 답변)

**DailyProblem (오늘의 문제)**
- 회원당 하루에 하나의 문제만
- 설정 기반으로 00:00 KST에 생성

**Submission (제출)**
- `isOnTime`: 같은 날 23:59 이전 제출 시 true
- 같은 날(23:59 이전)에만 수정 가능
- 늦은 제출 가능하지만 스트릭에는 미반영

**Streak (스트릭)**
- `currentStreak`: 현재 연속 일수
- `maxStreak`: 개인 최고 기록
- 하루라도 놓치면 0으로 리셋
- `isOnTime = true`일 때만 갱신

**Category 계층**
- CategoryGroup → Category → CategoryTopic
- 예시: 개발 → 백엔드 → Spring

## 핵심 비즈니스 규칙

### 🚨 스트릭 로직

```typescript
// 스트릭 증가 조건:
// 1. 같은 날 제출 (isOnTime = true)
// 2. 서버 시간 23:59:59 이전 제출
// 3. 전날 문제도 해결했을 것

// 스트릭 0으로 리셋 조건:
// - 하루라도 건너뛰기 (제출 없음 또는 늦은 제출)
```

### 🚨 시간 경계

```typescript
// 하루의 경계: 00:00:00 - 23:59:59 서버 시간 (KST)
// 문제 생성: 매일 00:00 KST
// 설정 변경: 다음날 00:00 KST부터 적용

// ⚠️ 스트릭 로직에는 항상 서버 시간 사용, 클라이언트 시간 절대 사용 금지
```

### 🚨 최초 사용자 플로우

```typescript
// 1. 회원가입 → role = GUEST
// 2. 문제 설정 완료 필수 (난이도 + 토픽)
// 3. role이 MEMBER로 변경
// 4. 첫 문제 즉시 생성 (최초 설정 시에만)
// 5. 이후 문제는 매일 00:00에 생성
```

## UI/UX 철학

- **최소한의 마찰** - 단일 문제에 집중, 부담스러운 목록 없음
- **죄책감보다 격려** - 스트릭에 대한 긍정적 강화
- **비교 없음** - 타인 통계 숨기기, 개인 진척도만 표시
- **부드러운 리마인더** - 압박이 아닌 해결 독려 알림

## 중요 경고사항

### ⚠️ 클라이언트 시간 절대 신뢰 금지

```typescript
// ❌ 나쁨: 스트릭 로직에 클라이언트 Date 사용
const today = new Date() // 클라이언트 타임존!

// ✅ 좋음: 서버에서 제공한 날짜 사용
const { serverDate } = useServerTime()
```

### ⚠️ 로딩 & 에러 상태 처리

```tsx
// ✅ 모든 데이터 페치는 다음이 필요:
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data) return null
return <ProblemCard problem={data} />
```

### ⚠️ 폼 검증

```typescript
// ✅ 제출 전 검증
function validateAnswer(answer: string): ValidationError | null {
  if (!answer.trim()) return { message: '답변을 입력해주세요' }
  if (answer.length < 10) return { message: '답변은 최소 10자 이상이어야 합니다' }
  return null
}
```

### ⚠️ 접근성

```tsx
// ✅ 시맨틱 HTML
<button onClick={handleSubmit}>제출하기</button>

// ✅ 폼 레이블
<label htmlFor="answer">답변</label>
<textarea id="answer" />

// ✅ 스크린 리더를 위한 로딩 상태
<button disabled={isSubmitting} aria-busy={isSubmitting}>
  {isSubmitting ? '제출 중...' : '제출하기'}
</button>
```

### ⚠️ 상태 관리

```typescript
// UI 전용 관심사는 로컬 상태 선호
const [isOpen, setIsOpen] = useState(false)

// 서버 상태는 React Query / SWR 사용
const { data: problem } = useProblem(todayDate)
const { mutate: submitAnswer } = useSubmitAnswer()

// 전역 앱 상태는 Context 사용 (인증, 테마만)
const { user, logout } = useAuth()
```

## 테스트 전략

### 테스트 우선순위

1. **핵심 경로** - 인증, 문제 제출, 스트릭 계산
2. **복잡한 로직** - 날짜 경계, 스트릭 리셋
3. **사용자 상호작용** - 폼 제출, 내비게이션
4. **엣지 케이스** - 늦은 제출, 네트워크 실패

### 무엇을 테스트할 것인가

```typescript
// ✅ 테스트: 사용자가 보는 동작
test('자정 전 답변 제출 시 스트릭 증가', async () => {
  // 설정: 시간을 23:00으로 모킹
  // 행동: 답변 제출
  // 검증: 스트릭 증가
})

// ❌ 테스트 안함: 구현 세부사항
test('useState가 올바른 초기값으로 호출됨', () => {
  // React 내부 테스트, 우리 코드 아님
})
```

## Git 워크플로우

```bash
# 브랜치 네이밍
feature/problem-submission
fix/streak-reset-bug
refactor/extract-date-utils

# 커밋 메시지 (conventional commits)
feat: 문제 난이도 선택기 추가
fix: KST 타임존 스트릭 계산 수정
test: 늦은 제출 엣지 케이스 테스트 추가
refactor: 날짜 유틸리티를 별도 모듈로 추출
```

## 참고 문서

상세한 개발 플로우, Phase별 작업, 체크리스트는 다음 문서 참고:
- **[WORKFLOW.md](WORKFLOW.md)** - 전체 개발 워크플로우 (Phase 0-11)

필요시 위 문서를 읽어 세부 정보 확인.

---

**기억하기:** 작동하게 만들고, 올바르게 만들고, 빠르게 만들기 - 이 순서대로.
