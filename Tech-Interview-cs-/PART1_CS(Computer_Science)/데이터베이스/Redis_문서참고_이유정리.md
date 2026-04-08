## Redis 기본, 공식문서 참고, 랭킹 구현

### 1. Redis란?

> REmote DIctionary Server의 약자.
> 이탈리아 개발자가 MySQL 성능 한계를 느끼고 직접 만든 오픈소스 데이터베이스

| 특징          | 설명                                                         |
| ------------- | ------------------------------------------------------------ |
| 저장위치      | 디스크가 아닌 **메모리(RAM)** 에 데이터를 저장               |
| 속도          | 초당 약 5만 - 25만 회 명령 처리 (서버 사정에 따라 다름)      |
| 자료구조      | String, List, Set, Sorted Set, Hash, Stream 등 다양하게 제공 |
| 데이터 보존   | RDB(스냅샷), AOF(로그) 두 가지 방식으로 디스크 저장 가능     |
| 복제          | Master -> Replica 실시간 복제로 장애 대비                    |
| 단일 프로세스 | 평상 시 CPU 1코어만 사용 (단순, 고성능 구조)                 |
| DB 엔진 랭킹  | 전 세계 DB 엔진 기준 Top 10 / Key-Value Store 부문           |

---

### 2. Redis를 쓰는 이유

```
일반 DB(MySQL 등):
 요청 -> 디스크에서 읽기 -> 응답 <- 수십 ~ 수백 ms

 Redis:
  요청 -> RAM에서 읽기 -> 응답 <- 수백 us(마이크로초)

속도 차이: 약 100배 ~ 1000배
```

---

### 2. 핵심 용어 정리

#### 기본 구조 용어

| 용어        | 의미                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| **Key**     | 데이터를 구분하는 고유한 이름. 문자열이고 최대 512MB. 예 `rank:daily:3:20250325` |
| **Value**   | Key에 저장된 데이터, 자료구조에 따라 형태가 다름                                 |
| **Member**  | Sorted Set, Set안의 개별 항목. 예: uiserId                                       |
| **Score**   | Sorted Set에서 Member에 부여하는 **숫자 가중치** (정렬 기준)                     |
| **Field**   | Hash 안의 항목 이름. 예: `nickname`, `avata_url`                                 |
| **TTL**     | Time To Live. 키의 만료 시간(초) 설정하면 자동 삭제된다                          |
| **Expire**  | TTL 설정 명령어. 시간이 지나면 키 자동 삭제                                      |
| **Persist** | TTL을 제거하여 키를 영구 보존 상태로 전환                                        |

#### 성능 관련 용어

| 용어          | 의미                                                             |
| ------------- | ---------------------------------------------------------------- |
| **O(1)**      | 데이터 개수와 상관없이 항상 일정한 속도. 가장 빠르다             |
| **O(log N)**  | 데이터가 많아질수록 아주 조금씩 느려진다. 실용적으로 매우 빠르다 |
| **O(N)**      | 데이터 개수에 비례해서 느려진다. 대용량에서 주의가 필요하다      |
| **In-Memory** | 데이터를 메모리(RAM)에 올려 처리하는 방식                        |
| **Pipelin**   | 여러 명령을 묶어 한 번에 전송해 네트워크 왕복 비용 절감          |

### 데이터 보존 관련 용어

| 용어         | 의미                                                            |
| ------------ | --------------------------------------------------------------- |
| **RDB**      | 일정 추가마다 메모리 전체를 디스크에 스냅샷 저장                |
| **AOF**      | 모든 쓰기 명령을 로그 파일에 기록. 더 안전하나 파일 크기가 크다 |
| **Master**   | 쓰기 / 읽기를 담당하는 주 서버                                  |
| **Replia**   | Master를 실시간 복제하는 복제 서버                              |
| **Sentinel** | Master 장애 감지 및 자동 failover 담당                          |
| **Cluster**  | 여러 Redis 노드에 데이터를 분산 저장하는 구조                   |

### Key 네이밍 컨벤션

```
# 클론(:)으로 계층 구분 - 가장 일반적인 방식
타입:도메인:식별자

예시:
rank:daily:3:20250325  -> 미니게임3의 2025-03-25 일간 랭킹
rank:season:3:55 -> 미니게임3의 시즌 5 랭킹
user:info:1001 -> userId 1001번의 정보 캐시
game:session:abc-xyz-123 -> 게임 세션 중복 방지 키
```

---

### 3. Redis 5대 데이터 타입 한눈에 보기

```
┌─────────────────────────────────────────────────────────────┐
│                   Redis 데이터 타입                          │
├──────────────┬──────────────────────────────────────────────┤
│   Strings    │ "hello", "1000", "true"                      │
│              │ 가장 기본. 캐시·카운터·세션 등               │
├──────────────┼──────────────────────────────────────────────┤
│   Lists      │ ["A", "B", "C"]  (순서 있는 리스트)          │
│              │ 큐, 스택, 로그, 최근 활동 목록               │
├──────────────┼──────────────────────────────────────────────┤
│   Sets       │ {"A", "B", "C"}  (중복 없는 집합)            │
│              │ 팔로우 목록, 좋아요, 태그                     │
├──────────────┼──────────────────────────────────────────────┤
│ Sorted Sets  │ {"A":100, "B":95, "C":80}  (점수 정렬 집합)  │
│   (ZSets)    │ ⭐ 랭킹 구현에 최적화                        │
├──────────────┼──────────────────────────────────────────────┤
│   Hashes     │ {field: value, field: value}  (객체 형태)    │
│              │ 유저 정보 캐시, 설정값 저장                   │
└──────────────┴──────────────────────────────────────────────┘
```

---

### 4. String (Key-Value) - Redis 기본 개념

### 개념

String은 Redis에서 **기본이 되는 자료구조**이다.
String이나, 실제로는 **문자열 / 정수 / 바이너리 데이터** 모두 저장할 수 있다.

Redis의 모든 데이터는 결국 **Key-Value 쌍**으로 저장한다.
다른 자료구조(ZSET, Hash 등) 도 Key는 String이고, Value만 구조가 달라지는 것이다.

```
# Key-Value의 기본구조

    Key              Value
─────────────────────────────────────
"user:token:1001"  →  "eyJhbGci..."     ← 인증 토큰
"game:count:1001"  →  "42"              ← 숫자 (카운터)
"cache:ranking"    →  "{...json...}"    ← JSON 문자열
"lock:payment"     →  "1"              ← 분산 락
```

### Key-Value 핵심

| 특성        | 내용                                      |
| ----------- | ----------------------------------------- |
| Key 타입    | 항상 **문자열**                           |
| Value 타입  | 문자열 / 정수 / 부동소수점 / 바이너리     |
| 최대 크기   | Key, Value 모두 최대 **512MB**            |
| 시간 복잡도 | SET, GET 모두 **O(1)** - 항상 일정한 속도 |
| TTL 설명    | 키마다 만료 시간 개별 설정 가능           |

---

### SET / GET - 기본 명령어

```bash
# SET - Key에 Value 저장
# 시간복잡도: O(1)
SET Key value [EX seconds] [PX milliseconds] [NX | XX]

SET user:token:1001 "example"
SET cache:page:home "<html>...</html>"
SET game:scroe:1001 "99880"

# 옵션:
# EX 초 -> TTL을 초 단위로 설정
# PX 밀리초 -> TTL을 밀리초 단위로 설정
# NX -> 키가 없을때만 저장 (Not eXists) <- 분산 락
# XX -> 키가 있을 때만 저장 (eXists)

# EX와 함께 - 저장하면서 동시에 TTL 설정
SET user:token:1001 "exygm..." EX 3600
SET game:session:abc "1" EX 300

# NX - 없을때만 저장 (있으면 무시)
SET lock:payment "1" NX EX 10

# GET - Key의 Value의 조회
# 시간복잡도: O(1)
GET key

GET user:token:1001
# 반환: "example..."

GET no:exist:key
# 반환: (nil) <- 없는 키는 nil 반환

# MSET / MGET - 여러 Key를 한 번에 저장/조회
MSET key1 value1 key2 value2 key3 value3
MSET user:name:1001 "홍길동" user:name:1005 "김철수" user:nmae:1003 "이영희"

MGET key1 key2 key3
MGET user:name:1001 user:name:1005 user:name:1003

# 반환:
# 1) "홍길동"
# 2) "김철수"
# 3) "이영희"

# DEL - Key 삭제
# 시간복잡도: O(N) N = 삭제할 키 수
DEL Key [Key...]
DEL user:token:1001
DEL user:token:1001 user:token:1005 # 여러 개 동시 삭제

# EXISTS - Key 존재 여부 확인
# 시간복잡도: O(1)
EXISTS key
EXISTS user:token:1001
# 반혼: 1 (있음) / 0 (없음)
```

---

### EXPIRE/TTL 만료 시간처리

- TTL(Time To Live)는 Redis에서 **데이터를 자동으로 삭제**하는 기능이다.
- 세션, 캐시, 임시토큰처럼 일정 시간 후 필요 없는 데이터에 반드시 설정해야 한다.

```bash
# EXPIRE - 이미 있는 Key에 TTL 설정(초 단위)
# 시간복잡도: O(1)
EXPIRE key seconds

SET user:token:1001 "example..."
EXPIRE user:token:1001 3600 # 1시간 자동 삭제

# PEXPIRE - 밀리초 단위 TTL 설정
PEXPIRE key milliseconds
PEXPIRE user:token:1001 36000000 # 1시간 (밀리초))

# EXPIREAT - 특정 Unix 타임스탬프에 만료 (자정 마감 유용)
EXPIREAT key timestamp
EXPIREAT rank:daily:3:20250325 1743004977 # 특정 시각에 정확히 만료

# TTL - 남은 만료 시간 확인 (초 단위 반환)
# 시간복잡도: O(1)
TTL key

TTL user:token:1001
# 반환:
# 3542 -> 남은 시간 (초)
# -1 -> TTL 없음 (영구 보존)
# -2 -> 키 자체가 없음

# PTTL - 밀리초 단위 반환
PTTL user:token:1001

# PERSIST - TTL 제거 (영구 보존으로 전환)
PERSIST key
PERSIST user:token:1001 # TTL 제거 -> 영구 보존
```

TTL 설정 패턴 정리

```
만료 방식              명령어 조합                  사용 사례
──────────────────────────────────────────────────────────────
저장하면서 동시에 TTL   SET key value EX 초          세션·토큰·캐시
저장 후 나중에 TTL      SET + EXPIRE                 조건부 만료
특정 시각에 만료        SET + EXPIREAT               일간 랭킹 자정 마감
TTL 없이 영구 보존      SET (옵션 없음)               설정값·고정 데이터
영구 → 만료로 전환      EXPIRE                       동적 만료 처리
만료 → 영구로 전환      PERSIST                      만료 취소
```

---

### 자주 쓰는 실전 패턴

패턴 1 - 캐시 (Cache)

```bash
# DB 조회 결과를 Redis에 캐시 -> 동일 요청은 Redis에 즉시 응답
SET cache:user:1001 '{"id":1001, "name":"홍길동"}' EX 300   # 5분 캐시

GET cache:user:1001
# 있으면 -> Redis 값 바로 반환 (DB 조회 없음)
# 없으면 -> DB 조회 후 다시 캐싱
```

---

패턴 2 - 세션(Session)

```bash
#로그인 시 세션 토큰 저장
SET session:abc123xyz "1001" EX 7200

# 요청마다 세션 확인
GET session:abc123xyz
# 반환: "1001" + 로그인된 userId

# 세션 갱신 (활동할 때마다 TTL 연장)
EXPIRE session:abc123xyz 7200

# 로그아웃
DEL session:abc123xyz
```

---

패턴 3 - 중복 제출 방지 (NX 활용)

```bash
# NX: 키가 없을 때만 저장 -> 있으면 실패
# 게임 세션 중복 제출 방지에 활용
SET game:session:abc-xyz-123 "1" NX EX 3600
# 반환 OK -> 최초 제출 (처리 진행)
# 반환: (nil) -> 이미 존재 (중복 제출 차단))
```

---

### String 명령어

| 명령어                    | 용도                         | 복잡도 |
| ------------------------- | ---------------------------- | ------ |
| `SET key value`           | 값 저장                      | O(1)   |
| `SET key value EX 초`     | 저장 + 만료 동시 설정        | O(1)   |
| `SET key value NX`        | 없을때만 저장 (중복방지, 락) | O(1)   |
| `GET key`                 | 값 조회                      | O(1)   |
| `MSET` / `MGET`           | 여러 키 동시 저장 / 조회     | O(N)   |
| `DEL key`                 | 키 삭제                      | O(1)   |
| `EXISTS key`              | 키 존재 여부                 | O(1)   |
| `EXPIRE key 초`           | TTL 설정                     | O(1)   |
| `EXPIREAT key 타임스탬프` | 특정 시간에 만료             | O(1)   |
| `TTL key`                 | 남은 만료 시간 확인          | O(1)   |
| `PESIST key`              | TTL 제거 (영구보존)          | O(1)   |

---

### 5. ZSET(Sorted Set)

Sorted Set은 **Set(집합)에 Score(점수)를 추가한 자료구조**다.
내부적으로 SkipList + Hash Table 두가지 구조를 함께 사용한다.

- SkipList: 점수 순 정렬 유지 -> 범위 조회에 빠르다
- Hash Table: 멤버로 점수 바로 조회 -> O(1)

```bash
# ZSET의 구조
kEY: "rank:daily:3:20250325"

Score    Member(userId)
─────────────────────────
 99800      "1001"      ← 1위
 98500      "1005"      ← 2위
 97000      "1003"      ← 3위
 85000      "1009"      ← 4위
```

### 핵심 특성

| 특성             | 내용                                            |
| ---------------- | ----------------------------------------------- |
| 자동 정렬        | Score 기준으로 항상 오름차순 정렬 유지          |
| 중복 Member 불가 | 같은 Member를 두 번 추가하면 Score만 업데이트   |
| Score 범위       | 64-bit 부동소수점 (소수점 사용 가능)            |
| 시간 복잡도      | ZADD: O(log N) / ZRANK: O(log N) / ZSCORE: O(1) |
| 최대 Member 수   | 2^32 -1 개 (약 42억개)                          |

### ZSET 주요 명령어

#### 쓰기 명령어

```bash
# ZADD - Member 추가 및 Score 갱신
# 시간복잡도: O(log N)
ZADD key score member [score member ...]

# 옵션:
# NX - 새 멤버만 추가 (기존 멤버 갱신 안함)
# XX - 기존 멤버만 갱신 (새 멤버 추가 안함)
# GT - 기존보다 높을 때만 갱신 -> 최고점수형 랭킹에 사용
# LT - 기존보다 낮을 때만 갱신
ZADD rank:daily GT 100000 "1001" #최고 점수형

# ZINCRBY - Score 누적 증가 (누적 점수형 랭킹)
# 시간복잡도: O(log N)
ZINCRBY rank:season 500 "1001" # 1001번 유저 -> 500점

# ZREVRANK - 높은 Score 기준 순위 (0-based, 1위 = 0) <- 랭킹에서 주로 사용
# 시간복잡도: O(log N)
ZREVRANK rank:daily "1001"
# 결과: O (1위)

# ZCARD - 전체 Member 수
# 시간복잡도: O(1)
ZCARD rank:daily

# ZCOUNT - Score 범위 내 Member 수
# 시간복잡도: O(log N)
ZCOUNT rank:daily 90000 99999 # 900000- 999999점 사이 인원 수
ZCOUNT rank:daily -inf -inf # 전체 인원 수

# ZRANGE - 범위 조회 (Redis 6.2에서 통합 명령어)
# 시간복잡도: O(log N + M)
ZRANGE rank:daily 0 9 REV WITHSCORES # 상위 10명 + 점수 포함
ZRANGE rank:daily 0 -1 # 전체 오름차순
ZRANGE rank:daily 0 49 REV # 상위 50명

# ZREVRANGE - 높은 Score로부터 조회 (deprecated)
ZREVRANGE rank:daily 0 9 WITHSCORES

# ZRANGEBYSCORE - Score 범위로 조회 (deprecated)
ZRANGEBYSCORE = rank:daily 900000 +inf WITHSCORES

# ZREM - Member 삭제
# 시간복잡도: O(log N)
ZREM rank:daily "1001"

# ZREMRANGEBYRANK - 순위 범위로 삭제
ZREMRANGEBYRANK rank:daily 0 -101 # 101위 이하 전부 삭제

# 집합 연산
ZUNIONSTORE result 2 rank:game1 rank:game2 # 합집합
ZINTERSTORE result 2 rank:game1 rank:game2 # 교집합
```

---

### Sorted Sets 명령어 요약

| 명령어                  | 용도                           | 복잡도       |
| ----------------------- | ------------------------------ | ------------ |
| `ZADD`                  | Score + Member 추가/갱신       | O(log N)     |
| `ZADD GT`               | 최고 점수만 갱신               | O(log N)     |
| `ZINCRBY`               | Score 누적 증가                | O(log N)     |
| `ZSCORE`                | 특정 Member의 Score 조회       | O(1)         |
| `ZREVRANK`              | 높은 Score 기준 순위 (1위 = 0) | O(log N)     |
| `ZCARD`                 | 전체 Member 수                 | O(1)         |
| `ZCOUNT`                | Score 범위 내 인원 수          | O(log N)     |
| `ZRANGE REV WITHSCORES` | 상위 N명 조회                  | O(log N + M) |
| `ZREM`                  | Member 삭제                    | O(log N)     |
| `ZREMRANGEBYRANK`       | 순위 범위로 삭제               | O(log N + M) |
| `ZUNIONSTORE`           | 합집합 저장                    | O(N log N)   |
| `ZINTERSTORE`           | 교집합 저장                    | O(N log N)   |

---

## 6. Hashes - 객체 저장, 유저 정보 캐시

### 개념

Hash는 **하나의 Key 안에 여러 개의 Field-Value 쌍**을 저장하는 자료구조다
RDB 테이블의 한 Row(행) 유사하고, Field 수는 40억개까지 저장 가능하다.

```
# DB 테이블 1개 Row
user_id | nickname | avatar_url            | level
--------|----------|-----------------------|------
  1001  |  홍길동  | /img/avatar/1001.png  |  42

# Redis Hash로 표현
Key: "user:info:1001"

Field           Value
──────────────────────────────────
nickname    →  "홍길동"
avatar_url  →  "/img/avatar/1001.png"
level       →  "42"
```

### Table, Hash 비교

| 구분            | RDB Table        | Redis Hash     |
| --------------- | ---------------- | -------------- |
| 구조            | Column + Row     | Field + Value  |
| PK 역할         | Primary Key      | Key            |
| Column 역할     | Column 이름      | Field 이름     |
| Field 수 제한   | DB에 따라 제한   | 무제한         |
| Field 추가      | ALTER TABLE 필요 | 즉시 추가 기능 |
| Field 영향 범위 | 테이블 전체      | 해당 Key만     |

> Hash의 큰 장점 - Field 추가/삭제가 **Key에만 영향**을 마치고,
> 사전 스키마 정의(ALTER) 없이 즉시 Field를 추가할 수 있다.

---

### 주요 명령어

```bash
# HSET - Field 저장/수정 (Redis 4.0부터 Field 동시 설정)
```
