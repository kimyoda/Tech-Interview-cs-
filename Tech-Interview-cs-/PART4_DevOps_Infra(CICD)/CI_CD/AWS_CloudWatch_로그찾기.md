# CloudWatch Logs Insights로 장애 로그 찾기

![CloudWatch Logs Insights 쿼리 결과에서 주변 로그를 여는 화면](https://docs.aws.amazon.com/images/AmazonCloudWatch/latest/logs/images/surrounding-logs-button.png)

_CloudWatch Logs Insights 쿼리 결과 화면. [이미지 출처 · AWS 공식 문서](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_SurroundingLogs.html)_

도서 대출 서비스에 “반납 버튼을 눌렀는데 오류가 떴다”라는 문의가 들어왔다. 반납 처리가 처음부터 실패했는지, 이미 반납이 끝난 대출에 같은 요청이 다시 들어왔는지부터 구분한다. 여러 Pod의 앱 로그가 CloudWatch Logs에 수집된다면 같은 대출 ID로 검색해 요청 흐름을 시간순으로 볼 수 있다.

서비스명, 로그 그룹, 날짜, ID와 로그는 가상의 예시다.

## 1. 로그 그룹과 시간 범위 선택

CloudWatch 콘솔에서 **로그 → 로그 분석(Log Analytics)**으로 이동하고 쿼리 언어로 **Logs Insights QL**을 선택한다. 기존 콘솔 화면에서는 **로그 → Logs Insights**에서 조회할 수 있다. [AWS 공식 문서 · Log Analytics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/LogAnalytics.html)

1. 대상 AWS 계정과 리전을 확인한다. 운영과 개발 환경이 분리돼 있다면 로그인 역할도 확인한다.
2. 애플리케이션 로그 그룹을 선택한다. 예시 그룹은 `/example/library/prod/application`이다. 로그 그룹 안의 로그 스트림은 개별 로그 소스의 이벤트를 담는다. [AWS 공식 문서 · 로그 그룹과 로그 스트림](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)
3. 문의 시각이 **2026-09-17 16:42 KST**면 우선 **16:37~16:47 KST**로 좁힌다. 시간 선택기가 UTC로 설정돼 있다면 같은 날짜의 **07:37~07:47 UTC**를 입력한다.
4. 콘솔의 쿼리 범위에서 로그 그룹과 시간을 설정한 뒤 아래 쿼리를 입력한다. 화면 상단에 `SOURCE ... START=... END=...`가 표시되는 경우에도 콘솔에서 범위를 설정할 수 있다. AWS 문서의 `SOURCE` 명령 예제는 CLI 또는 API에서 조회 대상을 지정할 때 사용한다. [AWS 공식 문서 · SOURCE](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Source.html)

```text
fields @timestamp, @log, @logStream, @message
| limit any 1
```

`limit any 1`은 일치하는 이벤트 한 건을 찾으면 스캔을 끝낸다. 최신 이벤트가 필요하면 `sort @timestamp desc` 다음에 `limit 1`을 사용한다. `@message`는 수집된 원문, `@log`는 `계정 ID:로그 그룹 이름`, `@logStream`은 이벤트가 들어온 로그 스트림이다. [AWS 공식 문서 · limit](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html) · [시스템 필드](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

### 쿼리에 자주 나오는 명령어

| 명령어    | 역할                                                  |
| --------- | ----------------------------------------------------- |
| `fields`  | 사용할 필드를 선택하거나 계산한 필드에 별칭을 붙인다. |
| `filter`  | 조건에 맞는 이벤트를 남긴다.                          |
| `parse`   | 텍스트에서 ID 같은 값을 추출한다.                     |
| `sort`    | 시각이나 집계값을 기준으로 정렬한다.                  |
| `display` | 결과 표에 표시할 열을 고른다.                         |
| `stats`   | 이벤트를 묶어 개수나 합계 등을 계산한다.              |
| `limit`   | 반환 행 수를 제한한다.                                |

명령어는 파이프(`|`)로 연결한다. [AWS 공식 문서 · Logs Insights QL 문법](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)

### 조회에 필요한 IAM 권한

| 작업                       | 관련 권한                |
| -------------------------- | ------------------------ |
| 로그 그룹 목록 보기        | `logs:DescribeLogGroups` |
| 쿼리 실행                  | `logs:StartQuery`        |
| 쿼리 결과 조회             | `logs:GetQueryResults`   |
| 실행 중인 쿼리 중지        | `logs:StopQuery`         |
| 개별 로그 레코드 상세 조회 | `logs:GetLogRecord`      |

권한 오류가 발생하면 현재 역할과 해당 작업의 권한을 먼저 확인한다. 사용하는 콘솔 기능에 따라 추가 권한이 필요할 수 있다. [AWS 공식 문서 · CloudWatch Logs 권한](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/permissions-reference-cwl.html)

## 2. 텍스트 로그에서 경고와 요청 흐름 확인

아래 `@message` 예시는 앱이 기록한 시각과 메시지 뒤에 JSON 문맥이 붙은 텍스트 로그다.

```text
[2026-09-17 16:41:58] production.INFO: Return request received {"branch_id":42,"loan_id":"loan-demo-014","request_id":"req-demo-a"}
[2026-09-17 16:41:59] production.INFO: Return committed {"branch_id":42,"loan_id":"loan-demo-014","request_id":"req-demo-a"}
[2026-09-17 16:42:02] production.WARNING: Loan record missing {"branch_id":42,"loan_id":"loan-demo-021","request_id":"req-demo-c"}
[2026-09-17 16:42:04] production.WARNING: Return already in progress {"branch_id":42,"loan_id":"loan-demo-032","request_id":"req-demo-d"}
[2026-09-17 16:42:05] production.WARNING: Return already completed {"branch_id":42,"loan_id":"loan-demo-014","request_id":"req-demo-b"}
```

### 경고 문구와 지점 ID로 좁히기

`like`로 경고 문구 세 가지를 고른 뒤 `parse`로 지점 ID와 대출 ID를 추출한다. 아래 패턴은 지점 ID가 JSON에 정수로 기록된 경우를 대상으로 하며, 추출한 문자열을 `"42"`와 비교한다. [AWS 공식 문서 · filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html) · [parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html)

```text
filter @message like /production\.WARNING: (Loan record missing|Return already in progress|Return already completed)/
| parse @message /"branch_id"\s*:\s*(?<branch_id_text>[0-9]+)\s*[,}]/
| parse @message /"loan_id"\s*:\s*"(?<loan_id_text>[^"]+)"/
| filter branch_id_text = "42"
| sort @timestamp asc
| display @timestamp, @logStream, loan_id_text, @message
| limit 100
```

### 같은 대출의 요청을 시간순으로 확인

대출 ID를 알면 경고 조건을 빼고 다시 검색한다. 대출 ID로 여러 요청을 묶고 `request_id`로 개별 요청을 구분한다. 대출 ID가 지점 안에서만 유일하다면 지점 ID 조건도 적용한다.

```text
parse @message /"loan_id"\s*:\s*"(?<loan_id_text>[^"]+)"/
| filter loan_id_text = "loan-demo-014"
| parse @message /"request_id"\s*:\s*"(?<request_id_text>[^"]+)"/
| sort @timestamp asc
| display @timestamp, @logStream, request_id_text, @message
| limit 100
```

| 예시 시각(KST) | 요청 ID      | 이벤트                                |
| -------------- | ------------ | ------------------------------------- |
| 16:41:58       | `req-demo-a` | 반납 요청 접수                        |
| 16:41:59       | `req-demo-a` | 앱이 반납 완료를 기록                 |
| 16:42:05       | `req-demo-b` | 같은 대출에 이미 반납됐다는 경고 기록 |

- `sort @timestamp asc` 뒤에 `limit 100`을 쓰면 일치한 이벤트 중 시각이 이른 100건을 보여준다. 결과가 100건이면 시간 범위를 나눠 조회하거나 반환 한도를 조정한다. [AWS 공식 문서 · limit](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html)
- 콘솔에서 쿼리가 완료됐는지 확인한다. CLI나 API에서 `Running` 상태로 받은 결과는 부분 결과이므로, 최종 건수는 `Complete` 상태에서 확인한다. [AWS 공식 문서 · GetQueryResults](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_GetQueryResults.html)
- 여러 로그 그룹을 함께 조회할 때 결과 열에 `@log`를 추가해 출처를 구분한다. [AWS 공식 문서 · 시스템 필드](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

### 지점 ID나 대출 ID를 추출하지 못한 로그 찾기

`parse` 패턴과 일치하지 않은 이벤트도 다음 명령으로 넘어간다. 추출 필드가 없으면 뒤의 ID 조건을 통과하지 못할 수 있다. 아래 쿼리는 **지점 ID와 대출 ID 중 하나라도 추출되지 않은 경고**를 찾는다. [AWS 공식 문서 · parse](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Parse.html) · [ispresent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)

```text
filter @message like /production\.WARNING: (Loan record missing|Return already in progress|Return already completed)/
| parse @message /"branch_id"\s*:\s*(?<branch_id_text>[0-9]+)\s*[,}]/
| parse @message /"loan_id"\s*:\s*"(?<loan_id_text>[^"]+)"/
| filter not ispresent(branch_id_text) or not ispresent(loan_id_text)
| display @timestamp, @logStream, branch_id_text, loan_id_text, @message
| limit any 20
```

지점 ID가 `"branch_id":"42"`처럼 문자열로 저장됐다면 정수용 패턴은 값을 추출하지 못한다. 결과가 나오면 원문에서 키 이름, 따옴표, 수집기가 로그를 감싸는 형식을 확인한다.

## 3. JSON 로그를 필드로 검색

이벤트 전체가 JSON으로 기록되고 Standard 로그 그룹에서 필드가 자동 발견됐다면 `branch_id`와 `loan_id`를 직접 조회할 수 있다. 예시의 `branch_id`는 JSON 숫자이므로 `42`를 따옴표 없이 비교한다. [AWS 공식 문서 · 자동 발견 필드](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

```json
{
  "level": "WARN",
  "event": "return.already_completed",
  "branch_id": 42,
  "loan_id": "loan-demo-014",
  "request_id": "req-demo-b"
}
```

```text
fields @timestamp, @logStream, level, event, loan_id, request_id
| filter branch_id = 42 and loan_id = "loan-demo-014"
| sort @timestamp asc
| limit 100
```

### 수집기가 원본을 감싼 경우

아래 예시의 `log` 값은 **JSON이 들어 있는 문자열**이다. `jsonParse(log)`로 변환한 뒤 `entry.loan_id`처럼 필드에 접근한다. [AWS 공식 문서 · jsonParse와 구조 타입](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)

```json
{
  "log": "{\"level\":\"WARN\",\"event\":\"return.already_completed\",\"branch_id\":42,\"loan_id\":\"loan-demo-014\",\"request_id\":\"req-demo-b\"}"
}
```

```text
fields jsonParse(log) as entry
| filter entry.branch_id = 42 and entry.loan_id = "loan-demo-014"
| sort @timestamp asc
| display @timestamp, @logStream, entry.level, entry.event, entry.request_id
| limit 100
```

| `log` 값 형식 | 방법                                                     |
| ------------- | -------------------------------------------------------- |
| JSON 문자열   | `jsonParse(log)`로 변환한 뒤 `entry.loan_id`로 접근한다. |
| JSON 객체     | 자동 발견된 `log.loan_id`를 직접 조회한다.               |
| 텍스트        | `parse log /.../`로 값을 추출한다.                       |

## 4. 경고 로그 집계

구조화된 JSON 로그를 5분 구간과 경고 이벤트 유형으로 묶을 수 있다. 5분 구간은 `bin(5m)`으로 지정한다. 초 단위 인수의 상한이 60이므로 `bin(300s)`는 60초 구간으로 계산된다. [AWS 공식 문서 · stats](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html) · [시간 함수의 단위 제한](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)

```text
filter branch_id = 42 and level = "WARN"
| filter event in ["return.loan_missing", "return.in_progress", "return.already_completed"]
| stats count(*) as warning_count by bin(5m), event
```

텍스트 로그에서 대출별 경고 횟수를 보려면 대출 ID를 추출한 뒤 집계한다.

```text
filter @message like /production\.WARNING: (Loan record missing|Return already in progress|Return already completed)/
| parse @message /"branch_id"\s*:\s*(?<branch_id_text>[0-9]+)\s*[,}]/
| parse @message /"loan_id"\s*:\s*"(?<loan_id_text>[^"]+)"/
| filter branch_id_text = "42" and ispresent(loan_id_text)
| stats count(*) as warning_count by loan_id_text
| sort warning_count desc
| limit 20
```

`count(*)`는 경고가 기록된 횟수를 센다. 같은 대출의 경고가 여러 번 찍히면 각각 집계된다. 서로 다른 대출 수는 `countDistinct(loan_id_text)`로 계산할 수 있으며, 고유 값이 많으면 근삿값이 나올 수 있다. `stats` 뒤에는 집계 결과에 남긴 필드로 정렬한다. [AWS 공식 문서 · stats 집계 함수](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Stats.html)

## 5. 결과가 0건일 때 확인 순서

완료된 쿼리에서 **스캔한 이벤트가 있는데 일치가 0건**이면 같은 범위에서 조건을 제거하고 원문부터 확인한다. **스캔한 이벤트가 0건**이면 조회 범위와 로그 수집 여부부터 확인한다. `stats`나 `limit` 때문에 반환 행 수는 조건에 일치한 이벤트 수와 다를 수 있다. [AWS 공식 문서 · 쿼리 통계](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_QueryStatistics.html)

1. **원문을 한 줄 확인한다.** 1절의 샘플 쿼리로 이벤트가 보이면 실제 경고 문구와 필드 이름을 확인한 뒤 조건을 하나씩 다시 붙인다. `WARN`과 `WARNING`, `loan_id`와 `loanId`, 숫자 `42`와 문자열 `"42"`를 확인한다. [AWS 공식 문서 · 정규식과 함수](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-operations-functions.html)
2. **조회 범위와 보존 기간을 확인한다.** AWS 계정, 리전, 로그 그룹, KST와 UTC 변환을 점검한다. 계정 수준 보존 정책이 대상 로그 그룹에 적용되면 그 정책의 보존 기간이 그룹별 설정보다 우선한다. [AWS 공식 문서 · 보존 정책](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutRetentionPolicy.html)
3. **기록과 수집 경로를 확인한다.** 경고는 있는데 성공 로그가 없으면 앱이 해당 환경에서 `INFO`를 기록하는지 확인한다. Pod 파일에는 로그가 있는데 CloudWatch에 없다면 수집기의 입력 경로, 제외 조건, 전송 대상 로그 그룹을 대조한다. 앱이 컨테이너 표준 출력 외의 별도 파일에 기록한다면 그 파일의 수집 여부도 확인한다. [AWS 공식 문서 · Fluent Bit 로그 수집](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-logs-FluentBit.html)
4. **여러 줄 로그는 주변 이벤트를 조회한다.** 스택 트레이스가 여러 이벤트로 나뉘고 일부 줄에 ID가 없으면 해당 스트림에서 앞뒤 시각의 로그를 조회한다. 예외 메시지와 스택 트레이스를 한 이벤트로 모으는 환경이라면 수집기의 multiline 설정도 확인한다. [AWS 공식 문서 · 주변 로그 조회](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_SurroundingLogs.html) · [Fluent Bit 여러 줄 로그](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-logs-FluentBit.html)

### 이벤트 시각과 수신 시각 비교

```text
fields @timestamp, @ingestionTime, @logStream, @message
| sort @timestamp desc
| limit 20
```

`@timestamp`는 이벤트에 지정된 시각이고 `@ingestionTime`은 CloudWatch Logs가 이벤트를 수신한 시각이다. 원문에 기록된 시각과 이벤트 시각이 다르면 조회 범위를 넓혀 확인한다. 아직 수집 중인 로그는 잠시 뒤 같은 절대 시간 범위로 다시 조회한다. [AWS 공식 문서 · 시각 필드 정의](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html)

## 6. 스캔량과 인덱스 적용 범위 확인

Logs Insights 쿼리 요금은 스캔한 데이터양에 따라 달라진다. 필요한 로그 그룹과 시간만 선택하고 실행 전에 예상 스캔 바이트가 표시되면 확인한다. 일반 `limit 100`은 반환 행 수를 제한하므로 값을 줄여도 스캔량은 그대로다. [AWS 공식 문서 · CloudWatch 요금](https://aws.amazon.com/cloudwatch/pricing/) · [예상 스캔 바이트](https://aws.amazon.com/about-aws/whats-new/2026/09/cloudwatch-logs-estimate-bytes-scanned/) · [limit](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Limit.html)

| 조건                                    | 스캔 및 조회 범위                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filter loan_id = "loan-demo-014"`      | `loan_id` 인덱스가 있는 범위에서 스캔을 줄일 수 있다. 인덱스가 없는 로그 그룹도 조회 대상에 포함된다.                                                |
| `filter @message like /.../`            | `like` 조건에는 필드 인덱스가 적용되지 않는다.                                                                                                       |
| `filter loan_id_text = "loan-demo-014"` | `parse`로 만든 별칭에 적용하는 조건이다.                                                                                                             |
| `filterIndex loan_id = "loan-demo-014"` | 해당 필드 인덱스가 있는 로그 그룹과 이벤트로 조회 범위를 좁힌다. 인덱스 생성 전 데이터나 인덱스가 없는 그룹까지 확인하려면 일반 `filter`를 사용한다. |

사용자 정의 인덱스는 정책 생성 이후 **수집된** 이벤트에 적용된다. 각 이벤트의 인덱스는 수집 시점부터 30일간 유지되며, 이 기간은 로그 보존 기간과 별개다. 인덱스 필드 이름은 대소문자를 구분한다. [AWS 공식 문서 · filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-Filter.html) · [filterIndex](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax-FilterIndex.html) · [필드 인덱스](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogs-Field-Indexing.html)

실행 중인 쿼리는 콘솔 페이지를 닫아도 계속 실행될 수 있다. 조회가 필요 없어지면 쿼리를 중지한다. [AWS 공식 문서 · 조회 비용 관리](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)

조사 기록에는 **AWS 계정, 리전, 로그 그룹, 시간대를 포함한 절대 시간 범위, 사용한 쿼리**를 남긴다. 다시 조회할 때도 문의가 들어왔던 시간대를 그대로 지정할 수 있다.
