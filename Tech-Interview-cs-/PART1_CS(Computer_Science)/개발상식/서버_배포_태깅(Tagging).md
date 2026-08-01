# 🌐 서버 배포 태깅(Tagging), 이름표 하나로 시작

> 태깅해서 올려달라
> 해당 말을 처음 들었을떄는 태그랑 비슷한 의미인가? 생각이 든다. 실무에서 태깅은 대부분 Docker Image에 이름표를 붙이는 것을 의미한다
> 해당 글에서 태깅이 왜 필요한지, 어떻게 만들어지는지 어떤 역할을 하는지 정리하였다

---

## 태깅이 뭔가

**태깅 = 배포하는 버전에 붙이는 이름표**
옷 가게에 옷이 걸려 있으면 사이즈/색상 태그가 붙어있는 것처럼 서버 배포도 이와 유사하다

매번 새로 빌드된 서버(이미지)에 "몇 번째 버전" 이름표를 붙여야, 나중에 어떤 버전이 배포됐는지 구분할 수 있다

태깅을 안한다면

```
example-api:latest의 반복
```

`latest`라는 이름표만 계속 쓰면, 지금 서버에 올라간게 정확히 어떤 커밋 버전인지 알 수 없다. 물론 prod-0723 이런식으로 날짜 구분은 될 수 있지만, 당시 빌드가 모든 부분이 적용되어 단계적으로 커밋된 부분을 나누는건 힘들 수 있다.
`latest`는 태그를 생략했을 때 적용되는 기본 문자열이다. 다음 두 명령은 사실상 같은 참조를 사용한다

```bash
docker pull exapmle-api
docker pull example-api;latest
```

레지스트리는 빌드 시각이나 Git 커밋 시각을 비교해 가장 최신이미지를 자동으로 `latest`로 선정하지 않는다. 누군가 `latest`라는 태그로 마지막에 Push한 이미지가 해당 태그가 가리키는 대상이된다. Docker Hub에서 태그는 기본적으로 다른 이미지로 다시 저장할 수 있는 mutable reference, ECR 역시 저장소 설정을 통해 태그 덮어쓰기를 허용하거나 막을 수 있다.

## 태깅이 필요한 이유

매번 서버 코드를 빌드하면 새로운 이미지가 만들어진다. 배포 이미지에 구분 가능한 태그가 없으면 중간에 롤백을 하거나 몇 건 정도만 수정하고싶은 경우 처리가 힘들기에 대비한다

- 현재 QA와 Prod 어떤 이미지가 배포되어 있는가
- 해당 이미지는 Git 커밋에서 만들어졌는가
- 어떤 Jenkins 빌드가 해당 이미지를 생성했는가
- 이슈가 발생했을 때 어느 이미지로 롤백해야 하나
- QA에서 검증한 이미지와 Live 이미지가 실제로 동일한가

따라서 배포 이미지에 빌드와 소스를 추적할 수 있는 고유 태그를 붙이는 것이 좋다.

---

### 태그를 지정하지 않는 이슈

태그를 지정하지 않고 이미지를 빌드하거나

```
example-api:latest
```

누군가 다음과 같이 Push하면 `latest`가 가리키는 이미지가 변경될 수 있다
동일한 태그를 반복해서 사용하면 문제가 생길 수 있다

```text
어제의 example-api:latest
-> digest: sha256:1111...

오늘의 example-api:latest
-> digest: sha256:2222....
```

두 이미지의 이름은 가트안 실제 내용은 다를 수 있다. 이 경우 K8s 설정에 기록되어 있어도, 해당 설정만 보고 어떤 코드가 실행되고 있는지 정확히 판단하기 어렵다
레지스트리에서 `latest`가 다른 이미지로 변경되어도 Kubernetes Deployment의 Pod가 변경되지 않았다면 새 롤아웃이 자동으로 시작되지 않는다
운영 환경에서 고유 태그를 사용하는것이 좋다

```text
jlpga-api:20260730-121-a1b2c3d4

```

---

### 날짜 태그만으로 충분한가

다음처럼 날짜 기반 태그를 사용할 수 있다

```text
example-api:prod-20269731
```

날짜가 있으면 언제 만들어진 이미지 대략 확인할 수 있다
같은 날 여러번 빌드하거나 배포하면 각각을 구분하기 어렵다
이를 보완하기 위해 Jenkins 빌드 번호를 추가할 수 있다

```text
prod-20260731-121
```

날짜와 빌드 번호만으로는 Git 컷민을 즉시 확인하기 어려울 수 있다. Git 커밋 SHA까지 포함하는 방식을 권장한다

```text
20260731-121-a1b2c3

20260730
│
└─ 이미지 빌드 날짜

121
│
└─ Jenkins 빌드 번호

a1b2c3d4
│
└─ Git 커밋 SHA 일부
```

---

## Docker Image 태깅 - 실무에서 많이 사용

### 기본 흐름

개발이 끝난 서버 코드를 빌드하면 아래처럼 이미지가 하나 만들어진다
Docker 태깅은 이미지를 복제, 새로운 이미지를 만드는 행위보다, 기존 이미지에 새로운 참조를 추가하는 행위에 가깝다.

```
docker tag jlpga-api:build-121 \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/jlpga-api:build-121
```

해당 명령은 이미지 내용을 다시 빌드하지 않는다. 동일한 로컬 이미지에 ECR에 Push 할 수 있는 새 이름을 붙인다. Docker 공식 명령도 `docker image tag`를 "SOURCE_IMAGE 가르키는 TARGET_IMAGE 태그를 생성하는 것"으로 정의한다.

해당 이미지를 QA 환경에 배포하려면, 아래처럼 구분 가능한 태그를 새로 붙인다.

```
jlpga-api:qa-20260730-121
```

또는 이미지 이름없이 태그 값만 짧게 쓸 수도 있다.

이후 Jenkins나 Kuberenetes는 `jlpga-api:qa-20260730-121` 이미지를 그대로 가져와서 배포한다.

처음부터 고유 태그를 지정할 수 있다

```bash
docker build \ -t example-api:20260731-121-a1b2c3 \
```

ECR 주소까지 포함해 빌드할 수 있다

```bash
docker build \
  -t 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/example-api:20260730-121-a1b2c3d4 \
  .

```

이후 ECR에 Push 한다

```bash
docker push \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/jlpga-api:20260730-121-a1b2c3d4

```

### 기존 이미지에 새 태그 붙이기

이미 생성된 이미지에 새 태그를 추가할 수 있다

```bash
docker tag \
  example-api:latest \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/example-api:20260730-121-a1b2c3d4
```

새 태그를 ECR에 Push한다

해당 과정에서 이미지가 다시빌드되는것은 아니다. 기존 이미지에 새로운 참조 이름이 추가된다

> 20260731-121-a1b2c3 태그로 배포

Docker 명령이나 Kubernetes 설정에서 일반적으로 저장소 이름을 포함한 이미지 참조가 필요하다

```text
example-api:20260731-121-a1b2c3
```

---

### 태그 이름은?

```
qa-20260730-121
 │    │        │
 │    │        └─ 121 → Jenkins 빌드 번호 (또는 배포 번호)
 │    └────────── 20260730 → 배포한 날짜 (YYYYMMDD)
 └─────────────── qa → 배포 대상 환경 (QA / Prod / Dev 등)
```

| 구성 요소   | 의미                              | 예시                |
| ----------- | --------------------------------- | ------------------- |
| 환경 접두사 | 어느 환경에 배포되는 이미지인지   | `qa`, `prod`, `dev` |
| 날짜        | 이미지가 빌드/배포된 날짜         | `20260730`          |
| 빌드 번호   | Jenkins CI가 자동으로 매기는 순번 | `121`               |

---

### Git 태깅 - 코드 저장소에 붙이는 이름

Docker Image 태깅과 별개로, Git 자체에 태그를 붙일 수 있다.

```bash
git tag v1.2.0
git push origin v1.2.0
```

해당 명령은 해당 커밋이 v1.2.0 버전이라고 표시하는 것이다

Docker 태깅, Git 태깅의 차이는?

| 구분      | Docker Image 태깅         | Git 태깅                  |
| --------- | ------------------------- | ------------------------- |
| 대상      | 빌드된 실행 가능한 이미지 | 소스 코드의 특정 커밋     |
| 목적      | 배포/운영 버전 관리       | 릴리즈 버전 이력 관리     |
| 사용 주체 | Jenkins, Kubernetes, ECR  | 개발자, 저장소(GitHub 등) |
| 빈도      | QA 배포마다 자주 생성     | 정식 릴리즈 시점에 생성   |

---

### 이미지 digest

태그는 사람이 읽기 쉽고 변경될 수 있다. digest는 이미지 콘텐츠를 기준으로 만들어진 식별자다

```text
sha256:0123456789abcdef...

```

동일한 태그가 digest가 다르면 서로 다른 이미지다

```text
jlpga-api:v1.2.0
└─ sha256:1111...

태그 덮어쓰기 후

jlpga-api:v1.2.0
└─ sha256:2222...

```

---

### 태깅 후 배포까지 흐름

```
코드 수정
    │
    ▼
Git Commit / Git Push
    │
    ▼
Jenkins Pipeline 실행
    │
    ├─ 테스트
    ├─ Git SHA 확인
    └─ BUILD_NUMBER 확인
    │
    ▼
고유 이미지 태그 생성
20260730-121-a1b2c3d4
    │
    ▼
Docker 이미지 한 번 빌드
    │
    ▼
ECR Push
    │
    ▼
이미지 digest 기록
    │
    ▼
QA Deployment의 이미지 참조 변경
    │
    ▼
Kubernetes Rolling Update
    │
    ▼
QA 테스트 및 승인
    │
    ▼
동일한 이미지 또는 동일 digest를 Prod로 승격
    │
    ▼
Prod Deployment의 이미지 참조 변경
    │
    ▼
배포 결과 및 롤아웃 상태 확인

```

**"새로운 배포 버전을 만들고 QA/Prod에 올리는 과정 전체"**

---

### 롤백할 때 태그가 중요한 것은

이슈가 생겼다고 가정한다.
현재 배포 버전은 다음과 같다

```text
example-api:20260731-121-a1b2c3
```

이전 정상 버전은 다음과 같다

```text
example-api:20260730-118-9ㄹㄷㅊ7ㅇ
```

이전 태그가 덮어써지지 않고 보존되어 있으면 이미지 참조를 되돌릴 수 있다

```bash
kubectl set image \
  deployment/example-api \
  example-api=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/example-api:20260729-118-9f8e7d6c

```

또는 Kubernetes Deployment 이력을 이용할 수 있다

```bash
kubectl rollout history deployment/example-api
kubectl rollout undo deployment/example-api

```

정확한 롤백을 위해 다음 조건이 필요하다

- 배포마다 고유한 태그를 사용한다
- 기존 고유 태그를 덮어쓰지 않는다
- 가능하면 digest를 기록
- Git SHA와 Jenkins 빌드 번호를 연결
- ECR Tag Immutablitiy 적용을 검토

---

### 정리

태깅해서 올려달라는건

> 이번 수정사항으로 Docker 이미지를 빌드, 소스와 비르드를 추적할 수 있는 고유 태그를 붙여 레지스트리에 Push 한 뒤 또는 QA, PROD에 배포한다

단순히 이미지 이름 뒤에 문자열을 붙이는 것이 전부는 아니다

```text
Git Commit
    ↕
Jenkins Build
    ↕
Docker Image
    ↕
ECR Digest
    ↕
Kubernetes Deployment
```

안전한 배포를 위해 다음 부분들을 고려하면 좋다

1. 날짜만 사용하지 말고 빌드 번호와 Git SHA 함께 기록한다
2. 불변 고유 태그 또는 digest를 배포 기준으로 사용
3. 같은 고유 태그를 다른 이미지에 사용핮 않는다
4. QA에서 검증한 이미지를 다시 빌드하지 않는다
5. Kubernetes Deplotment의 이미지 참조를 실제 변경해 롤아웃을 발생시킨다
6. Git 태그와 Docker 이미지 태그를 구분하고 서로 추적할 수 있게 연결한다

---

> "이번 수정사항으로 Docker 이미지를 새로 빌드하고, 새로운 태그를 만들어서 QA(또는 Prod)에 배포."
