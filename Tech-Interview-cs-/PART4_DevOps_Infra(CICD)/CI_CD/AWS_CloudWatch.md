# AWS_CloudWatch

## Amazon CloudWatch

**Amazon CloudWatch는 AWS 리소스와 앱 동작 상태를 모니터링하는 서비스다** 서버자원 사용량과 API 응답 상태를 수치로 확인, 조건에 맞으면 알림을 보내고, 개별 요청에 어떤 일이 있었는지 로그로 조사할 수 있음. 수집한 데이터로 시스템 내부 상태를 파악하는 것을 **관측성(Observability)**라고 한다.
[AWS 공식 문서 · Amazon CloudWatch란?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

| 구성                     | 확인                                  | 도서 대출 서비스 예시                                       |
| ------------------------ | ------------------------------------- | ----------------------------------------------------------- |
| **지표(Metrics)**        | 시간에 따라 변하는 수치               | 5분 동안 반납 API에서 HTTP 5xx 응답이 몇 건 발생했는지 확인 |
| **알람(Alarms)**         | 설정한 조건에 도달했는 지 여부        | 5xx 건수가 임계값을 넘으면 Amazon SNS로 운영 알림을 보낸다  |
| **대시보드(Dashboards)** | 지표와 알람 상태를 한 화면에 표시     | 반납에 API 오류 건수와 응답 시간의 추이를 함께 본다         |
| **로그(Logs)**           | 특정 시각에 어떤 이벤트가 기록됐는 지 | 대출 ID와 요청 ID로 반납 처리 기록과 경고 메세지를 찾음     |

예를 들어 지표를 보면 **언제 오류가 늘었는지** 범위를 좁힐 수 있음. 그 시간의 로그를 열면 **어떤 요청에 어떤 경고가 발생했는지** 확인할 수 있음. 위의 지표와 알람은 해당 서비스가 필요한 수치를 수집하고 알림 조건을 구성한 경우의 예시

[AWS 공식 문서 · 지표](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) · [알람](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html) · [대시보드](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)

### CloudWatch Logs와 Logs Insights의 차이

| 이름                         | 역할                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| **Amazon CloudWatch**        | 지표, 알람, 대시보드, 로그 등을 제공하는 모니터링 서비스 전체      |
| **CloudWatch Logs**          | AWS 리소스나 앱에서 전송한 로그를 받아 저장하는 기능               |
| **Amazon Logs Insights**     | 지표, 알람, 대시보드, 로그 등을 제공하는 모니터링 서비스 전체      |
| **Log Analytics(로그 분석)** | 수집된 로그에 쿼리를 실행해 검색, 필터링, 집계하는 기능            |
| **Live Tail**                | 지금 CloudWatch Logs에 들어오는 이벤트를 실시간에 가깝게 보는 기능 |

**이미 발생한 반납 요청**을 조사하여 Logs Insights에 발생 시각을 지정해 조회한다. 장애를 재현하면서 **지금 들어오는 로그**를 보고 싶으면 Live Tail을 쓸 수 있음
[AWS 공식 문서 · CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) · [Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html) · [Log Analytics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/LogAnalytics.html)

### 앱 로그가 검색되기까지

CloudWatch Logs는 수집된 로그를 **로그 그룹 -> 로그 스트림 -> 로그 이벤트** 구조로 저장.
콘솔에서 그룹으로 검색 범위를 고르고, 결과에서 스트림으로 이벤트의 출처를 확인.

[AWS 공식 문서 · CloudWatch Logs 기본 개념](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

| 단위                        | 의미                                                     | 도서 대출 서비스 예시                               |
| --------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| **로그 그룹(Log Group)**    | 보존 기간 같은 관ㄹ ㅣ설정을 공유하는 로그 스트림의 묶음 | `/example/library/prod/application`                 |
| **로그 스트림(Log Stream)** | 같은 소스에서 들어온 로그 이벤트의 연속                  | 수집기가 Pod별로 나눈 'loan-api-01`과 `loan-api-02` |
| **로그 이벤트(Log Event)**  | 타임스탬프와 원문 메시지를 가진 개별 기록                | `Return already completed` 경고 한 건               |

예를 들어 EKS에서 앱이 컨테이너 표준 출력에 로그를 나기면, Fluent Bit같은 수집기가 컨테이너 로그를 읽어 지정된 CloudWatch 로그 그룹으로 전송할 수 있음. 스트림 이름과 수집경로는 수집기 설정에 따라 달라진다. 앱이 Pod내부의 별도 파일에만 기록하면, 그 파일이 수집 대상에 포함되어야 Logs Insights에 조회할 수 있음
[AWS 공식 문서 · EKS의 Fluent Bit 로그 수집](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-logs-FluentBit.html)
