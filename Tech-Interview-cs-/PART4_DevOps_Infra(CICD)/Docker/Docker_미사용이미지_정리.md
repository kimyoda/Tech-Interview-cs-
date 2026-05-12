# 🐳 Docker 미사용 이미지 및 빌드 캐시 정리 작업 정리

## 1. 작업 배경

이번에 138번 서버에서 Docker 미사용 이미지 정리 작업을 선임 주임님이 진행하셨고, 난 그 과정에서 어떻게 진행되는 지 옆에서 방법을 배웠다.

서버에서 Docker를 오래 사용하다 보면 배포, 빌드, 테슨트 과정에서 더 이상 사용하지 않는 이미지나 빌드 케시가 계속 쌓이게 된다.

이런 데이터가 누적되면 디스크 용량을 많이 차지, 서버 운영 중 불필요한 리소스 압박이 발생할 수 있다.

다음 목적을 가지고 진행하였다.

```bash
- 현재 사용하지 않는 Docker 이미지 정리
- Docker 빌드 과정에서 남은 캐시 정리
- 서버 디스크 사용량 관리
- 불필요한 Docker 리소스 제거
```

## 2. 사용된 명령어

이번 작업에서 사용된 명령어는 아래와 같다.

```bash
docker image ls -f "dangling=false"

docker image prune -a

docker builder prune -a
```

각 명령어가 어떤 역할을 하는지 정리하였다.

---

## 3. docker image ls -f "dangling=false"

### 3-1. 명령어

```bash
docker image ls -f "dangling-false"
```

해당 명령어는 Docker 이미지 목록 중에서 `dangling image`가 아닌 이미지만 조회한다
즉, 태그가 정상적으로 붙어 있는 이미지를 확인하는 명령어다.

```bash
dangling=false
```

조건은 다음 의미를 가진다

```bash
dangling=false
# -> 이름 또는 태그가 존재하는 이미지 조회

dangling=true
# -> 이름이나 태그가 없는 이미지 조회
```

---

### 3-2 dangling image란

Docker에서 dangling image는 쉽게 이름과 태그가 없는 불필요한 이미지 조각이다.

예를 들어 이미지를 여러번 빌드 하면 기존 이미지가 새 이미지로 교체되며 이전 이미지가 `<none>` 상태로 남을 수 있다

예시는 아래와 같다

```bash
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
<none>       <none>    abc123456789   2 days ago     500MB
```

이런 이미지는 보통 현재 컨테이너에서 사용하지 않는 오래된 빌드 결과물일 가능성이 높다.
