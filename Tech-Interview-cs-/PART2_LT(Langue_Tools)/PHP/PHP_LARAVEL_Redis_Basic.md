# 🌐 PHP_Laravel, Redis 기본

> Redis를 처음 접하는 Laravel 개발자를 위한 정리

---

## 1. Redis란?

Redis는 **메모리(RAM)에 데이터를 저장하는 Key-Value저장소**다.

Redis는 메모리에서 바로 읽기 때문에 빠르다(NoSQL)

```php
Redis:
  요청 -> 메모리 읽기 -> 응답 (마이크로초)
```

- 자주 조회되는 데이터 캐싱
- 로그인 세션 저장
- 랭킹 / 점수판 구현
- 중복 요청 방지
- 실시간 상태값 저장

---

## 2. 용어 정리

| 용어       | 설명                                               |
| ---------- | -------------------------------------------------- |
| **Key**    | 데이터를 구분하는 이름. 항상 문자열                |
| **Value**  | Key에 저장된 데이터. 자료구조에 따라 형태가 다르다 |
| **TTL**    | Time To Live 만료시간. 시간이 지나면 자동 삭제     |
| **Member** | Sorted Set/ Set 안의 개별 항목                     |
| **Score**  | Sorted Set에서 정렬 기준이 되는 숫자               |
| **Field**  | Hash 안의 항목 이름. `name`, `level` 등            |

---

## 3. Key 네이밍 규칙

Key는 콜론(':')으로 계층을 구분하는 방식이 일반적이다.

```
타입:도메인:식별자

예시:
user:info:1001 -> userId 1001이면 유저 정보
session:token:abc123 -> 세션 토큰
rank:daily:20250508 -> 일간 랭킹
game:session:xyz-123 -> 게임 중복 방지 키
```

일관된 규칙이 없으면 키가 흩어져서 유지보수가 어렵다.

---

## 4. 자료구조 보기

```
┌─────────────────────────────────────────────────────────┐
│                  Redis 자료구조                          │
├──────────────┬──────────────────────────────────────────┤
│   String     │ "hello", "1000", JSON 문자열             │
│              │ 캐시 · 세션 · 카운터 · 중복방지          │
├──────────────┼──────────────────────────────────────────┤
│   Hash       │ { field: value, field: value }           │
│              │ 유저 정보 · 객체 캐시                    │
├──────────────┼──────────────────────────────────────────┤
│ Sorted Set   │ { member: score }  점수 기반 정렬 집합   │
│   (ZSet)     │ 랭킹 · 리더보드                         │
├──────────────┼──────────────────────────────────────────┤
│   List       │ ["A", "B", "C"]  순서 있는 리스트        │
│              │ 큐 · 스택 · 최근 기록                   │
├──────────────┼──────────────────────────────────────────┤
│   Set        │ {"A", "B", "C"}  중복 없는 집합          │
│              │ 팔로우 · 출석체크 · 태그                 │
└──────────────┴──────────────────────────────────────────┘
```

---

## 5. Laravel, Redis 연결

`config/database.php`에서 Redis connection을 정의

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REIDS_PORT', 6379),,
        'database' => 0,
    ],

        'user' => [
        'host'     => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port'     => env('REDIS_PORT', 6379),
        'database' => 1, // 목적에 따라 DB 번호 분리
    ],
]
```

`.env` 설정

```
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Laravel에서 Redis Facade로 사용하는 방법

```php
use Illuminate\Support\Facades\Redis;

Redis::set('hello', 'world');
$value = Redis::get('hello');

// 특정 connection 사용
Redis::connection('user')->get('user:info:1001');
```

---

## 6. String - 기본 저장 및 조회

기본이 되는 자료구조
문자열, 숫자, JSON 문자열 모두 저장할 수 있다

### 기본 명령어

```bash
# 저장
SET user:token:1001 "eyhjg..."

# TTL 포함 저장(초 단위)
SET session:abc123 "1001" EX 7200 # 2시간 후 자동 삭제

# 조회
GET user:token:1001
# 반환: "eyhjg:

GET no:exist:key
# 반환: (nil) <- 없는 키는 nil 반환

# 삭제
DEL user:token:1001

# 존재 여부 확인
EXISTS user:token:1001
# 반환: 1 (있음) / 0 (없음)

# 여러 키 한번에 저장 / 조회
MSET user:name:1001 "홍길동" user:name:1002 "김철수"
MGET user:name:1001 user:name:1002
```

### TTL 관리

```php
# 이미 저장된 키에 TTL 추가
EXPIRE user:token:1001 3600 #1시간

# 남은 시간 확인
TTL user:token:1001
# 반환:
# 3542 -> 남은 초
# -1 -> TTL 없음 (영구 보존)
# -2 -> 키 자체가 없다

# TTL 제거 (영구 보존으로 전환)
PERSIST user:token:1001
```

### Laravel 코드 에시

```php
use Illuminate\Support\Facades\Redis;

// 저장
Redis::set('user:token:1001', 'eyJhbGci...', 'EX', 3600);

// 조회
$token = Redis:get('user:token:1001');

// 삭제
Redis::del('user:token:1001');

// 존재 여부
$exists = Redis:exists('user:token:1001'); // 1 or 0
```

## 7. Hash - 객체 저장 / 조회

하나의 Key안에 여러 Field-Value 쌍을 저장한다
유저 정보처럼 **여러 속성을 묶어서 저장**할 때 한다

```
KEY: user:info:1001

Field        Value
──────────────────────
name     →   홍길동
level    →   42
honor    →   5
```

### 기본 명령어

```bash
# 접수 등록 / 갱신
ZADD rank:daily:20250508 99800 "1001"
ZAdd rank:daily:20250508 98500 "1002"

# GT 옵션 - 기존보다 높을 때 갱신 (최고점수형 갱신)
ZADD rank:daily:20250508 GT 100000 "1001"

# 상위 N명 조회 (점수 높은 순)
ZRANGE rank:daily:202508 0 9 REV WITHSCORES
# 또는
ZREVRANGE rank:daily:20250508 0 9 WITHSCORES

# 특정 유저 순위 조회 (0-based -> +1 하면 실제 순위)
ZREVRANK rank:daily:202508 "1001"
# 반환: 0 -> 1위

# 특정 유저 점수 조회
ZSCORE rank:daily:20250508 "1001"
# 반환: "99800"

# 전체 멤버 수
ZCARD rank: daily:20250508

# 멤버 삭제
ZREM rank:daily:20250508 "1001"
```

### Laravel 코드 예시

```php
// 점수 등록
Redis::zAdd('rank:daily"20250508', 99800, '1001');

// 상위 10명 조회
$topUsers = Redis::zRevRange('rank:daily:20250508', 0, 9, 'WITHSCORES');

// 특정 유저 순위
$rank = Redis::zRevRank('rank:daily:20250508', '1001');
$rank = $rank !== null ? $rank + 1 : 0; // 1-based 반환

// 특정 유저 점수
$score = Redis::zScore('rank:daily:20250508', '1001');
```

---

## 9. 자주 쓰는 명령어 요약

### String

| 명령어                | 용도           | 복잡도 |
| --------------------- | -------------- | ------ |
| `SET key value`       | 저장           | O(1)   |
| `SET key value EX 초` | TTL 포함 저장  | O(1)   |
| `SET key value NX`    | 없을 때만 저장 | O(1)   |
| `SET key`             | 조회           | O(1)   |
| `GET key`             | 조회           | O(1)   |
| `DEL key`             | 삭제           | O(1)   |
| `EXISTS key`          | 존재 여부      | O(1)   |
| `EXPIRE key 초`       | TTL 설정       | O(1)   |
| `TTL key`             | 남은 만료 시간 | O(1)   |
| `PERSIST key`         | TTL 제거       | O(1)   |

### Hash

| 명령어                 | 용도           | 복잡도 |
| ---------------------- | -------------- | ------ |
| `HSET key field value` | 필드 저장      | O(N)   |
| `HGET key field`       | 단일 필드 조회 | O(1)   |
| `HMGET key f1 f2`      | 여러 필드 조회 | O(N)   |
| `HGETALL key`          | 전체 조회      | O(N)   |
| `HEXISTS key field`    | 필드 존재 여부 | O(1)   |
| `HDEL key field`       | 필드 삭제      | O(N)   |

### Sorted Set

| 명령어                         | 용도                | 복잡도       |
| ------------------------------ | ------------------- | ------------ |
| `ZADD key score member`        | 점수 등록 / 갱신    | O(log N)     |
| `ZADD key GT score member`     | 최고점수만 갱신     | O(log N)     |
| `ZREVRANGE key 0 N WITHSCORES` | 상위 N명 조회       | O(log N + M) |
| `ZREVRANK key member`          | 순위 조회 (0-based) | O(log N)     |
| `ZCARD key`                    | 전체 멤버 수        | O(1)         |
| `ZREM key member`              | 멤버 삭제           | O(log N)     |

---

## 10. 자료구조 선택 기준

```
단순 값 저장 / 캐시 / 세션 / 중복 방지
-> String

여러 속성을 가진 객체 저장 (유저 정보 등)
-> Hash

점수 기반 정렬 / 순위 / 랭킹
-> Sorted Set

순서 있는 목록 / 큐 / 최근 N개
-> List

중복 없는 집합 / 팔로우 / 출석
-> Set
```

## 11. 핵심 한 줄 정리

> **String** — "값 하나 넣고, 시간 지나면 지워줘" = 캐시 · 세션 · 중복방지
> **Hash** — "이 키에 여러 속성 한 번에 저장해줘" = 유저 정보 · 객체 캐시
> **Sorted Set** — "점수로 자동 정렬, 순위 바로 알려줘" = 랭킹 · 리더보드
