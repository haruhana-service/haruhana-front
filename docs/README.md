# 📚 Documentation

이 폴더는 프로젝트의 상세 문서를 포함합니다. CLAUDE.md는 이 문서들을 참조합니다.

## 문서 구조

```
docs/
├── README.md           # 이 파일
├── api/                # API 명세 및 통합 가이드
├── architecture/       # 아키텍처 결정 및 설계 문서
├── components/         # 컴포넌트 설계 및 사용 가이드
├── features/           # 기능별 상세 설명
└── guides/             # 개발 가이드 및 튜토리얼
```

## 문서 작성 가이드

### 어떤 문서를 여기에 작성할까?

**✅ docs/에 작성:**
- API 엔드포인트 상세 명세
- 복잡한 기능의 구현 상세
- 아키텍처 결정 기록 (ADR)
- 컴포넌트 설계 문서
- 개발 가이드 및 튜토리얼
- 배포 및 운영 가이드

**❌ docs/에 작성 안함:**
- 프로젝트 개요 → README.md
- 개발 원칙 및 코딩 스타일 → CLAUDE.md
- 워크플로우 및 Phase → WORKFLOW.md

### 문서 템플릿

각 문서는 다음 형식을 따릅니다:

```markdown
# 문서 제목

> 간단한 설명 (1-2문장)

## 개요

## 상세 내용

## 예제

## 참고 자료
```

### CLAUDE.md에서 참조하기

```markdown
## 관련 문서

- [API 통합 가이드](docs/api/integration.md)
- [인증 흐름](docs/features/authentication.md)
```

## 앞으로 작성할 문서 예시

### API 문서
- `docs/api/authentication.md` - 로그인/회원가입 API
- `docs/api/problems.md` - 문제 조회 및 제출 API
- `docs/api/streak.md` - 스트릭 관련 API

### Feature 문서
- `docs/features/authentication.md` - 인증 시스템 구현
- `docs/features/problem-display.md` - 문제 표시 로직
- `docs/features/submission.md` - 제출 및 평가 로직
- `docs/features/streak-calculation.md` - 스트릭 계산 상세

### Architecture 문서
- `docs/architecture/state-management.md` - 상태 관리 전략
- `docs/architecture/routing.md` - 라우팅 구조
- `docs/architecture/error-handling.md` - 에러 처리 전략

### Component 문서
- `docs/components/forms.md` - 폼 컴포넌트 가이드
- `docs/components/layouts.md` - 레이아웃 패턴

### Guides 문서
- `docs/guides/testing.md` - 테스트 작성 가이드
- `docs/guides/responsive-design.md` - 반응형 디자인 구현
- `docs/guides/deployment.md` - 배포 가이드

---

**원칙:** 문서는 필요할 때 작성하고, 항상 최신 상태로 유지합니다.
