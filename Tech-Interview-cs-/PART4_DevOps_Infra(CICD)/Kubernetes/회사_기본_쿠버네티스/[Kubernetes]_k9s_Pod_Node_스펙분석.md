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

2. Allocatable (실제 할당 가능한 리소스)

3. AllocatedResources (현재 할당된 리소스 현황)

4. 실제 Pod 할당 현황(예시)

---

## Requests & Limits 체크
