# 🐳 Portainer - Dokcer 컨테이너 관리

## 1. Portainer란?

- Portainer는 Docker 환경을 위한 웹 기반 관리 도구이다.
- 웹 인터페이스를 통해 Docker 컨테이너, 이미지, 네트워크, 블륨 등을 쉽게 관리할 수 있게 해주는 오픈 소스 플랫폼이다.

### 🎯 주요 특징

- 직관적인 UI: 복잡한 Docker 명령어를 GUI로 간편하게 조작한다
- 다중 환경 지원: 로컬, 원격, 클러스터 환경 모두 지원한다
- 팀 협업: 사용자별 권한 관리 및 역할기반 제어
- 실시간 모니터링: 컨테이너 상태, 리소스 사용량 실시간 확인
- 스택 배포: Docker compose를 통한 복합 애플리케이션 배포

## 🚀 Portainer 설치하기

### Docker로 간단 설치

예시

```bash
# Portainer 볼륨 생성
docker volume create portainer_data

# Portainer 컨테이너 실행
docker run -d \
  --name portainer \
  --restart=always \
  -p 8000:8000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Docker compose 방식

```bash
version: '3.8'

services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - portainer_data:/data
    ports:
      - 9000:9000
      - 9443:9443

volumes:
  portainer_data:
```

---

## 🎛️ Portainer 인터페이스 살펴보기

### 메인 대시보드 구성

1. Dashboard: 전체 환경 상태 view
2. Templates: 미리 정의된 애플리케이션 템플릿
3. Stacks: Docker Compose 기반 스택 관리
4. Containers: 개별 컨테이너 관리
5. Images: Docker 이미지 관리
6. Networks: 네트워크 설정 및 관리
7. Volumes: 데이터 볼륨 관리
8. Event: 시스템 이벤트 로그

## 📊 컨테이너 관리 실전 활용

1. 컨테이너 상태 모니터링

- Portainer 컨테이너 뷰에서 다음과 같은 정보를 확인할 수 있다.
  - 컨테이너 상태: Running, Stopped, Exited 등
  - 리소스 사용량: CPU, 메모리, 네트워크
  - 포트 매잎ㅇ: Published Ports 정보
  - 생성 시간: 컨테이너 생성 및 시작 시간

2. 컨테이너 트러블슈팅
   Portainer를 통한 해결

- 로그 분석

  - 컨테이너 선택 -> Logs 확인
  - 특정 시간대 필터링 가능

- 리소스 모니터링

  - Stats에서 CPU/메모리 사용률 실시간 추적
  - 비정상적 리소스 소비 패턴 확인

- 컨테이너 내부 접근
  - Console 탭을 통한 직접적 컨테이너 접근
  - 파일 시스템 탐색 및 디버깅
  - 명령어 실행(터미널 접근)
