# OrbStack으로 Docker Desktop 대체하기: Docker, k8s, Linux 개발 환경 저리

> macOS에서 Docker Desktop 대신 OrbStack을 사용해 더 가볍고 빠른 개발 환경을 구성하는 방법을 정리한 글이다.

---

## 1. OrbStack?

OrbStack은 macOS에서 Docker 컨테이너, Kubernetes, Linux 머신을 실행할 수 있는 개발 도구다.
Docker Desktop의 대체제로 사용할 수 있고, 컨테이너 실행, Docker Compose, 볼륨 관리, 네트워크, 포트 포워딩, Kubernetes, Liunx VM 환경을 하나의 앱에서 통합 관리할 수있다.
공식 문서에 주요 특징을 다음과 같이 설명한다.

- **빠른 시작 속도**: **Docker Desktop** 대비 훨씬 빠르게 엔진이 가동된다.
- **낮은 CPU 및 메모리 사용량**: macOS 리소스를 적게 소비
- **Docker Compose 호환**: 기존 `docker-compose.yml` 을 그대로 사용이 가능
- **macOS와 자연스러운 파일 시스템 연동**: 볼륨 접근이 편리하다
- **Docker, Kubernetes, Liunx Machines 지원**: 하나의 앱으로 모든 환경 관리
- **GUI와 CLI 모두 지원**: 상황에 맞게 선택이 가능하다
- **Docker Desktop 데이터 마이그레이션 지원**: 기존 컨테이너/이미지/볼륨 이전 가능

개발 환경에서 Dokcer Desktop이 무겁게 느껴지거나, Mac에서 컨테이너 실행 속도와 리소스 사용량을 개선하고 싶을 때 좋은 대안이 된다고 생각한다.

---

## 2. 설치방법

OrbStack은 공식사이트(https://orbstack.dev/)에서 직접 다운로드 할 수 있고, 맥이면 Homebrew Cask로 설치할 수 있다.

**Homebrew로 설치**

```
brew install orbstack
```

설치가 끝나면 다음 작업이 자동으로 진행된다.

- `OrbStack.app`이 `/Applications/OrbStack.app`으로 이동
- `orb`CLI 설치
- `orbctl` CLI 설치
- shell completion 연결
- OrbStack 앱 실행 및 초기 설정

설치 후에 OrbStack 앱을 한 번 직접 실행해야 Docker 엔진과 context 설정이 정상적으로 동작한다.

```bash
open -a OrbStack
```

**Docker context 확인**

설치 후 Docker가 OrbStack context를 바라보고 있는 지 확인한다

```bash
docker context ls
```

출력 예시:

```
NAME            DESCRIPTION                               DOCKER ENDPOINT
default         Current DOCKER_HOST based configuration   unix:///var/run/docker.sock
desktop-linux   Docker Desktop                            unix:///...
orbstack *      OrbStack                                  unix:///...
```

OrbStack context로 전환하려면 다음 명령어를 사용한다

```bash
docker context use orbstack
```

> Docker Desktop과 OrbStack을 동시에 설치한 경우 context가 다를 수 있다. 컨테이너가 보이지 않는다면 context를 먼저 확인한다.

---

## 3. Docker Desktop에서 OrbStack으로 마이그레이션

OrbStack은 Docker Desktop에서 사용하던 데이터를 복사해 가져오는 마이그레이션 기능을 제공한다

마이그레이션 대상은 다음과 같다.

- 기존 Docker 컨테이너
- Docker 이미지
- Docker 볼륨
- Docker Compose 프로젝트

**GUI에서 마이그레이션**

```bash
orb docker migrate
```

마이그레이션시 주의사항
마이그레이션 기존 Docker Desktop **데이터를 삭제하지 않고 OrbStack쪽으로 복사** 하는 방식이다.
마이그레이션 후 정상 동작을 충분히 확인한 뒤 Docker Desktop 데이터를 정리하는 것이 안전하다.

특히 MySQL 볼륨처럼 중요한 데이터가 들어있는 경우, 볼륨 이름과 데이터가 제대로 이전되었는지 꼭 확인해야 한다.

---

## 4. 예시 구조

| 역할                 | 예시 이름    |
| -------------------- | ------------ |
| API 서버             | my-api       |
| 운영툴 / 관리자 서버 | my-mgmt      |
| 스케줄러 / 배치      | my-scheduler |
| MySQL (기본)         | my-mysql     |
| Redis (기본)         | my-redis     |
| 신규 개발용 MySQL    | my-mysql-new |
| 신규 개발용 Redis    | my-redis-new |

OrbStack에서 Compose 프로젝트를 실행하면 GUI에서 다음과 같은 구조로 묶어서 보인다

```
my-api
├── laravel.test
└── scheduler

my-mgmt
├── laravel.test
├── laravel.worker1
├── laravel.worker2
├── my-mysql
├── my-mysql-new
├── my-redis
└── my-redis-new
```

`my-api`는 외부 요청을 처리하는 API 서버 역할을 하고, `my-mgmt`는 운영툴 또는 관리자 페이지 역할을 한다.
`scheduler`나 `worker` 컨테이너는 Laravel의 queue, schedule, batch 처리를 담당한다.

---

## 5. Docker 컨테이너 실행

OrbStack은 자체 Docker 엔진을 포함하여 Docker명령어를 그대로 사용할 수 있다

단일 컨테이너 실행

```bash
docker run -p 80:80 docker/getting-started
```

Dokcer Compose 실행

```bash
docker compose up -d
```

Laravel Sail 실행

```bash
./vendor/bin/sail up -d
```

컨테이너 목록 확인

```bash
# 실행 중인 컨테이너만 확인
docker ps

# 중지된 컨테이너 포함 전체 확인
docker ps -a
```

---

## 6. Docker Compose 활용

OrbStack은 Docker Compose와 완전히 호환된다.
`docker-compose.yml` 또는 `compose. yml`을 사용하는 프로젝트는 기존 방식 그대로 실행할 수 있다.
예시

```yaml
services:
  my-api:
    image: sail-8.3-app
    ports:
      - "9090:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - my-mysql
      - my-redis

  my-scheduler:
    image: sail-8.3-app
    command: php artisan schedule:work
    volumes:
      - .:/var/www/html
    depends_on:
      - my-mysql
      - my-redis

  my-mysql:
    image: mysql/mysql-server:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: my_app
    volumes:
      - sail-mysql:/var/lib/mysql

  my-redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - sail-redis:/data

volumes:
  sail-mysql:
  sail-redis:
```

이 구조에서 `my-api` 웹 요청을 처리ㅐ, `my-scheduler`는 Laravel 스케줄 작업을 처리한다.
MySQL과 Redis는 별도 컨테이너로 분리되고 API 서버와 운영툴 양쪽에서 공통으로 사용할 수 있다.

OrbStack GUI에서 Compose 프로젝트 단위로 컨테이너가 묶어서 표시된다.

```
my-api
├── laravel.test
└── scheduler

my-mgmt
├── laravel.test
├── laravel.worker1
├── laravel.worker2
├── my-mysql
├── my-mysql-new
├── my-redis
└── my-redis-new
```

---

## 7. 네트워크 활용

OrbStack은 Docker 네트워크와 포트 포워딩을 지원한다

**포트 접근**
API 서버가 9090 포트를 사용하면 macOS 브라우저에서 다음 주소로 접근할 수 있다.

```
http://localhost:9090
```

**Compose 내부 컨테이너 간 통신**
같은 Compose 네트워크 안에서 서비스명을 호스트로 사용할 수 있다.

```env
# .env 파일 예시
DB_HOST=my-mysql
DB_PORT=3306

REDIS_HOST=my-redis
REDIS_PORT=6379
```

```
my-api  ──┐
          ├── my-mysql (공유 DB)
my-mgmt ──┘

my-api  ──┐
          ├── my-redis (공유 Redis)
my-mgmt ──┘
```

해당 구조를 통해 API 서버와 운영툴이 같은 데이터를 바라보는 로컬 개발 환경을 만들 수 있다.
Compose 네트워크가 다를 경우 서비스명으로 직접 접근이 안될 수 있다. 이런 경우 외부 네트워크를 정의하거나 컨테이너 IP 또는 포트를 직접 사용하는 방법을 고려한다

---

## 8. Kubernetes 활용 가능

OrbStack은 로컬 개발용 단일 노드 Kubernetes 클러스터를 기본 제공한다
