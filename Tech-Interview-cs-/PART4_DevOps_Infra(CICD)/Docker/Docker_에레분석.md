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
