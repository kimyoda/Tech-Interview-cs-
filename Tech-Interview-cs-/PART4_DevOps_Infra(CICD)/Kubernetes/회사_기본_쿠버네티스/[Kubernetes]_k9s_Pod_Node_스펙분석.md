# 🌐 K9s - Pod 분석, Node 분석

## 🎯 Pod 분석

K9s에서 Pod 정보 확인하는 거

```bash
# k9s 실행 후, 엔터 혹은 :
:pods # 목록 보기
<Enter> # 특정 Pod 선택 후 엔터
d # Describe 상세 정보 보기
```

**Pod 상세 보기 구조**

```bash
Name: myapp-api-""
Namespace: weather-test
Priority: 0
Service Account: default
Node: worker-node-01/
Labels: app=myapp-api pod-template-hash
Status: Running
```

1. 기본 데이터

   - Name: Pod의 고유 식별자(Deployment명-ReplicaSet-랜덤 문자열)
   - Namespace: Pod이 속한 논리적 공간
   - Node: Pod이 실제로 실행되고 있는 물리, 가상 서버
   - StartTime: Pod 생성되어 가동된 시간
   - Labels: Pod을 그룹핑하고 Key-Value 쌍으로 이루어짐

2. 컨테이너 리소스

```bash
Containers:
  myapp-api:
    Container ID:   containerd://abc123def456...
    Image:
    Port:           8080/TCP
    State:          Running
      Started:      Mon, 30 Sep 2025 14:20:38 +0900
    Ready:          True
    Restart Count:  0

    Limits:
      cpu:     500m
      memory:  1Gi

    Requests:
      cpu:     300m
      memory:  512Mi
```

- Container Id: 실제 컨테이너 런타임에서 부여한 ID
- Image: 컨테이너가 사용하는 이미지(레지스트리 주소 / 이미지명: 태그)
- State: 현재 컨테이너 상태(Running, Waiting 등)
- Ready: Health Check통과여부
- Restart Count
- Limits, Requests: 제한리소스(Pod이 최대로 사용할 수 있는 상한선), 요청 리소스(Pod이 정상 작동하기 위한 최소한 리소스)

3. 환경 변수 설정

```bash
Environment Variables from:
  api-config       ConfigMap  Optional: false
  api-secret       Secret     Optional: false
  redis-config     ConfigMap  Optional: false
  mysql-config     ConfigMap  Optional: false
  mysql-secret     Secret     Optional: false

Environment:
  DB_USERNAME:     admin
  LOG_LEVEL:       info
```

- ConfigMap: 설정 데이터를 외부에서 주입한다
- Secret: 민감한 정보를 암호화하여 전달 (Base64 인코딩)
- State: 현재 컨테이너 상태(Running, Waiting 등)
- Optional false: 해당 리소스가 없으면 Pod 실패

---

## Node 분석

### k9s에서 Node 정보 확인

```bash
# k9s 실행 후
:nodes         # Node 목록 보기
<Enter>        # 특정 Node 선택 후 엔터
d              # Describe 상세 정보 보기
```

### Node 상세정보

```bash
Name:               worker-node-01

Capacity:
  cpu:                4
  ephemeral-storage:  100Gi
  memory:             16Gi
  pods:               110

Allocatable:
  cpu:                3800m
  ephemeral-storage:  95Gi
  memory:             15Gi
  pods:               110
```

1. Capcity (물리적 하드웨어 사양)

- 이 Node가 가진 실제 하드웨어 리소스 총량이다.
  - cpu 4: 4개의 CPU 코어
  - memory: 16GI -> 16GB RAM
  - ephemeral-storage:100Gi-> 임시 저장소(컨테이어 레이어, 로그 등)
  - pods:110 -> Node에 최대 띄울 수 있는 Pod 개수

2. Allocatable (실제 할당 가능한 리소스)

- Capacity에 시스템 예약분을 제외하고 Pod들에 실제로 할당 가능한 리소스이다.

```bash
Allocatable = Capacity - System REserved - Eviction Threshold
```

- cpu:3800m -> 4000m 중 3.8 코어만 Pod들에 할당이 가능하다.
- memory:15Gi -> 16Gi 중 15Gi만 할당이 가능하다.
- 나머지 200m CPU, 1Gi 메모리는 시스템이 사용한다.
  💡 스케줄링 기준: 쿠버네티스 스케줄러는 Allocatable 기준으로 Pod을 배치합니다.

3. AllocatedResources (현재 할당된 리소스 현황)

#### 예시

```bash
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests      Limits
  --------           --------      ------
  cpu                2400m (63%)   4500m (118%)
  memory             10Gi (66%)    18Gi (120%)
```

Requests

- cpu:2400m(64%) -> Allocatable 3800m 중 2400m이 이미 예약
- memory:10Gi(66%) -> Allocatable 15Gi 중 10Gi가 예약
- CPU 1400m, 메모리 5Gi
  Limits
- cpu:4500m(118%) -> Allocatable 18%초과 (Overcommit)
- memory:18Gi(120%) -> Allocatable 20$초과 (Overcommit)

4. 실제 Pod 할당 현황(예시)
   예시

```bash
Namespace    Name                          CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age
---------    ----                          ------------  ----------  ---------------  -------------  ---
production   myapp-api-7d9f8c6b5a-x7k2m    300m (7%)     500m (13%)  512Mi (3%)       1Gi (6%)       2d
production   myapp-batch-8f5a3c9d2b-p9n4k  500m (13%)    1000m (26%) 1Gi (6%)         2Gi (13%)      2d
dev          test-app-6c8d7e4f3a-m2k8j     100m (2%)     200m (5%)   256Mi (1%)       512Mi (3%)     5h
```

- 각 Pod이 Node에 차지하고 있는 리소스 비율을 확인할 수 있다.
- Allocatable 대비 비율이다.

---

## Requests & Limits 체크

```yaml
resources:
  requests:
    cpu: 300m # 최소 보장 리소스
    memory: 512Mi
  limits:
    cpu: 500m # 최대 사용 가능 리소스
    memory: 1Gi
```

#### Requests (요청 리소스)

#### Limits (제한 리소스)

---

## 📚 참고: 단위 표기법
