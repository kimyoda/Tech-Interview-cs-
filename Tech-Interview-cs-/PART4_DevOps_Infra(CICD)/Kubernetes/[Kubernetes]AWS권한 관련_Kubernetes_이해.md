# 🌐 쿠버네티스(Kubernetes) 및 EKS 관련 차장님과 논의한 내용

- 이번달에 AWS 라이브 권한을 받기로 하여, 아래 내용들을 미리 이해하고 학습하고자 한다.

# 1. Kubernetes 개념 이해

- Pod, Deployment, Service: Kubernetes의 가장 기본적인 워크로드와 네트워크 개념을 이해
- ReplicaSet, DaemonSet, StatefulSet: 다양한 워크로드 관리 방식을 이해
- ConfigMap, Secret: 애플리케이션 설정을 관리하는 방법
- Volume, PV, PVC: 스토리지 관리 방식을 이해
- Namespace: 논리적인 격리 단위를 이해
- kubectl: Kubernetes 클러스터를 관리하는 명령줄 도구인 kubectl의 기본적인 사용법 이해

예)

> kubectl get pod -n [NAMESPACE]  
> kubectl apply -f deployment.yaml

2. EKS 사용

- AWS 콘솔에서 EKS 정보 보기
- CLI 환경 설정 (kubectl을 사용할 수 있는 환경 설정)
- 필요한 도구 설치 및 설정
- kubeconfig 파일 업데이트
- 접근 권한 설정

-> 1번과 2번에 나눠서 정리하고자 한다.

## 🎯 1. Kubernetes 개념 이해

## 1-1. Pod / Deployment / Service

### 🚀 Pod(파드)

- 쿠버네티스에서 생성되고 관리할 수 있는 가장 작은 배포 단위. 파드는 하나 이상의 컨테이너 그룹이며, 스토리지와 네트워크를 포함한 특정 `실행 컨텍스트`를 공유한다.
- 목적: 컨테이너는 단일 프로세스를 실행하도록 설계됨. 파드는 결합된 컨테이너들을 하나의 원자적 단위(Atomic Unit)로 묶어 함께 스케줄링·관리하기 위함.

1. 원자적 단위: 파드는 함께 생성되고 함께 중지된다. 스케줄링은 파드 단위로만 수행된다.
2. 스토리지 공유: 파드에 정의된 볼륨은 내부의 모든 컨테이너에 마운트될 수 있어 파일 공유가 쉽다.
3. 네트워크 공유: 파드 내 모든 컨테이너는 동일한 네트워크 네임스페이스에 속하며 같은 IP/포트 공간을 공유, `localhost`로 통신 가능하다.
4. 생명주기: `Pending`(스케줄링 대기) -> `Running`(정상 실행) -> `Succeeded`(성공 종료) -> `Failed`(실패 종료) -> `Unknown`(상태 불명).
   - 디버깅 시작: `kubectl describe pod <POD_NAME> -n <NAMESPACE>`로 상태와 이벤트 확인.

---

### 📈 Deployment - 선언적 애플리케이션

- `Pod`와 `ReplicaSet`의 원하는 상태를 선언적으로 관리하는 컨트롤러.
- 목적: 애플리케이션 인스턴스가 항상 N개 유지되고, 업그레이드가 중단 없이 안전하게 수행되도록 보장.

1. Rolling Update(무중단 업데이트): 새 버전을 점진적으로 배포하며 구 버전 파드를 순차적으로 교체해 다운타임 최소화.
2. Self-healing(자가 치유): 파드가 비정상 종료되면 자동으로 새 파드를 생성해 정의된 개수를 유지. YAML에 원하는 상태를 정의하고 현재 상태를 지속적으로 감시하여 불일치 시 조치한다.
3. Rollback(롤백): 문제가 발생하면 `kubectl rollout undo`로 이전 안정 버전으로 되돌릴 수 있다.

예)

- 배포 적용: `kubectl apply -f deployment.yaml`
- 롤아웃 상태: `kubectl rollout status deployment/<DEPLOY_NAME> -n <NAMESPACE>`
- 롤백: `kubectl rollout undo deployment/<DEPLOY_NAME> -n <NAMESPACE>`

---

### 🔄 Service

- 파드 그룹에 대한 고정된 네트워크 진입점(Endpoint)을 제공하는 오브젝트.
- 목적: 파드는 Deployment에 의해 수시로 생성/삭제되어 IP가 바뀐다. 서비스는 고정된 가상 IP(Virtual IP)와 DNS 이름을 제공해 안정적으로 접근하도록 한다.

1. 안정적인 IP와 DNS: 서비스는 고유 가상 IP(ClusterIP)와 클러스터 내부 DNS 이름을 부여한다. 다른 애플리케이션은 서비스 이름만으로 접근 가능.
2. 로드 밸런싱: 서비스가 관리하는 파드 목록으로 들어오는 트래픽을 자동 분산하여 특정 파드로 쏠림을 방지.
3. Label Selector: 레이블 셀렉터로 대상 파드 그룹을 동적으로 식별. 예: `app: my-api` 레이블을 가진 파드는 `my-api-svc`의 대상이 될 수 있다.

- Service Types
  1. `ClusterIP(기본값)`: 클러스터 내부에서만 접근 가능한 가상 IP를 할당. 서비스 간 내부 통신 용도.
  2. `NodePort`: 모든 노드의 특정 포트를 열어 외부에서 `노드IP:포트`로 접근. 주로 개발/테스트 용도.
  3. `LoadBalancer`: 클라우드 로드 밸런서를 프로비저닝해 외부 인터넷에서 접근 가능(AWS, GCP 등).
  4. `ExternalName`: 외부 서비스에 대한 CNAME 레코드를 반환해 내부에서 외부 서비스를 별칭으로 사용.

---

## 1-2. 다양한 워크로드 관리 방식(ReplicaSet, DaemonSet, StatefulSet)

### ReplicaSet (레플리카셋)

- 역할: 원하는 수의 Pod 복제본을 항상 유지한다(자가 치유).
- 주용도: 단독 사용은 드묾. 보통 `Deployment`가 내부적으로 생성·관리한다.
- 핵심
  - Label Selector로 대상 파드 그룹 식별
  - 원하는 상태(desired)와 현재 상태(current) 비교·조정
  - 스케일 아웃/인 시 파드 자동 생성·삭제
- 언제 쓰나: 단순히 파드 개수만 직접 관리해야 하거나, `Deployment` 없이 세밀 제어가 필요할 때

### DaemonSet(데몬셋)

- 역할: 모든(또는 특정) 노드마다 1개 파드를 배치한다.
- 사용 예: 로그 수집(fluentd/logstash), 모니터링(node-exporter/datadog), 네트워크 플러그인(calico), 스토리지 데몬(ceph 등)
- 특징
  - 노드 추가/제거 시 자동 반영(해당 노드에 파드 생성/삭제)
  - NodeSelector/Node Affinity/Tolerations로 특정 노드 그룹에만 배포 가능
  - EKS 기본 컴포넌트(예: `aws-node` VPC CNI, `kube-proxy`)가 DaemonSet으로 동작
- 언제 쓰나: 노드 단위로 반드시 실행되어야 하는 에이전트/데몬 배치

### StatefulSet(스테이트풀셋)

- 역할: 상태가 있는 워크로드를 위한 컨트롤러(DB, 메시징 등).
- 특징(중요)
  - 안정된 이름과 네트워크 ID: `{statefulset-name}-{ordinal}` 형태로 각 파드가 고유 ID를 가짐
  - 순서 보장: 생성은 0→1→2…, 종료는 역순으로 진행
  - 안정적 스토리지: 각 파드에 전용 PVC 자동 바인딩(재시작해도 같은 볼륨 유지)
  - 안정적 DNS: 파드별 고정 DNS를 통해 특정 인스턴스에 직접 접근 가능
- 언제 쓰나: MySQL, PostgreSQL, Kafka, ZooKeeper 등 데이터 영속·순서·고유 ID가 필요한 경우

---

## 1-3. 애플리케이션 설정관리(ConfigMap, Secret)

### ConfigMap(컨피그맵)

- 애플리케이션의 비민감 설정 데이터를 저장하는 API 오브젝트다.
- 목적
  - 애플리케이션 코드와 설정을 분리해 환경별로 다른 설정을 적용할 수 있게 한다. 동일한 이미지를 사용하되 설정만 다르게 주입한다(개발/스테이징/프로덕션).
  1. 환경 변수로 주입
  2. 볼륨로 마운트(설정 파일 형태)
  3. 커맨드라인 인자로 전달
- 환경별 관리: `dev-config`, `staging-config`, `prod-config` 등으로 나눠 관리한다.

### Secret(시크릿)

- 비밀번호, OAuth 토큰, SSH 키, TLS 인증서 등 **민감한 데이터를 안전하게 저장**하는 API 오브젝트다.
- 목적: 민감 정보를 코드/이미지에 하드코딩하지 않고 런타임에 안전하게 주입한다.

- ConfigMap vs Secret
  - Secret: Base64 인코딩 저장, at-rest 암호화(etcd) 가능, 보통 메모리(tmpfs)로 마운트 권장
  - ConfigMap: 평문 저장(민감하지 않은 설정), 필요 시 etcd 암호화 별도 구성
- Secret 타입들:
  1. Opaque: 일반적인 key-value 데이터(기본)
  2. kubernetes.io/dockerconfigjson: Docker 레지스트리 인증 정보
  3. kubernetes.io/tls: TLS 인증서와 키
  4. kubernetes.io/service-account-token: ServiceAccount 토큰
