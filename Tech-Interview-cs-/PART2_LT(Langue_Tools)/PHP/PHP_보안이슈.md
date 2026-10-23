# PHP 보안 패치 적용: 버전 확인, 재빌드 및 운영 확인

## 1. PHP 보안 뉴스 확인

PHP 보안 취약점 관련 [뉴스](https://www.yna.co.kr/view/AKR20261021154600098)를 접하고, 현재 운영 중인 서비스가 해당 취약점의 영향을 받는지 확인하였다.

확인 대상은 PHP·Laravel 애플리케이션을 Docker 이미지로 빌드하고 Kubernetes에서 실행하는 환경이다.

확인은 다음 순서로 진행하였다.

1. 프로젝트의 PHP 버전 확인
2. Dockerfile에 지정된 PHP 베이스 이미지 확인
3. 실행 중인 컨테이너의 정확한 PHP 버전 조회
4. PHP 공식 공지 및 변경 기록 대조
5. 실제 패치 방법 확인 및 반영 후 버전 검증

이번 작업은 **소스코드와 Dockerfile을 변경하지 않고**, 기존 이미지 태그가 가리키는 패치된 베이스 이미지를 받아 애플리케이션 이미지를 재빌드하는 방식으로 진행하였다.

패치 후 실행 환경에서 **PHP CLI 8.3.36**을 확인하였다.

PHP 버전을 확인할 수 있는 주요 위치는 다음과 같다.

| 확인 위치               | 확인할 내용                              |
| ----------------------- | ---------------------------------------- |
| `composer.json`         | 프로젝트의 PHP 버전 요구 조건            |
| `composer.lock`         | 잠긴 의존성 버전과 관련 플랫폼 요구 조건 |
| `Dockerfile`            | 이미지 빌드에 사용하는 PHP 베이스 이미지 |
| 컨테이너의 `php -v`     | 해당 컨테이너의 PHP CLI 버전             |
| 컨테이너의 `php-fpm -v` | 해당 컨테이너에 설치된 PHP-FPM 버전      |

**실제 운영 버전은 설정 파일만으로 단정하지 않고, 배포된 이미지와 실행 중인 컨테이너에서 확인해야 한다.**

## 2. PHP 공식 사이트에서 수정 버전 및 보안 이슈 확인

뉴스를 통해 문제를 인지한 뒤, 공식 자료를 기준으로 영향을 받는 버전과 수정 내역을 확인하였다.

[PHP 공식 보안 공지](https://www.php.net/archive/2026.php)에서 영향 범위와 버전 계열별 수정 릴리스를 확인하고, [PHP 8.3.36 변경 기록](https://www.php.net/ChangeLog-8.php#8.3.36)과 연결된 보안 권고를 살펴보았다.

이번에 확인한 취약점의 수정 버전은 다음과 같다.

| PHP 계열 | 취약점 수정 버전 |
| -------- | ---------------- |
| 8.2      | 8.2.35           |
| 8.3      | 8.3.36           |
| 8.4      | 8.4.27           |
| 8.5      | 8.5.12           |

관련 보안 권고는 다음과 같다.

| 취약점                                                                                    | 내용                                                                                           |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) | 메모리 부족 처리 중 내부 상태가 손상되어 원격 코드 실행으로 이어질 수 있는 문제                |
| [CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) | 요청 종료 후 남은 내부 상태가 해제된 메모리를 참조해 원격 코드 실행 등으로 이어질 수 있는 문제 |

PHP-FPM도 관련 공지의 영향 범위에 포함되어 있었다. 구체적인 공격 경로와 조건은 실행 방식 및 애플리케이션에 따라 다를 수 있다.

PHP 8.3.36 변경 기록에는 두 보안 권고에 대응하는 PHP Core 수정 내역이 기재되어 있었다.

이번에는 **PHP 8.3 계열을 유지하면서 해당 계열의 보안 수정 릴리스를 적용**하는 방향으로 대응하였다.

## 3. Dockerfile과 운영 컨테이너에서 PHP 버전 확인

Dockerfile에는 다음과 같이 PHP 베이스 이미지가 지정되어 있었다.

```dockerfile
FROM php:8.3-fpm-alpine
```

이미지 태그의 구성 요소는 다음과 같다.

| 구성 요소 | 의미                          |
| --------- | ----------------------------- |
| `php`     | PHP Docker Official Image     |
| `8.3`     | PHP 8.3 계열                  |
| `fpm`     | PHP-FPM 이미지 변형           |
| `alpine`  | Alpine Linux 기반 이미지 변형 |

이 설정은 PHP 8.3 계열 이미지를 사용한다는 의미다.

다만 **패치 번호와 이미지 다이제스트(digest)를 고정하지 않았으므로**, 실제 사용 중인 PHP 패치 버전은 실행 환경에서 확인해야 한다.

다음은 Kubernetes에서 실행 중인 PHP 컨테이너의 버전을 조회하는 명령이다.

```bash
kubectl exec -n "$NS" "$POD" -c "$CONTAINER" -- php -v
```

`NS`, `POD`, `CONTAINER`에는 각각 조회할 네임스페이스, Pod 이름, PHP 애플리케이션 컨테이너 이름을 지정한다. 이 명령은 상태 조회용이다.

패치 전 확인한 출력은 다음과 같다.

```text
PHP 8.3.35 (cli)
```

이를 통해 조회 대상 컨테이너의 **PHP CLI 버전이 8.3.35**임을 확인하였다.

## 4. 실제 패치: Dockerfile을 유지하고 이미지 재빌드

실제 작업에서는 **소스코드와 Dockerfile을 수정하지 않고**, 기존 설정을 유지한 상태에서 이미지를 다시 빌드하였다.

빌드 과정에서 기존 태그가 가리키는 패치된 PHP 베이스 이미지를 가져와 애플리케이션 이미지를 새로 생성하였다.

### 4.1 같은 이미지 태그로도 PHP 패치 버전이 달라질 수 있는 이유

Docker 이미지 태그는 이미지 배포자가 새로운 이미지 내용을 가리키도록 갱신할 수 있다.

따라서 `php:8.3-fpm-alpine`처럼 패치 번호를 지정하지 않은 태그를 사용하는 경우, 빌드 시 새 베이스 이미지를 가져오면 Dockerfile의 `FROM` 문을 수정하지 않아도 이미지에 포함된 PHP 패치 버전이 달라질 수 있다.

단, **재빌드만 하면 언제나 최신 이미지가 적용되는 것은 아니다.** 빌드 캐시와 베이스 이미지 가져오기 정책에 따라 이전 이미지가 재사용될 수 있으므로, 새 이미지를 가져왔는지와 빌드 결과의 실제 PHP 버전을 확인해야 한다.

## 5. 운영 반영 과정

이번 사례는 소스코드나 Dockerfile을 변경하지 않고, 새 베이스 이미지를 활용해 애플리케이션 이미지를 다시 생성하고 운영 환경에 반영한 작업이다.

이미지 저장소와 Kubernetes를 사용하는 환경의 일반적인 반영 흐름은 다음과 같다.

1. 패치된 PHP 베이스 이미지를 가져온다.
2. 이를 사용해 API·배치·관리 화면·워커 등 필요한 애플리케이션 이미지를 다시 빌드한다.
3. 생성한 이미지를 검증한다.
4. 이미지 저장소에 업로드한다.
5. Kubernetes 또는 Amazon EKS의 워크로드에 새 애플리케이션 이미지를 반영하고 Pod를 교체한다.
6. 실행 중인 각 PHP 환경의 버전과 서비스 동작을 확인한다.

**빌드 성공과 운영 반영 완료는 서로 다르다.** 빌드가 성공했다는 것은 결과 이미지가 만들어졌다는 의미이며, 운영 환경에 반영되었는지는 실행 중인 이미지와 PHP 버전을 별도로 확인해야 한다.

## 6. Kubernetes 반영 여부 확인

아래 명령어는 모두 상태 조회를 위한 예시다. 네임스페이스·Pod·컨테이너 이름은 확인하려는 환경에 맞게 변경한다.

### 6.1 현재 클러스터 컨텍스트 및 Pod 목록 확인

```bash
kubectl config current-context
kubectl get pods -n demo-prod -o wide
```

작업 중인 서버의 디렉터리와 Kubernetes 네임스페이스는 서로 다른 개념이다.

`kubectl`의 조회 대상은 선택된 클러스터 컨텍스트와 `-n` 옵션으로 지정한 네임스페이스에 따라 결정된다.

재배포 후 Pod 이름이 달라졌을 수 있으므로, 현재 목록에서 조회할 Pod를 다시 확인한다.

### 6.2 Pod의 컨테이너 이름과 이미지 확인

```bash
POD=demo-api-pod

kubectl get pod -n demo-prod "$POD" \
  -o jsonpath='{range .spec.containers[*]}{.name}{"\t"}{.image}{"\n"}{end}'
```

출력된 컨테이너 중 PHP가 설치된 애플리케이션 컨테이너를 선택한다.

### 6.3 PHP CLI 및 PHP-FPM 버전 확인

```bash
kubectl exec -n demo-prod "$POD" -c demo-api -- php -v
kubectl exec -n demo-prod "$POD" -c demo-api -- php-fpm -v
```

`demo-prod`, `demo-api-pod`, `demo-api`는 설명용 이름이며 실제 배포 환경의 값으로 바꿔야 한다.

## 7. 패치 후 PHP CLI 확인

운영 환경의 컨테이너에서 `php -v` 명령을 실행해 버전을 확인하였다.

```text
PHP 8.3.36 (cli)
```

패치 전 조회한 **8.3.35**에서 패치 후 **8.3.36**으로 PHP CLI 버전이 변경되었음을 확인하였다.

향후에는 Dockerfile을 직접 수정하는 방식이나 다른 배포 환경에서 PHP 보안 패치를 적용하는 방식도 조사해 정리할 예정이다.

## 8. 참고 자료

- [연합뉴스: PHP 보안 취약점 관련 기사](https://www.yna.co.kr/view/AKR20261021154600098)
- [PHP 공식 보안 공지](https://www.php.net/archive/2026.php)
- [PHP 8.3.36 변경 기록](https://www.php.net/ChangeLog-8.php#8.3.36)
- [PHP 보안 권고: CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [PHP 보안 권고: CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [Composer 버전 제약](https://getcomposer.org/doc/articles/versions.md)
- [Docker Official Images의 PHP 태그 목록](https://github.com/docker-library/official-images/blob/master/library/php)
- [Docker 빌드 옵션](https://docs.docker.com/reference/cli/docker/buildx/build/)
- [Docker 이미지 빌드 권장 사항](https://docs.docker.com/build/building/best-practices/)
- [kubectl exec](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/)
- [Kubernetes 네임스페이스](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [Ubuntu PHP 보안 공지 USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1)
