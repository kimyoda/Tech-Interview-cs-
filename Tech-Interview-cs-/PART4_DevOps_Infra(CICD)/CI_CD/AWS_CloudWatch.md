# AWS_CloudWatch

![Amazon CloudWatch 콘솔의 알람 상태와 지표 그래프](https://docs.aws.amazon.com/images/AmazonCloudWatch/latest/monitoring/images/CW-default-dashboard-update.png)

_Amazon CloudWatch 콘솔 개요 화면. [이미지 출처 · AWS 공식 문서](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/GettingStarted.html)_

## Amazon CloudWatch

**Amazon CloudWatch는 AWS 리소스와 애플리케이션의 동작 상태를 모니터링하는 서비스다.** 서버 자원 사용량과 API 응답 상태를 수치로 확인하고, 조건에 맞으면 알림을 보내고, 개별 요청에 어떤 일이 있었는지 로그로 조사할 수 있다. **관측성(Observability)**은 지표와 로그 같은 외부 신호로 시스템 내부 상태를 파악할 수 있는 정도를 말한다. [AWS 공식 문서 · Amazon CloudWatch란?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

| 구성                     | 무엇을 확인하나                      | 도서 대출 서비스 예시                                            |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------- |
| **지표(Metrics)**        | 시간에 따라 변하는 수치              | 5분 동안 반납 API에서 HTTP 5xx 응답이 몇 건 발생했는지 확인한다. |
| **알람(Alarms)**         | 지표가 설정한 조건에 도달했는지 여부 | 5xx 건수가 임계값을 넘으면 Amazon SNS로 운영 알림을 보낸다.      |
| **대시보드(Dashboards)** | 한 화면에서 지표 추이와 알람 상태    | 반납 API의 오류 건수와 응답 시간 추이를 함께 본다.               |
| **로그(Logs)**           | 특정 시각에 기록된 이벤트            | 대출 ID와 요청 ID로 반납 처리 기록과 경고 메시지를 찾는다.       |

지표를 보면 **언제 오류가 늘었는지** 범위를 좁힐 수 있다. 그 시간대의 로그를 조회하면 **어떤 요청에서 어떤 경고가 발생했는지** 확인할 수 있다. 위 지표와 알람은 필요한 수치를 수집하고 알림 조건을 구성한 경우의 예시다. [AWS 공식 문서 · 지표](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) · [알람](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html) · [대시보드](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)

### CloudWatch Logs와 Logs Insights의 차이

| 이름                         | 역할                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Amazon CloudWatch**        | 지표, 알람, 대시보드, 로그 등을 제공하는 모니터링 서비스다.                                             |
| **CloudWatch Logs**          | AWS 리소스나 애플리케이션에서 전송한 로그를 수집하고 저장한다.                                          |
| **CloudWatch Logs Insights** | 저장된 로그에 쿼리를 실행해 검색, 필터링, 집계한다.                                                     |
| **Log Analytics(로그 분석)** | Logs Insights, Live Tail, Contributor Insights를 한곳에서 사용할 수 있는 CloudWatch Logs 콘솔 화면이다. |
| **Live Tail**                | CloudWatch Logs에 들어오는 이벤트를 실시간에 가깝게 보여준다.                                           |

**이미 발생한 반납 요청**을 조사할 때는 Logs Insights에서 발생 시간대를 지정해 조회한다. 장애를 재현하면서 **지금 들어오는 로그**를 보고 싶으면 Live Tail을 사용한다. [AWS 공식 문서 · CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) · [Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html) · [Log Analytics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/LogAnalytics.html)

### 앱 로그가 검색되기까지

CloudWatch Logs는 수집된 로그를 **로그 그룹 → 로그 스트림 → 로그 이벤트** 구조로 저장한다. 콘솔에서 로그 그룹으로 검색 범위를 고르고, 결과에서 로그 스트림을 보고 이벤트의 출처를 확인한다. [AWS 공식 문서 · CloudWatch Logs 기본 개념](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

| 단위                        | 의미                                                   | 도서 대출 서비스 예시                               |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| **로그 그룹(Log Group)**    | 보존 기간 같은 관리 설정을 공유하는 로그 스트림의 묶음 | `/example/library/prod/application`                 |
| **로그 스트림(Log Stream)** | 같은 소스에서 들어온 로그 이벤트의 연속                | 수집기가 Pod별로 나눈 `loan-api-01`과 `loan-api-02` |
| **로그 이벤트(Log Event)**  | 타임스탬프와 메시지를 가진 개별 기록                   | `Return already completed` 경고 한 건               |

예를 들어 EKS에서 앱이 컨테이너 표준 출력에 로그를 남기면 Fluent Bit 같은 수집기가 컨테이너 로그를 읽어 지정된 CloudWatch 로그 그룹으로 전송할 수 있다. 스트림 이름과 수집 경로는 수집기 설정에 따라 달라진다. 앱이 Pod 내부의 별도 파일에 기록한다면 해당 파일이 수집 대상에 포함되어야 Logs Insights에서 조회할 수 있다. [AWS 공식 문서 · EKS의 Fluent Bit 로그 수집](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-logs-FluentBit.html)
