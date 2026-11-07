# Laravel에서 `Redis::get()`은 어떤 Redis에 접속하는지

업무 중 미니게임 글로벌 미션의 진행도와 보상 조건을 확인하다가, 누계 점수 캐시를 읽는 과정에서 Redis 타임아웃이 발생한 로그를 발견했다. 배치가 값을 어디에 쓰고 API가 어디서 읽는지 따라가 보니, 예전에 `ranking`을 지정하던 누계 점수 조회·저장 코드가 `Redis::get()`과 `Redis::set()`으로 바뀌면서 `default` 연결을 사용하고 있었다. 같은 형태의 코드에서 연결이 어떻게 결정되는지, 이번에 어느 호출을 수정하는지 정리해서 공유한다.

## `Redis::get()`은 왜 `default`를 사용하는 지

`default`는 Laravel의 **Redis 연결 설정 이름**이다. `RedisManager`는 파사드로 받은 `Redis::get()` 처럼 파사드로 들어온 Redis 명령을 인자 없는 `connection()`에 전달, 이때 `default`를 선택. 키가 `mini:example_mission:120:example_score`여도 키 이름으로 연결을 고르지 않는다. 일반 연결의 접속 대상은 `config/database.php`에 `redis.default`나 `redis.ranking` 설정에 확인할 수 있음.
[Laravel 11.x Redis 문서](https://laravel.com/framework/docs/11.x/redis#using-multiple-redis-connections) · [RedisManager 소스](https://github.com/laravel/framework/blob/11.x/src/Illuminate/Redis/RedisManager.php)

```php
$key = 'warehouse:42:pedning_shipments';

Redis::get($key); // default 연결
Redis::connection()->get($key); // default 연결
Redis::connection('default')->get($key); // default 연결을 명시
Redis::connection('fulfillment')->get($key); // fulfillment 연결을 명시
```

`Cache::store('redis')`를 쓰는 코드에는 설정이 한 단계 더 있다. 여기서 `redis`는 **캐시 저장소 이름**이다. 실제 Redis 연결은 `config/cache.php`의 `stores.redis.connection`이 선택한다. 사용처를 조사할 때는 `Redis` 파사드를 직접 호출하는 코드와 `Cache` 저장소를 거치는 코드를 구분해서 보면 된다.
[Laravel 11.x 캐시 문서](https://laravel.com/framework/docs/11.x/cache#accessing-multiple-cache-stores)

## 공연 예매 예시

공연 상세 화면에 `900석 중 870석 예약`이 표시된다고 가정. 실제 예약은 DB에 있고, 배치는 예약 건수와 시각을 계산해 Redis에 저장. Redis 재시작 중에 API가 타임아웃을 만나고, 재시작 후 키가 복구되지 않아 값을 읽지 못했을 때 API `0`을 반환하면 화면에 `0석 예약`이 뜬다.

| 상황                               | Redis에서 일어나는 일                                   | 영향                                                         |
| ---------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 재시작 중이거나 연결에 문제가 생김 | 연결 거부나 타임아웃이 발생할 수 있음                   | 예약 현황을 조회할 수 없음                                   |
| 재시작 후 캐시가 복구되지 않음     | 영속성 설정에 따라 키가 없거나 최근 쓰기가 빠질 수 있음 | 배치가 다시 채울 때까지 빈 값이나 이전 집계값이 보일 수 있음 |
| 메모리 한도에 도달함               | 정책에 따라 키가 제거되거나 새 쓰기가 실패할 수 있음    | 예약 건수와 매진 시각의 갱신 시점이 어긋날 수 있음           |

Redis가 요청에 응답하는지 **가용성**, 재시작 뒤 데이터를 어디까지 복구할 수 있는지 **영속성**의 문제. RDB는 시점별 스냅샷을 저장, ADF는 쓰기 명령을 기록. 메모리 한도에서 동작은 `maxmemory-policy` 설정으로 확인.

[Redis Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) ·
[Redis Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)

예시에서 공연 소개 카드에 `default`, 예매 현황에 `ticketing` 을 사용. 둘 다 DB에서 다시 만들 수 있으나, 예매 현장이 틀리면 구매 판단에 영향을 준다. 재시작과 메모리 한도의 영향을 분리하려면 두 연결이 실제로 별도 Redis 인스턴스나 클러스터를 가리켜야 한다. 같은 인스턴스에 DB 0과 DB 1을 쓰면 키 공간은 나뉘고, 서버 재시작과 메모리 한도는 공유된다.

[Redis SELECT](https://redis.io/docs/latest/commands/select/)

### 배치와 API에 같은 연결 지어

`config/database.php`의 `redis` 설정에 예매용 연결을 추가. 이 예시에서 `TICKETING_REDIS_HOST`에 예매용 Redis의 주소를 설정

```php
// config/database.php의 redis 설정 안에 추가
'ticketing' => [
  'host' => env('TICKETING_REDIS_HOST'),
  'port' => env('TICKETING_REDIS_PORT', 6379),
  'database' => 0,
]
```

배치는 `ticketing`에 두 값을 저장, 매진이 풀리면 같은 연결에 매진 시각을 삭제

```php
$redis = Redis::connection('ticketing');
$reservedCountKey = "concert:{$concertId}:reserved_count";
$soldOutAtKey = "concert:{$concertId}:sold_out_at";

$redis->setex($reservedCountKey, 30, $reservedCount);

if ($soldOutAt === null) {
    $redis->del($soldOutAtKey);
} else {
    $redis->setex($soldOutAtKey, 30, $soldOutAt->toIso8601String());
}
```

API도 `ticketing`에서 읽는다. 예시에 `30`은 캐시 유효기간(초)이고, API는 실제 예약 0건을 `0`으로, 조회할 수 없는 상태를 `null`로 구분

```php
try {
    $value = Redis::connection('ticketing')->get($reservedCountKey);
    $reservedCount = $value === null || $value === false ? null : (int) $value;
} catch (\RedisException $exception) {
    Log::warning('Ticketing cache read failed', [
        'connection' => 'ticketing',
        'concert_id' => $concertId,
        'message' => $exception->getMessage(),
    ]);

    $reservedCount = null;
}
```

`null`이면 화면에 `집계 중`으로 표시하거나 DB에서 조회할 수 있음. 두 연결이 서로 다른 저장 위치를 가리키는 환경에서 배치 `SET`만 옮기면 API의 `GET`이 새 값을 읽지 못하고, `DEL`이 기존 연결에 남으면 새 위치의 매진 시각이 지워지지 않음.

## 실제 수정 범위 `ExampleRankingService` 다섯 곳

글로빌 미션 누계 점수와 목표 달성 시각은 배치가 계산에 저장, API는 값을 진행도와 보상 조건 판단에 사용한다. 코드 이력에 누계 점수의 조회와 저장이 함께 `ranking`에서 `default`로 바뀐 지점까지 확인.

수정은 `ranking` 글로벌 미션의 조회·저장·삭제 다섯 곳에 저장하는 방식

| 교체 코드                                                                  | 이유                                                |
| -------------------------------------------------------------------------- | --------------------------------------------------- |
| `return (int) (Redis::connection('ranking')->get($key) ?? 0);`             | 배치가 지정한 누계 점수를 읽음                      |
| `Redis::connection('ranking')->set($key, $totalScore);`                    | 누계 점수를 API가 읽을 위치에 쓴다                  |
| `$value = Redis::connection('ranking')->get($key);`                        | 보상 조건에 쓰는 달성 시각을 읽음                   |
| `Redis::connection('ranking')->set($key, $clearedAt->toDateTimeString());` | 달성 시각을 조회와 같은 위치에 쓴다                 |
| `Redis:;connection('ranking')->del($key)`                                  | 재집계 결과 목표에 미달하면 저장한 달성 시각을 지움 |

연결을 얻는 `Redis::connection('ranking')` 호출도 기존 `try` 블록 안에 둔다. 새 연결읃 얻는 도중 예외가 발생해서 기존 예외 처리 경로를 타도록 하기 위해서다. 공연 예제의 TTL과 `null` 처리는 예시에서 사용한 정책.

타임아웃의 원인을 판단하려면 장애 시간대의 접속 대상, 연결 수, 메모리 사용량, 명령 지연, 네트워크 상태, 재시작·장애 전환 기록을 대조해야 한다. 화면 영향은 해당 요청의 응답 로그나 추적 ID로 확인한다. [Redis `INFO` 문서](https://redis.io/docs/latest/commands/info/) · [Redis 지연 진단 문서](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)

## 연결 이름, 논리 DB 번호, 키를 구분한다

| 구분                        | 예시                             | 역할                                                     |
| --------------------------- | -------------------------------- | -------------------------------------------------------- |
| Redis 연결 이름             | `default`, `fulfillment`         | Laravel이 사용할 접속 설정을 고른다.                     |
| Redis 논리 DB 번호          | `database => 0`                  | 접속한 Redis에서 사용할 논리 DB를 고른다.                |
| Redis 키                    | `warehouse:42:pending_shipments` | 선택한 논리 DB에서 읽거나 쓸 값을 찾는다.                |
| Laravel의 기본 DB 연결 설정 | `database.default`               | `DB` 파사드 등이 사용할 기본 데이터베이스 연결을 고른다. |

Laravel 11.x 기본 프로젝트의 Redis 설정에서 `default`는 `REDIS_DB`를, `cache`는 `REDIS_CACHE_DB`를 사용한다. 환경변수를 따로 지정하지 않았을 때의 기본값은 각각 `0`과 `1`이다. 실제 접속 대상과 DB 번호는 프로젝트에 적용된 설정에서 확인한다. [Laravel 11.x 기본 `database.php`](https://github.com/laravel/laravel/blob/11.x/config/database.php)

## `Cache::store('redis')`는 어떤 연결을 사용할까?

`Cache::store('redis')`에서 `redis`는 **캐시 저장소 이름**이다. 이 저장소가 Redis 드라이버를 사용하면 `config/cache.php`의 `stores.redis.connection`이 실제 Redis 연결 이름을 결정한다.

| 호출                                          | 설정을 확인할 위치                                    |
| --------------------------------------------- | ----------------------------------------------------- |
| `Redis::get($key)`                            | `database.redis.default`                              |
| `Redis::connection('fulfillment')->get($key)` | `database.redis.fulfillment`                          |
| `Cache::get($key)`                            | `cache.default`가 가리키는 캐시 저장소                |
| `Cache::store('redis')->get($key)`            | `cache.stores.redis.connection`이 가리키는 Redis 연결 |

Laravel 11.x 기본 프로젝트에서는 `Cache::store('redis')`의 연결 이름을 `REDIS_CACHE_CONNECTION`에서 읽으며, 기본값은 `cache`다. Redis 캐시 저장소는 자체 키 접두사를 붙이고 값의 저장 형식도 처리하므로, `Cache::put()`으로 저장한 값을 `Redis::get()`으로 직접 읽으려면 최종 키와 저장 형식까지 확인해야 한다. [Laravel 11.x 기본 `cache.php`](https://github.com/laravel/laravel/blob/11.x/config/cache.php) · [RedisStore 소스](https://github.com/laravel/framework/blob/11.x/src/Illuminate/Cache/RedisStore.php)
