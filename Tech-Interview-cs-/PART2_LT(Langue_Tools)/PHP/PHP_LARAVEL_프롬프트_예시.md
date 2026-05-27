# 🌐 PHP*Laravel*프롬프트 예시

## 1. 프로젝트 개요

### 1-1. 🐘 PHP 기본 특성 - "웹 개발의 든든한 동반자"

해당 프로젝트는 **Unity 3D 모바일 게임 클라이언트**와 통신하는 **Laravel 11 기반 모바일 게임 백엔드 서버**이다.

주요 역할은 다음과 같다.

- 게임 API 요청 처리
- 유저 데이터 조회 및 갱신
- 랭킹 데이터 관리
- 마스터 데이터 캐싱
- 세션 및 공통 캐시 관리
- 운영툴과 연동되는 게임 콘텐츠 처리
- 클라이언트 개발자와 공유할 API 문서 관리

---

## 2. 기술 스택

| 구분                      | 기술                           |
| ------------------------- | ------------------------------ |
| Framework                 | Laravel 11                     |
| Runtime                   | PHP 8.3 FPM                    |
| Database                  | MySQL 8.0 InnoDB               |
| Cache / Session / Ranking | Redis                          |
| Infrastructure            | AWS EKS Production             |
| Local Developement        | Docker, Laravel Sail, OrbStack |
| Client                    | Unity3D Mobile Game            |

---

## 3. 핵심 실행 규칙

로컬 호스트 환경에 PHP가 없어, 모든 PHP 관련 명령어는 반드시 Docker 컨테이너 내부에서 실행해야 한다

따라서 `php`, `artisan`, `phpunit`, `composer` 명령어는 직접 실행하지 않고 반드시 `./vendor/bin/sail`을 접두어로 사용한다.

### 명령어 예시

```bash
./vendor/bin/sail artisan test
```

```bash
./vendor/bin/sail phpunit {path}
```

```bash
./vendor/bin/sail composer install
```

```bash
./vendor/bin/sail artisan migrate
```

---

## 4. 로컬 개발 명령어

### 로컬 환경 빌드 및 실행

```bash
./vendor/bin/sail up -d --build
```

### 전체 테스트 실행

```bash
./vendor/bin/sail artisan test
```

### 특정 테스트 실행

```bash
./vendor/bin/sail phpunit {path}
```

### 테스트용 최신 마스터 데이터 가져오기

```bash
./sync_master_fixtures.sh
```

---

## 5. Protocol-Handler 패턴

프로젝트는 URI 규칙에 따라 Protocol Handler 클래스를 매핑한다

예를 들어 API URL가 다음과 같으면,

```text
/api/cheering_ranking/get_data
```

핸들러 클래스는 다음 위치에 있어야 한다

```text
App\Protocols\CheeringRanking\GetDataHandler
```

즉, URI 구조는 `Util:getProtocoNameFromUri` 규칙을 따른다.

---

## 6. Handler 작성 규칙

모든 Handler 클래스는 `ProtocolBase`를 상속받아야 한다. 또한 다음 메서드를 구현해야 한다.

```php
handle(RequestCommon $commonRequest, array $request)
```

### Handler의 주요 책임

Handler는 API 요청의 진입점 역할을 한다

주요 책임은 다음과 같다.

- 요청 데이터 수신
- 공통 요청 객체 확인
- Service Layer 호출
- 응답 객체 생성
- 비즈니스 오류 처리
- 유저 액션 로그 기록

복잡한 비지니스 로직은 Handler에 직접 작성하지 않고, Service Layer로 분리한다.

---

## 7. Service Layer 규칙

비지니스 로직은 `app/Services` 하위에 작성한다
도메인별로 디렉터리를 나누어 관리한다. 예시는 다음과 같다

```text
app/
└── Services/
    ├── Mini/
    ├── Ranking/
    ├── CheeringRanking/
    └── Master/
```

### Service Layer 역할

Service에 실제 비즈니스 로직을 담당한다

다음과 같은 처리를 Service에 수행한다

- 유저 데이터 조회
- 점수 계산
- 랭킹 등록
- 보상 지급
- 구매 가능 여부 검증
- 마스터 데이터 조회
- Redis 캐시 조회
- DB 저장 및 갱신

---

## 8. 의존성 주입 DI 규칙

Service Layer에 의존성 주입을 적극 활용한다.

테스트하기 쉬운 구조를 만든다.

Handler가 직접 모델이나 Redis를 다루기보다 Service를 주입받아 처리 흐름을 위이만다

### 구조 에시

```text
Handler
  ↓
Service
  ↓
Repository / Model / Redis / MasterSerivce
```

해당 구조를 사용하면 다음 장점이 있다

- Handler가 얇아짐
- 비지니스 로직 재사용 가능
- 테스트 코드 작성이 쉬워진다
- Mock 처리 가능
- 책임 분리가 명확해진다

---

## 9. Strict Typing & Modern PHP 규칙

PHP 8.3 문법을 기준으로 엄격한 탕입 사용을 권장한다

### 기본 규칙

- 파라미터 타입 명시
- 리턴 타입 명시
- 가능하면 `readonly` 프로퍼티 사용
- 가능하면 생성자 홍보 문법 사용
- 불필요한 동적 프로퍼티 사용 지망
- 배열 구조가 복잡한 경우 Struct 사용 고려

### 권장 방향

```text
명확한 타입
명확한 책임
명확한 응답 구조
테스트 가능한 설계
```

---

## 10. Structs & Response 규칙

응답 객체는 `BaseResponse`를 상속받는다

데이터 구조체는 `BaseStruct`를 상속받는다

### Response 규칙

```text
App\Responses\{Domain}\{Name}Response
```

응답 객체는 API 응답의 최상위 구조를 담당한다

### Struct 규칙

```text
App\Structs\{Domain}\{Name}Data
```

Struct는 응답 내부의 세부 데이터 구조를 담당한다

---

## 11. Camle Case / Snake Case 반환 규칙
