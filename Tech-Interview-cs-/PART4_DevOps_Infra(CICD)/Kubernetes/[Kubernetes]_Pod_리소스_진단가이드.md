# 🌐 Kubernetes Pod 리소스 진단 가이드

> kubectl로 운영 클러스터 리소스 상태를 점검하는 방식

오늘 회사에서 AWS에 올라간 EKS쪽에 이슈가 있어 리소스를 한번 점검하자는 얘기가 나와서, 어떻게 점검을 하는지 어떤 사항들을 체크하는 지 한번 간단한 예시로 들어보며 나누고자 한다.

> 변수명 약속: 문서 전체에 `{NAMESPACE}`, `{APP_NAME}`, `{PDD_NAME}` 처럼 중괄호로 표기된 부분은 실제 환경에 맞게 치환해서 한다.

## 🎯 1. 개요

운영 클러스터에서 이슈를 놓치지 않기 위해 Pod 수준의 리소스 사용량을 주기적으로 점검하는 것이 필요하다

문서는 kubectl 명령어 4가지로 아래 흐름을 따라 진단하는 방법을 설명한다

① Pod/컨테이너 실사용량 확인 → ② 설정값(request/limit)과 비교 → ③ HPA 동작 상태 점검 → ④ Deployment 설정 검토

---

## 2. Pod별 실시간 리소스 확인

### 2-1. 명령어

```bash
kubectl top pod -n {NAMESPACE}

# 출력 예시
NAME CPU(cores) MEMORY(bytes)
{APP_NAME}-798c844b6d-56q2k       45m          143Mi
{APP_NAME}-798c844b6d-hpj2g       112m         155Mi
...
```

### 2-2. 출력 컬럼 읽는 법

| 컬럼            | 설명                              |
| --------------- | --------------------------------- |
| `NAME`          | Pod 이름 (ReplicaSet hash 포함)   |
| `CPU(cores)`    | 현재 CPU 사용량. `1000m = 1 core` |
| `MEMORY(bytes)` | 현재 RSS 메모리 사용량            |

### 2-3. 어떤 점을 체크해야하나

- Pod 간 CPU 편차가 크면 → 특정 Pod에 트래픽이 집중되거나, 배치성 작업이 섞여 있을 수 있음
- 메모리가 특정 Pod에서만 높으면 → 메모리 누수 또는 캐시 비정상 증가 의심
- 전체적으로 낮으면 → 부하 자체가 낮은 시간대일 수 있어, 피크 시간대 별도 확인 필요

> `kubectl top은 metrics-server가 수집한 1~2분 평균값입니다. 순간 피크는 이 수치보다 높을 수 있습니다.

---

## 3. 컨테이너 단위 실사용량 확인

### 3-1. 명령어

```bash
kubectl top pod -n {NAMESPACE} --containers

# 출력 예시
PDD NAME CPU(cores) MEMORY(bytes)
{APP_NAME}-798c844b6d-56q2k       {APP_NAME}         10m          92Mi
{APP_NAME}-798c844b6d-56q2k       {APP_NAME}-redis   2m           38Mi
...

```

### 3-2. Pod 단위 vs 컨테이너 단위 값 차이

Pod단위 합산 값과 컨테이너 단위 합산 값이 다를 수 있다. metrics-server의 시점 차이 때문이고 정상 범위다.

### 3-3. 사이드카(Sidecar) 포함 구조에서 분석

- Redis, Envoy, Datadog Agent 등 sidecar가 있는 경우 컨테이너별 분리 확인이 필수다
- 메인 컨테이너는 여유로워도 sidecar가 메모리 한계에 근접하면 Pod 전체가 OOMKilled 될 수 있다
- `{APP_NAME}-redis` 처럼 Redis를 sidecar로 쓸 때: `maxmemory` 설정값이 컨테이너 `memory limit`과 너무 근접하면 위험

> ⚠️ **주의** Redis `maxmemory`와 컨테이너 `memory limit`을 동일하게 설정하면 Redis 프로세스 오버헤드 때문에 OOM이 발생할 수 있습니다. `maxmemory`는 limit의 약 80~85% 수준으로 여유를 두세요.

---

## 4. 리소스 설정값 확인 (describe pod)

### 4-1. 명령어

```bash
kubectl describe pod {PDD_NAME} -n {NAMESPACE}

# 또는 ReplicaSet 산하 임의의 Pod 하나를 잡고
kubectl describe pod $(kubectl get pod -n {NAMESPACE} -1 app={APP_NAME} \ -o jsonpath='{.itmes[0].metedata.name}') -n {NAMESPACE}
```

### 4-2. 출력해서 확인해야 할 항목

| 항목            | 의미                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `Requests`      | Kubernetes 스케줄러가 예약하는 최소 보장 리소스량                          |
| `Limits`        | 컨테이너가 사용할 수 있는 최대치. CPU는 throttle, Memory 초과 시 OOMKilled |
| `Restrat Count` | 0이 아니면 반복 재시작 중. 0이면 현재는 안정적                             |
| `Events`        | OOMKilled, BackOff, Unhealthy 등 이상 이벤트 여부                          |
| `State`         | `Running` / `CrashLoopBackOff` / `OOMKilled` 등                            |
| `Ready`         | `True`면 readiness probe 통과 상태                                         |

### 4-3. 실사용량과 설정값 비교 방법
