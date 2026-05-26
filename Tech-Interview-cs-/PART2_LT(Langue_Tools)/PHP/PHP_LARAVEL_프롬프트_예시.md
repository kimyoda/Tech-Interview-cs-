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
