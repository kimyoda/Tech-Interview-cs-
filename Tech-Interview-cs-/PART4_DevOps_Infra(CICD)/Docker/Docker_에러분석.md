# 🐳 Docker Too many open files 에러 분석

### 문제 상황

- Docker Desktop을 사용하던 중 다음과 같은 에러와 함께 애플리케이션이 종료되었다.

```bash
running services: running services: running VM stats server:
accepting vm proxy service connection: accept unix
/Users/kimyohan/Library/Containers/com.docker.docker/Data/stats.sock:
accept: too many open files in system
```

- 에러 메세지 분석
  - stats.sock: Docker Desktop 내부에서 VM 상태정보를 수집하는 UNIX 도메인 소켓
  - too many open files in system: OS가 더 이상 파일 디스크립터(FD)를 할당할 수 없다
  - 컨테이너 리소스가 부족이 아닌, macOS 호스트의 FD 고갈 문제로 판단했음.
  - 즉 운영체제가 더 이상 파일 디스크립터(file descriptor)를 할당할 수 없다는 것을 의미 한다.

- 리눅스와 macOS에서 각 프로세스는 열 수 있는 파일과 소켓의 수에 한계가 있다.
- 파일 디스크립터는 일반 파일뿐 아니라 네트워크 소켁, 파이프 등 모든 I/O 리소스를 나타내고, 각 프로세스는 자체적인 파일 디스크립터 테이블을 가지고 있다.
- 소켓을 생성할 때 디스크립터 할당이 실패하면 위와 같은 메세지가 나타난다.
- Docker 데스크톱은 통계 서버를 시작할 때 소켓을 열어야 하는데, 시스템 전체 또는 특정 프로세스의 파일 디스크립터 한도를 초과하여 소켓을 열지 못해 크래시가 발생한 것이다.

---

## 1단계 초기 상황 파악

- 시스템의 FD 한도와 현재 사용량을 확인했다.

```bash
# 현재 세션의 FD 소프트 리밋 확인
$ ulimit -n
2560
```

- 초기 `lsof` 명령으로 프로세스별 FD 사용량을 확인해봤다.

```bash
$ sudo lsof -n | awk '{print $1}' | sort | uniq -c | sort -nr | head

3567 barriers
 524 barrier
 305 networkse
 281 Google
 201 UserEvent
 125 com.docke
```

- `barriers` 프로세스가 3,567개 FD를 정유 중인걸 확인했고, 이는 비정상적으로 높은 수치라고 생각했다.

---

## 2단계 정밀 분석 - PID별 FD 개수 정확히 측정

- 초기 명령어는 프로세스 이름만 집계, PID 별로 정확한 FD 개수를 측정했습니다.

```bash
# PID별 FD 개수 정확히 집계
$ lsof -nP | awk 'NR>1{cnt[$1" "$2]++} END{for (k in cnt) print cnt[k], k}' | sort -nr | head -20
```

- `lsof -nP`: `-n`은 DNS 조회 생략, `-P`는 포트 이름 변환 생략으로 속도 향상ㅇ한다.
- `$1" "$2`: 프로새스 명과 PID를 조합하여 정확한 집계
- 여러 `barriers` PID가 각각 수백 ~ 수천개의 FD를 보유 중임을 확인했다.

---

## 3단계 Barriers 프로세스 정체 확인

- 문제의 프로세스가 무엇인지 확인했다.

```bash
# barriers 프로세스 상세 정보
$ ps -p 95344,62185,62183,62230 -o pid,ppid,comm,args
```

- Barriers는 컴퓨터 간 마우스/키보드를 공유하는 도구
- 서버(`barriers`)와 클라이언트(`barriers`)프로세스가 다수 실행 중이었다.
- PPID를 통해 재연결 실패로 인한 좀비 프로세스 가능성을 확인하였다.

---

## 3. 에러 확인 및 분석

- 일시적으로 Docker를 재시작하여 문제는 해결되었으나 같은 이슈가 생겨 결국 MacOS를 아예 종료 하고 배리어를 재시작했더니 해결 되었다.
- 차후에 원인을 파악하기 위해 시스템의 파일 디스크립터 사용량과 최대값을 확인하는 방법은 위에 설명되어있다.

## 4. 프로세스 재시작

- `ps aux | grep barrier` 명령으로 Barrier 프로세스가 여러 개 떠있는 것을 확인했다.
- 재연결 과정에서 여러 인스턴스가 중첩 실행되어서 그런것으로 생각된다.
- Barrier 프로세스를 모두 종료(`pkill -f barriers`)하고 다시 실행 한 뒤, Docker를 재시작하여 문제가 사라졌다.

---

## 5. 해결방안과 재발 방지에 관해

### 5-1 문제 재발 시 즉각 조치

- Docker 데스크톱 종료 및 재시작: 일단 열려 있던 소켓과 파일 핸들이 정리되어 일시적으로 문제를 해결할 수 있다.
- 문제가 반복될 경우 Barrier와 같은 FD를 많이 쓰는 프로세스를 완전 종료 후 재실행한다.

### 5-2 파일 디스크립터 한도 조정

- 한도(`ulimit -n`)가 너무 낮게 설정되어 있다면 늘리는 것도 방법이다.
- `ulimit -n` 명령으로 일시적으로 한도를 높일 수 있고, 시스템 전역 한도를 높이려면 `/etc/security/limist.conf`에 `* soft nofile`과 `* hard nofile` 항목을 추가해 구체적으로 변경할 수 있다.
- macOS에서 `launchtl limit maxfiles` 명령으로 시스템 한도를 조정할 수 있다.

### 5-3 해결 방안

- 불필요한 프로세스 종료: IDE, 파일 감시 도구, 동기화 앱 등 필요하지 않은 프로세스를 종료하거나 감시 대상 디렉터리를 축소한다.
- Barrier 설정 최적화: 연결이 불안정할 때 프로세스가 중복 실행되는 것을 방지한다.
- 개발 환경 마운트 전략 : Docker 소스 코드를 마운트 할 때, `node_nodules`, `vendor` 등 대량의 파일을 가진 디렉터리를 체크한다.

### 내용 정리

- `accpet unix ... stats.sock: accept: too many open files in system` 오류는 디스크립터 한도 초과가 원인이다.
- 운영체제 레벨과 프로세스 레벨, 특정 프로세스가 FD를 과도하게 사용할 때 다른 애플리케이션이 소켓을 열지 못하게 한다.

- Barrier 앱이 수천 개의 소켓을 열어, 한도가 낮은 상태에서 Docker의 통계서버가 새 소켓을 열지 못해 데스크톱 앱이 충돌했다.
- `ulimit -n`으로 한도를 확인, `lsof`와 `ps`를 사용해 FD를 많이 사용하는 프로세스를 찾아 종료함으로 문제를 해결했다.
