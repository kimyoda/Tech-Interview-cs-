# 📚 Tech Interview - Docker

Docker의 컨테이너 기본 개념부터 로컬 개발 환경, 이미지·빌드 캐시 관리와 운영 장애 분석까지 정리한 문서 모음입니다.

> 아래 제목을 클릭하면 GitHub에서 해당 문서로 이동합니다.

## 문서 구성

### [Docker 기본 개념](./Docker.md)

- [Docker 기본 개념](./Docker.md) — 컨테이너, 이미지, Dockerfile 등 Docker의 핵심 구성 요소와 동작 원리를 설명한다.
- [Docker 기본 개념 보충](./Docker_basic.md) — Docker 명령어와 개발 환경에서의 활용 내용을 추가로 정리한다.

### [개발 환경과 운영 관리]

- [OrbStack 가이드](./Orbstack_가이드_정리.md) — Docker Desktop을 대체할 수 있는 OrbStack의 설치와 Docker·Kubernetes·Linux 개발 환경 활용 방법을 안내한다.
- [미사용 이미지·빌드 캐시 정리](./Docker_미사용이미지_정리.md) — 디스크 공간을 확보하기 위해 불필요한 이미지와 빌드 캐시를 안전하게 정리하는 방법을 다룬다.
- [`Too many open files` 오류 분석](./Docker_에러분석.md) — 파일 디스크립터 한도 초과로 발생하는 컨테이너 오류의 진단 과정과 해결 방법을 정리한다.
