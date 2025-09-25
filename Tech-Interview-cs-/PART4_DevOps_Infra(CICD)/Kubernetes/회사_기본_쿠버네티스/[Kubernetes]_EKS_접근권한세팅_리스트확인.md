# 🌐 AWS EKS 클러스터 접속, 계정 권한 세팅, 컨테이너 리스트 확인, 명령어 등

## 🎯 1. AWS EKS 클러스터 접속, 계정 권한 세팅

### 🎯 AWS EKS 권한 및 도구세팅

- macOS에서 AWS EKS 클러스터에 접속 후 컨테이너 목록을 확인하는 과정 및 권한 세팅

---

### 📋 권한 자료 준비

1. `AWS Access Key ID`(액세스 키 ID)
2. `AWS Secret Access Key` (비밀 액세스 키)
3. `AWS 리전(Region) 이름`(예:`ap-asia-2)
4. `EKS 클러스터(Cluster)이름`(예:`my-eks-cluster`)

#### 💻 필수 도구 설치

**AWS CLI 설치**

```bash
# AWS CLI 설치
brew install awscli

# 설치 확인
which aws

# 버전 확인
aws --version
```

**kubectl 설치**

```bash
# kubectl 설치
brew install kubectl

# 설치 확인
which kubectl

# 버전 확인
kubectl version --client
```

**eksctl 설치**

```bash
# kubectl 설치
brew install eksctl

# 설치 확인
which eksctl

# 버전 확인
kubectl version
```

#### 💳 AWS CLI 설정

```bash
aws configure
```

- 각 항목에 준비한 정보를 입력한다.
  - `AWS Acess key ID`: Access Key ID 입력
  - `AWS Secret Access Key`: Secret Access Key 입력
  - `Default region name`: 리전 이름(예: api-asai-2) 입력
  - `Default output format`: JSON, TEXT 등

AWS 설정확인

```bash
# 현재 설정 확인
aws configure list
# 출력 예시:
#       Name                    Value             Type    Location
#       ----                    -----             ----    --------
#    profile                <not set>             None    None
# access_key     ****************P42P shared-credentials-file
# secret_key     ****************Fpdr shared-credentials-file
#     region           ap-northeast-1      config-file    ~/.aws/config

# 현재 자격 증명 확인
aws sts get-caller-identity
# 출력 예시:
# {
#     "UserId": "awsuser아이디",
#     "Account": "계정",
#     "Arn": "arn:aws:iam::아이디:user/neo_유저아이디_api"# }
# }
```

#### kubectl과 EKS 클러스터 연결 📍

1. **kubeconfig 업데이트**

```bash
# EKS 클러스터 정보를 kubectl에 등록한다.
aws eks update-kubeconfig --region <리전_이름> --name <클러스터_이름>

# 실행 예
aws eks update-kubeconfig --region ap-asia-2 --name my-eks-cluster

# 출력
# Updated context arn:aws:eks:ap-asia-2:계정이름:cluster/my-eks-cluster in /Users/kimyohan/.kube/config
```

2. **연결 상태 확인**

```bash
# kubectl 설정 확인
kubectl config current-context
# 출력: arn:aws:eks:ap-asia-1:계정아디:cluster/해당클러스터-cluster

# 클러스터 정보 확인
kubectl cluster-info

# 출력 예: Kubernetes control plane is running at https://cluster주소.ap-asia-1.eks.amazonaws.com

# To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

# 노드 상태 확인
kubectl get nodes

# NAME                  STATUS   ROLES    AGE     VERSION

# i-네임스페이스            Ready   <none>   47h     버전
```

#### 컨테이너 리스트 확인 (최종 목표) ✅

1. **기본 Pod 목록 확인**

```bash
# 특정 네임스페이스의 Pod들만 확인
kubectl get pods -n default

# Pod 상세 정보 확인
kubectl describe pod <pod-이름> -n <네임스페이스>
# NAME                            READY   STATUS    RESTARTS   AGE
# podNAME                          2/2    Running     0        5d21h

# Pod의 로그 확인
kubectl logs <pod-이름> -n <네임스페이스>
# Defaulted container "api" out of: api, api-redis
# [19-Sep-2025 09:57:44] NOTICE: fpm is running, pid 1
# [19-Sep-2025 09:57:44] NOTICE: ready to handle connections
# IP주소 - - [22/Sep/2025:07:56:17 +0000] "POST /api/네임스페이스 관련 HTTP/1.1" 200 247 "-" "-"

# 실시간 로그 확인
kubectl logs -f <pod-이름> -n <네임스페이스>
```

유용한 kubectl 명령어들

```bash
# 서비스 목록 확인
kubectl get services -A

# Pod 상세 정보 확인
kubectl describe pod <pod-이름> -n <네임스페이스>

# Pod의 로그 확인
kubectl logs <pod-이름> -n <네임스페이스>

# 실시간 로그 확인
kubectl logs -f <pod-이름> -n <네임스페이스>

# 서비스 목록 확인
kubectl get services -A

# 배포(Deployment) 확인
kubectl get deployments -A

# ReplicaSet 확인
kubectl get replicasets -A

# 모든 리소스 한 번에 보기
kubectl get all -A
```
