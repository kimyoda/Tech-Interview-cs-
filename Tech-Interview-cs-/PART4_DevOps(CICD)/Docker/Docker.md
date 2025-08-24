# 🐳 Docker 기본 개념

## 1. Docker 기본 개념

### 1-1.Docker란 무엇인가

- Docker는 컨테이너 기반 가상화 플랫폼,애플리케이션을 컨테이너는 경량화된 실행 환경으로 패키징하고 배포하는 기술이다.

- 특징:

1. OS 레벨 가상화
2. 프로세스 격리 및 리소스 제한
3. 이미지 기반 배포로 일관된 환경 보장

- 중요성:

1. 개발/운영 환경 일치성 보장
2. 빠른 배포 및 확장성
3. 리소스 효율성(VM 대비 경략화)
4. DevOps 문화 활성화

---

## 2. 컨테이너와 가상머신(VM)의 차이점은?

1. 가상머신

- 하이퍼바이저 위에서 완전한 OS 실행.
- 높은 리소스(GB 단위 메모리).
- 하드웨어 레벨 가상화.

2. 컨테이너

- Host OS 커널 공유.
- 낮은 리소스(MB 단위 메모리).
- 빠른 시작 시간.
- OS 레벨 가상화

## -> 성능 효율성이 컨테이너가 VM보다 높다.

## 3. Docker 구성 요소

### 3-1 Docker 구성 요소들은?

1. Docker Engine:

- Docker 핵심 런타임 엔진
- dockerd(데몬)와 docker CLI로 구성한다.
- 컨테이너 생성, 실행, 관리 담당이다.

2. Docker Image:

- 컨테이너 실행에 필요한 모든것을 포함한 읽기 템플릿이다.
- 레이어 구조로 구성한다.
- 불변성을 보장한다.

3. Docker Container

- 이미지의 실행 가능한 인스턴스
- 프로세스와 격리된 환경
- 생성/시작/중지/삭제가 가능하다.

4. DockerFile

- 이미지 빌드를 위한 명령어 스크립트
- 선언적 방식으로 환경 정의
- 버전 관리 및 재현 가능한 빌드

---

## 4. Docker 이미지의 레이어 구조

### 4-1 Docker 이미지는 여러 개의 읽기 전용 구조

1. Base Layer: 기본 OS 이미지(예:ubuntu:20.04)
2. ApplicationLayer: 애플리케이션 관련 파일
3. UnionFileSystem: 여러 레이어를 하나의 파일 시스템으로 통합한다.
4. Copy-on-Write: 컨테이너에서 파일 수정 시 새로운 레이어를 생성한다.

- 장점
  - 중복 제거로 스토리지 효율성
  - 빠른 이미지 빌드 및 다운로드
  - 레이어 캐싱으로 성능이 향상한다.

---

## 5. Docker 네트워킹

### 5-1. Docker의 네트워크 드라이버 종류와 특징

1. bridge:
   - 단일 호스트내 컨테이너 간 통신
   - Dokcer0 브리지 네트워크 사용
   - 포트 매핑으로 외부 접근이 가능하다.
2. host:
   - 호스트 네트워크 직접 사용한다.
   - 네트워크 성능을 최적화
   - 포트 충돌이 주의가 필요하다
3. none:
   - 네트워크 없음(loopback)
   - 높은 보안이 필요한 경우
4. overlay:
   - 멀티 호스트간 통신(Docker swarm)
   - 분산 애플리케이션을 사용한다.
5. macvlan:
   - 컨테이너에 MAC 주소를 할당한다
   - 물리 네트워크를 직접 연결한다.

### 5-2. 컨테이너 간 통신 방법

- 같은 네트워크: 컨테이너 이름으로 DNS를 해석한다.
- 포트 매핑: 호스트 포트를 컨테이너 포트에 연결한다.
- 볼륨 공유: 파일 시스템을 통한 데이터 공유
- 환경 변수: 설정 정보 전달

---

## 6. Docker 볼륨과 데이터 관리

### 6-1. Docker의 데이터 저장 방식들을 비교한다.

1. **볼륨(Volunmes)**

- Docker 관리 영역에 저장(vr/lib/docker/volumes/)
- 백업/복원 용이
- 여러 컨테이너 간 공유가 가능하다

2. **바인드 마운트(Bind Mounts)**

- 호스트 파일시스템 직접 마운트
- 개발 환경에서 코드 동기화 용이
- 절대 경로가 필요하다
- 보안 위험이 존재하다

3. tmpfs 마운트

- 메모리에 임시저장
- 컨테이너 종료시 데이터 소멸

---

## 7. Docker 볼륨의 라이프 사이클, 관리방법

- 생성: `docker volume create volume_nmae`
- 조회: `docker volume ls`, `docker volume inspect`
- 연결: `docker run -v volume_name:/path/in/container`
- 백업: 볼륨 데이터를 tar로 아카이브
- 정리: `docker volume prune`

데이터 지속성: 컨테이너가 제거되어도 볼륨 데이터는 유지한다.

---

## 7. Docker Compose

### 7.1 Dokcer Compose의 목적과 주요 기능을 설명

- Docker Compose는 멀티 컨테이너 애플리케이션을 정의하고 실행하기 위한 도구이다.

기능

1. YAML 파일로 서비스 구성을 정의한다.
2. 한번의 명령으로 전체 스택 실행/중지 한다.
3. 서비스 간 의존성 관리
4. 네트워크 및 볼륨 자동 생성
5. 스케일리 지원

docker-compose.yml구조

```yaml
// 예시
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
```

### 7.2 docker run과 docker-compose의 차이점은?

- docker run: 단일 컨테이너 실행
  - 간단한 테스트, 개발
  - 일회성 작업
- docker-compose: 멀티 컨테이너 애플리케이션
  - 웹 서버 + 데이터베이스 + 캐시로 구성
  - 개발 환경 전체 구성
  - 복잡한 서비스 의존성을 관리한다.
