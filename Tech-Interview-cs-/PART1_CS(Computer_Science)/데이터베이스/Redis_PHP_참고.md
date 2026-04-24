## PHP에서 Redis 기본, 실전 예시

# PHP에서 Redis 기본과 실전 사용 정리

> Laravel + Redis 입문 문서  
> 실제 `RedisService`, `PlayingPredictionService`, `GetRedisHandler` 예시 기반

---

## 📌 목차

1. [Redis란 무엇인가](#1-redis란-무엇인가)
2. [PHP Laravel에서 Redis를 왜 쓰는가](#2-php-laravel에서-redis를-왜-쓰는가)
3. [Laravel에서 Redis 연결하고 사용하는 방식](#3-laravel에서-redis-연결하고-사용하는-방식)
4. [Redis 자료구조 기초](#4-redis-자료구조-기초)
5. [실제 프로젝트 코드에서 Redis가 쓰이는 방식](#5-실제-프로젝트-코드에서-redis가-쓰이는-방식)
6. [RedisService 코드로 보는 핵심 개념](#6-redisservice-코드로-보는-핵심-개념)
7. [PlayingPredictionService 코드로 보는 실전 활용](#7-playingpredictionservice-코드로-보는-실전-활용)
8. [GetRedisHandler 코드로 보는 헬스체크](#8-getredishandler-코드로-보는-헬스체크)
9. [PHP에서 자주 쓰는 Redis 명령어 정리](#9-php에서-자주-쓰는-redis-명령어-정리)
10. [실무에서 꼭 기억할 포인트](#10-실무에서-꼭-기억할-포인트)
11. [핵심 한 줄 정리](#11-핵심-한-줄-정리)

---

## 1. Redis란 무엇인가

Redis는 **메모리 기반 Key-Value 저장소**다.
데이터를 아주 빠르게 읽고 쓰기 위한 저장소다.

보통 MySQL, PostgreSQL 같은 DB는 영구 저장에 강하다
Redis는 당므 같은 상황에서 특히 강력하다

- 자주 조회되는 데이터 캐싱
- 로그인 세션 저장
- 랭킹 점수 저장
- 실시간 상태값 저장
- 중복 요청 방지
- Pub/Sub 메시지
- 큐 처리의 기반 저장소

Redis는 영구 저장용이 아니라 **빠르게 꺼내 써야 하는 데이터**를 다루는데 특화되어 있다.

---

## 2. PHP Laravel에서 Redis를 쓰는 이유

Laravel 프로젝트에서 Redis를 쓰는 이유는

### 1. DB 부하를 줄일 수 있다

유저 이름, 유저 상태, 랭킹 정보처럼 자주 읽히는 데이터를 매번 DB에서 조회하면 느리고 비효율적이다

```text
DB만 사용할 때
요청 -> DB 조회 -> 응답
요청 -> DB 조회 -> 응답
요청 -> DB 조회 -> 응답

Redis를 함께 사용
요청 -> Redis 조회 -> 있으면 바로 응답
요청 -> Redis 조회 -> 없으면 DB 조회 후 Redis 저장
```

### 2. 응답 속도가 빨라진다

Redis는 메모리 기반이라 매우 빠르다
같은 데이터를 자주 보여주는 API일수록 Redis 효과가 크다

### 3. 상태성 데이터를 다루기 좋다

다음과 같은 데이터는 Redis와 잘 맞는다

- 마지막 응답 캐시
- 유저 상태 정보
- 랭킹 점수
- 세션
- 중복 제출 방지용 키

---

## 3. Laravel에서 Redis 연결하고 사용하는 방식

Laravel에서 보통 Redis Facade를 통래 Redis를 사용한다.

**기본예시**

```php
use Illuminate\\Support\\Facades\\Redis;

Redis::set('name', 'kim');
$value = Redis::get('name');
```

**특정 connection 사용**

```php
public static function getUserRedis()
{
    return Redis::connection('user');
}
```

해당 코드는 `database.php`에 정의된 `user` Redis connection을 가져온다
프로젝트에서 Redis를 하나만 쓰는게 아니라 목적에 따라 connection을 나눠 사용할 수 있다.

- `default` 연결
- `cache` 연결
- `session` 연결
- `user` 연결

### PHP에서 Redis 호출은 기본적으로 순차 실행된다

일반적으로 코드가 위에서 아래로 순서대로 실행된다

```php
$result = Redis::get('user:1001');
$data = json_decode($result, true);
return data;
```

Node.js처럼 `await`를 쓰는 구조는 아니고, 호출 -> 결과 반환 -> 다음 코드 실행 흐름으로 이어진다

---

## 4. Redis 자료구조

Redis는 단순히 문자만 저장하는게 아닌 자료구조별로 최적화된 명령어를 제공한다

### 1. String

가장 기본적인 형태

```php
Redis::set('hello', 'world');
$value = Redis::get('hello');
```

주로 아래와 같이 쓰인다

- 캐시
- 세션토큰
- 마지막 응답 저장
- 단순 상태값

### 2. Hash

하나의 Key 아래 여러 field-Value를 저장할 수 있다.

```php
Redis_hMSet('user_status:1001', [
  'name' => '김요한'
  'honor_id' => 3,
]);

$data = Redis::hGetAll('user_status:1001');
```

- 유저 프로필 일부
- 상태 정보
- 객체성 데이터

### 3. Sorted Set(ZSet)

점수가 있는 정렬된 집합이다. 랭킹 구현에 자주 쓰인다

```php
Redis::zAdd('ranking', 100, 'user:1001');
Redis::zAdd('ranking', 200, 'user:1002');
```

- 랭킹
- 점수판
- 우선순위 정렬

### 4. TTL(Time To Live)

Redis Key는 만료 시간을 줄 수 있다

```php
Redis::set('temp:key', 'value', 'EX', 60);
```

- `EX` : 초 단위 만료 시간
- `60` : 60초 뒤 자동 삭제

TTL은 캐시 데이터에 매우 중요하다
만료 시간이 없으면 오래된 데이터가 계속 남을 수있다.

---

### 5. 코드 예시

몇 가지 예시를 실무에 적용하는 것들을 가져왔다.
| Key 예시 | 자료구조 | 용도 |
|---|---|---|
| `USER_LAST_RES_{userId}` | String | 마지막 응답 캐시 |
| `user_status:{user_id}` | Hash | 유저 이름, 칭호 등 상태 저장 |
| `collection_level_ranking:{id}` | ZSet | 컬렉션 랭킹 |
| `user_collection_level_ranking` | ZSet | 전체 랭킹 |

해당 프로젝트는 Redis를 다음처럼 사용한다

- **String**: JSON 전체를 통째로 저장
- **Hash**: 객체의 필드별 저장
- **ZSet**: 점수 기반 정렬 저장

---

### 6. RedisService 예시

Reids 관련 로직은 보통 한 곳에 모아둔다

#### 6-1. key 상수 정의

```php
const USER_LAST_RESPONSE_PREFIX = 'USER_LAST_RES';
const USER_STATUS_KEY = 'user_status:{user_id}';
const USER_LAST_RESPONSE_TTL = 604700;
```

-> 상수로 정의해둔다

- key 이름 오타를 줄일 수 있다
- Key 규칙이 한곳에 모인다
- 나중에 prefix 변경이 쉽다

`604800` 은 초 단위로 7일이다.

```
60초 * 60분 * 24시간 * 7일 = 6048000
```

---

### 6.2 Redis Connection

```php
public static function getUserRedis()
{
    return Redis::connection('user');
}
```

메서드는 Redis를 클라이언트를 직접 쓰는 대신 `user` connection을 반환하는 역할
서비스코드에서 아래처럼 재사용할 수 있다

```php
self:;getUserRedis()->get($key);
self::getUserRedis()->hGetAll($key);
```

### 6.3 String으로 마지막 응답 저장

```php
public static function setUserLastResponse(int $userId, array $response): void
{
    $key = self::USER_LAST_RESPONSE_PREFIX . '_' . $userId;
    self::setRedisData($key, json_encode($response), self::USER_LAST_RESPONSE_TTL);
}
```

1. Key 생성
2. 배열을 JSON 문자열 변환
3. TTL과 함께 저장
   데이터는 구조적으로 "객체" 실제로 Redis에 String으로 저장
   Redis 내부에 저장된다

```php
KEY: USER_LAST_REST_1001
VALUE: {"foo":"bar", "score":10}
TTL: 6040800
```

### 6.4 String 데이터 읽기
