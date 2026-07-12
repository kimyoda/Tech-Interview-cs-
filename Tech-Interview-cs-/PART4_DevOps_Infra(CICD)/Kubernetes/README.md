# 📚 Tech Interview - Kubernetes

Kubernetes의 필요성·핵심 구조부터 EKS 접근 권한, 워크로드·설정 관리, Pod 리소스 진단까지 정리한 문서 모음입니다.

> 아래 제목을 클릭하면 GitHub에서 해당 폴더 또는 문서로 이동합니다.

## 문서 구성

### [Kubernetes 기초 개념]

- [Kubernetes가 필요한 이유](./%5BKubernetes%5D_필요이유.md) — 컨테이너 운영 환경에서 Kubernetes가 필요한 배경과 해결하는 문제를 설명.
- [Kubernetes 개념](./%5BKubernetes%5D_개념.md) — Kubernetes의 기본 정의와 컨테이너 오케스트레이션 역할을 정리.
- [Kubernetes 특징](./%5BKubernetes%5D_특징.md) — 오토스케일링, 자가 치유 등 Kubernetes의 주요 장점을 다룬다.
- [구성 요소](./%5BKubernetes%5D_구성요소.md) — `kubectl`을 포함해 클러스터를 구성하고 제어하는 핵심 요소를 설명.
- [클러스터 구성 요소](./%5BKubernetes%5D_클러스터%20구성요소.md) — Control Plane과 Worker Node의 역할 및 클러스터 구조를 정리.

### [AWS EKS와 운영 진단]

- [Kubernetes·EKS 이해](./%5BKubernetes%5DAWS권한%20관련_Kubernetes_이해.md) — Kubernetes 구조와 AWS EKS를 운영할 때 필요한 권한 관련 논의 내용을 정리.
- [AWS 콘솔에서 EKS 이용](./%5BKubernetes%5D_AWS권한%20관련_eks_이용.md) — AWS 콘솔에서 EKS 정보를 확인하고 역할별 접근 권한을 이해한다.
- [Pod 리소스 진단 가이드](./%5BKubernetes%5D_Pod_리소스_진단가이드.md) — Pod별 CPU·메모리 사용량을 확인하고 리소스 문제를 진단하는 방법을 안내한다.

### [회사 기본 Kubernetes 가이드](./회사_기본_쿠버네티스/)

- [AWS MFA 설정](./회사_기본_쿠버네티스/%5BKubernetes%5D_AWS_MFA%28다중인증관리%29.md) — AWS 계정의 다중 인증을 설정하고 접근 보안을 강화하는 방법을 다룬다.
- [EKS 접근 권한·리스트 확인](./회사_기본_쿠버네티스/%5BKubernetes%5D_EKS_접근권한세팅_리스트확인.md) — EKS 접속을 위한 계정·도구 설정과 컨테이너 목록 확인 방법을 정리한다.
- [kubectl](./회사_기본_쿠버네티스/%5BKubernetes%5D_Kubectl.md) — Kubernetes 리소스를 명령줄에서 조회·관리하는 기본 사용법을 설명한다.
- [Pod·Deployment·Service](./회사_기본_쿠버네티스/%5BKubernetes%5D_Pod,Deployment,Service.md) — 애플리케이션 배포와 네트워크 노출에 필요한 핵심 리소스를 다룬다.
- [ReplicaSet·DaemonSet·StatefulSet](./회사_기본_쿠버네티스/%5BKubernetes%5D_ReplicaSet,%20DaemonSet,%20StatefulSet%28다양한%20워크로드%20관리%20방식%29.md) — 실행 형태에 맞는 워크로드 관리 리소스와 선택 기준을 정리한다.
- [ConfigMap·Secret](./회사_기본_쿠버네티스/%5BKubernetes%5D_ConfigMap,%20Secret%28애플리케이션%20설정%20관리%29.md) — 애플리케이션 설정과 민감 정보를 분리해 관리하는 방법을 설명한다.
- [K9s 설정·명령어](./회사_기본_쿠버네티스/%5BKubernetes%5D_k9s_세팅%20및%20명령어.md) — 터미널 기반 Kubernetes 관리 도구인 K9s의 설치와 주요 조작 방법을 안내한다.
- [K9s Pod·Node 스펙 분석](./회사_기본_쿠버네티스/%5BKubernetes%5D_k9s_Pod_Node_스펙분석.md) — K9s로 Pod와 Node의 리소스·스펙을 분석하는 방법을 정리한다.
