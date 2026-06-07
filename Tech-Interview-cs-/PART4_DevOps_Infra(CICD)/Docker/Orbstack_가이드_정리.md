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

Docker Desktop의 Kubernetes 기능처럼 로컬에서 Kubernetes리소스를 테스트할 수 있다.

**활성화 방법**
OrbStack 앱 설정(Settings > Kubernetes)에서 Kubernetes를 활성화한다. 활성화 후 Kubeconfig가 자동으로 병합되므로 별도 설정 없이 `kubectl`을 바로 사용할 수 있다.

**주요 활용 케이스**

- Deployment, Service, Ingress 구성 테스트
- ConfigMap / Secret 관리 검증
- 로컬 API 서버를 Kubernetes 환경에서 구동 테스트
- 운영 환경 배포 전 사전 검증

---

## 9. Linux Machines 활용

OrbStack은 Docker 컨테이너 뿐 아니라 Linux 머신도 실행할 수 있다

macOS안에서 가벼운 Linux 환경을 직접 실행할 수 있어, WSL(Windows Subsystem for Linux)과 유사한 경험을 제공한다.

**Ubuntun 머신 생성 및 접속**

```bash
# Ubuntu 머신 생성
orb create ubuntu my-uubuntu

# 머신 접속
orb -m my-ubuntu

# SSH로 접속
ssh orb
```

**Linux machine이 유용한 경우**

- macOS가 아닌 Liunx 환경에서 명령어 동작 확인
- Liunx 패키지 설치 및 의존성 테스트
- nginx, redis, mysql 등 서비스 직접 설치 테스트
- shell script 검증
- 배포 스크립트 사전 검증
- Liunx 환경에서만 재현되는 버그 디버깅

---

## 10. 실무 사용 흐름 예시

다음은 OrbStack으로 로컬 개발 환경을 구성하는 전체 흐름이다.

### 1단계: OrbStack 설치 및 실행

```bash
brew install orbstack
open -a OrbStack
```

### 2단계: Docker context 확인 및 전환

```bash
docker context ls
docker context use orbstack
```

### 3단계: 기존 Docker Desktop 데이터 마이그레이션

```bash
orb docker migrate
```

### 4단계: my-api 실행

```bash
cd ~/workspace/my-api
./vendor/bin/sail up -d
```

### 5단계: my-mgmt 실행

```bash
cd ~/workspace/my-mgmt
./vendor/bin/sail up -d
```

### 6단계: 컨테이너 실행 확인

```bash
docker ps
```

### 7단계: 로그 확인

```bash
docker logs -f my-api-laravel.test-1
```

### 8단계: API 동작 테스트

```bash
curl http://localhost:9090
curl http://localhost:9090/api/health
```

### 9단계: DB 마이그레이션 및 테스트 실행

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan test
```

### 10단계: 사용하지 않는 리소스 정리

```bash
# 중지된 컨테이너 정리
docker container prune

# 사용하지 않는 이미지 정리
docker image prune -a

# 볼륨 목록 확인 후 정리 (DB 데이터 유무 반드시 확인)
docker volume ls
docker volume prune
```

---

## 11. Docker Desktop과 같이 사용할 때 주의점

Docker Desktop과 OrbStack을 동시에 설치해서 사용할 수는 있다. 하지만 Docker context가 어디를 바라보는지 주의해야 한다.

### context 전환

```bash
# OrbStack 사용
docker context use orbstack

# Docker Desktop 사용
docker context use desktop-linux

# 현재 context 확인
docker context ls
```

---

## 12. OrbStack 사용하는 이유

OrbStack을 로컬 개발 환경에 적용했을 때 체감할 수 있는 장점을 정리하면 다음과 같다.

1. 가볍다: Docker Desktop보다 CPU와 메모리 사용량이 눈에 띄게 적다
2. 빠르다: OrbStack 엔진 시작 속도가 훨씬 빠르고, 파일 시세틈 성능도 개선됐다.
3. 호환성: 기존 Docker Compose 프로젝트를 명령어 수정없이 그댜로 실행할 수 있다
4. GUI 편의성: 컨테이너, 이미지, 볼륨 상태를 GUI에서 한눈에 파악할 수 있다
5. 파일 접근: Docker 볼륨을 `~/OrbStack/docker`에서 Finder로 바로 열 수 있다.
6. Kubernetes 내장: 별도 설치 없이 로컬 Kubernetes 클러스터를 사용할 수 있다
7. Liunx machine: macOS에서 Liunx 환경을 가볍게 실행할 수 있다
8. 멀티 프로젝트 관리: API 서버, 운영툴, 배치, DB, Redis를 분리해 체계적으로 관리하기 좋다.

---

## 13. 정리

OrbStack은 macOS 개발 환경에서 Docker Desktop을 대체할 수 있는 가볍고 빠른 컨테이너 실행 도구다.
Docker Compose, 볼륨, 네트워크, 포트 포워딩, Kubernetes, Linux machine을 모두 지원하기 때문에 웹 서버 개발은 물론, API 서버, 운영툴, 배치 서버, 스케줄러 등 다양한 구성의 로컬 개발 환경에 잘 맞는다.

Docker Desktop에서 OrbStack으로 전환 순서

```
1. brew install orbstack
2. OrbStack 앱 실행 (open -a OrbStack)
3. docker context 확인 (docker context ls)
4. Docker Desktop 데이터 마이그레이션 (orb docker migrate)
5. 기존 프로젝트 docker compose 또는 sail up 실행
6. DB / Redis / API 연결 상태 확인
7. 이상 없으면 Docker Desktop 정리 검토
   Docker Desktop이 무겁거나, Mac에서 컨테이너 실행 성능과 리소스 사용량을 개선하고 싶다면 OrbStack을 충분히 검토해볼 만하다.
```

작성 기준: OrbStack 최신 버전 / macOS Sequoia / Apple Silicon 환경
