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
