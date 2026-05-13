# 🌐 Kubernetes Pod 리소스 진단 가이드

> kubectl로 운영 클러스터 리소스 상태를 점검하는 방식

오늘 회사에서 AWS에 올라간 EKS쪽에 이슈가 있어 리소스를 한번 점검하자는 얘기가 나와서, 어떻게 점검을 하는지 어떤 사항들을 체크하는 지 한번 간단한 예시로 들어보며 나누고자 한다.

> 변수명 약속: 문서 전체에 `{NAMESPACE}`, `{APP_NAME}`, `{PDD_NAME}` 처럼 중괄호로 표기된 부분은 실제 환경에 맞게 치환해서 한다.

## 🎯 1. 개요

운영 클러스터에서 이슈를 놓치지 않기 위해 Pod 수준의 리소스 사용량을 주기적으로 점검하는 것이 필요하다

문서는 kubectl 명령어 4가지로 아래 흐름을 따라 진단하는 방법을 설명한다

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
