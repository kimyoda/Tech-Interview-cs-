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
