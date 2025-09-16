# 🌐 쿠버네티스(Kubernetes) 및 EKS 관련 차장님과 논의한 내용

- 이번달에 AWS 라이브 권한을 받기로 하여, 아래 내용들을 미리 이해하고 학습하고자 한다.

2. EKS 사용

- AWS 콘솔에서 EKS 정보 보기
- CLI 환경 설정 (kubectl을 사용할 수 있는 환경 설정)
- 필요한 도구 설치 및 설정
- kubeconfig 파일 업데이트
- 접근 권한 설정

-> 2번에 나눠서 정리하고자 한다.

## 🎯 2. AWS 콘솔에서 EKS 정보 보기

- AWS Management Console의 EKS 섹션은 클러스터의 전반적인 상태와 구성을 시각적으로 확인할 수 있는 웹 기반 대시보드이다.

### 역할

1. 상태 모니터링: 클러스터 상태, Kubernetes 버전, API 서버 엔드포인트 등 핵심 메타데이터를 확인한다.
2. 리소스 시각화: 워커 노드 그룹, Fargate 프로파일, 실행 중인 워크로드를 GUI에서 직관적으로 파악한다.
3. 기본 설정 관리: 클러스터 로깅, 네트워크 설정, 부가 기능(Add-on) 관리

- 개요:
  1. 클러스터 ARN
  2. API 서버 엔드포인트
  3. OpenID Connect 공급자 URL: ServiceAccount 기반 IAM 역할, 연결에 필요하다
  4. 플랫폼 버전: EKS에서 관리하는 Kubernetes 컨트롤 플레인 버전
  5. 생성시간 및 마지막 업데이트 시간

컴퓨터탭

- 관리형 노드 그룹:

```plain text
노드 그룹 이름: workers-1
상태: Active
노드 개수: 3 (원하는 크기: 3, 최소: 1, 최대: 5)
인스턴스 유형: m5, large
AMI 유형: AL2_x86_64
용량 유형: On-Demand

```

- Fargate 프로파일:
  - 서버리스 컨테이너 실행 환경
  - 특정 네임스페이스나 레이블을 가진 Pod를 자동으로 Fargate에서 실행한다.
- 네트워킹(Networking) 탭
  - VPC 설정: 클러스터가 실행되는 VPC와 서브넷 정보
  - **클러스터 보안 그룹**: EKS가 자동 생성한 보안그룹
  - **엔드포인트 접근 제어**:
    - Public: 인터넷에서 API 서버 접근이 가능하다.
    - Private: VPC 내부에서만 접근이 가능하다
    - Public and Private: 둘다 허용한다.
- 부가 기능(Add-ons)탭
- 기능

  - VPC CNI: Pod 네트워킹을 담당하는 플러그인이다.
  - CoreDNS: 클러스터 내부 DNS 서비스
  - kube-proxy: Service 로드밸런싱을 담당한다.
  - EBS CSI Driver: EBS 볼륨을 PV로 사용할 수 있게 해주는 드라이버다.

- 워크로드(Workloads) 탭
- 현재 클러스터에 배포된 kubernetes 리소스들을 시각적으로 표시한다

  - Deployments: 실행 중인 애플리케이션 배포
  - Pods: 현재 실행 중인 Pod 목록과 상태
  - Services: 네트워크 서비스 목록
  - Ingress: 외부 트래픽 라우팅 규칙

  -> 빠른 상태 점검, 문제 발생 시 첫번째 확인 지점, 비개발자와의 소통

---

### 2_2. CLI 환경 설정 - kubectl을 사용할 수 있는 환경 구축

- 로컬 개발 환경에서 `kubectl`로 EKS 클러스터를 제어할 수 있도록 기본 CLI들을 설치·구성한다.

필수 도구(요약)

- AWS CLI: IAM 기반 인증·권한으로 EKS에 접근하기 위한 필수 도구
- kubectl: Kubernetes CLI
- eksctl: EKS 전용 관리 도구(클러스터/노드그룹 생성·관리)

1. AWS CLI 설치

- 역할: 로컬 사용자가 유효한 IAM 주체임을 증명하고, EKS 인증 토큰 등을 발급받는 데 사용한다.

- macOS

```bash
# Homebrew 권장
brew install awscli

# 또는 공식 패키지 설치
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# 설치 확인
aws --version
```

- Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y awscli unzip

# 또는 최신 버전 수동 설치(x86_64)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

aws --version
```

- Windows
  - MSI 설치 프로그램 사용(공식 문서): [AWS CLI 설치 가이드](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html)
  - 설치 후 PowerShell에서 `aws --version`으로 확인

2. kubectl 설치

- macOS

```bash
# Homebrew
brew install kubectl

# 직접 다운로드(아키텍처에 맞춰 선택)
# Apple Silicon: darwin/arm64, Intel: darwin/amd64
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then KARCH=arm64; else KARCH=amd64; fi
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/${KARCH}/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/kubectl

kubectl version --client --output=yaml
```

- Linux

```bash
# 아키텍처에 맞춰 선택(예: amd64, arm64)
ARCH=amd64
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 또는 패키지 관리자 사용(Ubuntu)
sudo apt-get update && sudo apt-get install -y kubectl

kubectl version --client --output=yaml
```

- Windows(선택)
  - `choco install kubernetes-cli` 또는 `scoop install kubectl`

3. eksctl 설치

- 역할: EKS 클러스터/노드그룹 생성·업그레이드 등 선언적 관리.

```bash
# macOS
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Linux(x86_64)
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# 설치 확인
eksctl version
```

4. AWS 자격 증명 구성

```bash
# 대화형 구성(프로파일 생성)
aws configure --profile my-admin

# 입력 예시
# AWS Access Key ID [None]: <YOUR_ACCESS_KEY>
# AWS Secret Access Key [None]: <YOUR_SECRET_KEY>
# Default region name [None]: ap-northeast-2
# Default output format [None]: json

# 현재 자격 확인(프로파일 지정)
aws sts get-caller-identity --profile my-admin
```

- 자주 쓰는 팁
  - 프로파일 사용: 매 명령어에 `--profile my-admin` 추가 또는 `export AWS_PROFILE=my-admin`
  - 환경변수(CI/CD 등)
    ```bash
    export AWS_ACCESS_KEY_ID=your-access-key
    export AWS_SECRET_ACCESS_KEY=your-secret-key
    export AWS_DEFAULT_REGION=ap-northeast-2
    ```
  - 자격 파일 위치: `~/.aws/credentials`, 설정: `~/.aws/config`
  - MFA/SSO를 쓰는 조직이라면: `aws configure sso` 또는 `aws sso login --profile <PROFILE>` 후 사용

5. 빠른 동작 확인(필수 체크리스트)

```bash
# 1) 버전 확인
aws --version
kubectl version --client --short
eksctl version

# 2) 내 자격/권한 확인
aws sts get-caller-identity --profile my-admin

# 3) EKS 조회 & kubeconfig 연결(권한 있어야 성공)
aws eks list-clusters --region ap-northeast-2 --profile my-admin
aws eks update-kubeconfig --name <CLUSTER_NAME> --region ap-northeast-2 --profile my-admin

# 4) kubectl로 클러스터 통신 확인
kubectl config current-context
kubectl get nodes -o wide
kubectl get ns
```
