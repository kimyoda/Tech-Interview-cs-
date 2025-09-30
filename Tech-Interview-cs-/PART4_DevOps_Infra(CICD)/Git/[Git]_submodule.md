# 🌐 Git Submoudles

## 1. Git submodule

- 새로운 프로젝트에서 `git clone`을 받았는데, 특정 폴더가 텅 비어있으면, 서브모듈일 확률이 높다. `submoudle update`를 하라는 가이드가 있을 때 git submodule이 무엇인지 알아보자.

### 1. git submodule이란?

- 서브모듈은 **Git 저장소안에 포함된, 독립적인 또다른 Git 저장소**이다.
- 메인 프로젝트가 서브모듈의 실제 코드를 복사해서 저장하는게 아니다.
- **프로젝트의 특정 커밋을 참조한다**는 정보를 기록한다.

내부 동작원리

```js
메인 프로젝트/
├── .git/
├── .gitmodules          # 서브모듈 정보가 기록된 파일
├── src/
└── libs/
    └── shared-utils/    # 서브모듈 폴더 (실제로는 커밋 해시만 추적)
```

- 메인프로젝트는 `libs/shared-utils`에 대해
- 저장소의 커밋을 사용한다는 정보만 저장한다.

---

## 2. 서브모듈을 사용하는 이유?

1. **공통 코드 / 라이브러리 공유**

- 다른 프로젝트들(API, MGMT 등)에서 동일한 코드를 사용할 때 서브모듈이 필요하다.
  - 예시:
  - API 서버 + 관리자 보드: 동일한 데이터 모델, 유틸리티 함수 공유
  - 모바일 앱 + 웹 앱: 공동 API 클라이언트, 비즈니스 로직 공유
  - 아키텍처: 공동 인증, 로깅, 에러 핸들링 모듈 공유
- 코드 중복 없이 관리

```js
team-api-server/
└── common/           # 서브모듈

team-admin-dashboard/
└── common/           # 동일한 서브모듈 참조

team-common/          # 서브모듈의 실제 저장소
├── models/
├── utils/
└── constants/
```

- 버그 수정이나 기능 추가 시, `team-common`저장소만 수정, 각 프로젝트에서 서브모듈을 업데이트한다.

2. **외부 라이브러리의 커스텀 버전 관리**

- 오픈 소스 라이브러리를 사용, 프로젝트에 맞게 수정하여 사용한다.
  - 예시:
  - React 컴포넌트 라이브러리를 Fork해서 회사 디자인 시스템에 맞게 수정
  - 오픈소스 SDK를 커스텀, 원본 업데이트도 추적 가능

3. 플러그인 / 확장 모듈

- 애플리케이션과 플러그인을 독립적으로 개발, 관리할 때 사용한다.

```js
main-app/
├── core/
└── plugins/
    ├── payment-plugin/      # 서브모듈
    ├── analytics-plugin/    # 서브모듈
    └── notification-plugin/ # 서브모듈
```

- 메인 앱은 필요한 버전을 선택 해 사용할 수 있다.

---

## 3. 서브모듈 명령어

1. 처음 clone하기

```bash
# 서브모듈까지 한 번에 받기
git clone --recurse-submodules <저장소_URL>
```

-> 메인 프로젝트와 모든 서브모듈 내용을 한 번에 다운로드 한다.

2. Clone한 프로젝트 서브모듈 초기화

```bash
# 서브모듈 초기화 및 다운로드
git submodule update --init --recursive
```

- `--init`: 서브모듈 로컬에 등록, 초기화
- `--rescursive`: 중첩된 서브모듈까지 모두 처리한다.
- 최소 한번만 실행하면 된다.

3. 서브모듈 추가하기

```bash
# 서브모듈 추가
git submodule add <저장소_URL> <로컬_경로>

# 예시
git submodule add https://github.com/team/shared-utils libs/shared-utils
```

- `.gitmodules` 파일이 생성 / 업데이트된다.
- 지정한 경로에 서브모듈이 clone된다.
- 메인 프로젝트에 서브모듈이 기록된다.

4. 서브모듈 업데이트

```bash
# 모든 서브모듈을 최신 커밋으로 업데이트
git submodule update --remote --recursive

# 특정 서브모듈만 업데이트
git submodule update --remote libs/shared-utils
```

- 서브모듈 저장소에 새로운 변경사항이 있을 때 사용한다.
