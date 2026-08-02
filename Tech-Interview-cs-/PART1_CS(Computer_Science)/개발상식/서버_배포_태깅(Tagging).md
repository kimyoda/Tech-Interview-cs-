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
jlpga-api:latest의 반복
```

`latest`라는 이름표만 계속 쓰면, 지금 서버에 올라간게 정확히 어떤 커밋 버전인지 알 수 없다. 물론 prod-0723 이런식으로 날짜 구분은 될 수 있지만, 당시 빌드가 모든 부분이 적용되어 단계적으로 커밋된 부분을 나누는건 힘들 수 있다.

---

## Docker Image 태깅 - 실무에서 많이 사용

### 기본 흐름

개발이 끝난 서버 코드를 빌드하면 아래처럼 이미지가 하나 만들어진다

```
jlpga-api:latest
```

해당 이미지를 QA 환경에 배포하려면, 아래처럼 구분 가능한 태그를 새로 붙인다.

```
jlpga-api:qa-20260730-121
```

또는 이미지 이름없이 태그 값만 짧게 쓸 수도 있다.

이후 Jenkins나 Kuberenetes는 `jlpga-api:qa-20260730-121` 이미지를 그대로 가져와서 배포한다.

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

### 태깅 후 배포까지 흐름

```
  코드 수정
     │
     ▼
  Git Push
     │
     ▼
  Jenkins Build
     │
     ▼
  Docker Image 생성   (jlpga-api:latest)
     │
     ▼
  이미지에 Tag 부착    (jlpga-api:qa-20260730-121)
     │
     ▼
  ECR(이미지 저장소) 등록
     │
     ▼
  Kubernetes가 해당 Tag를 Pull → 배포
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
