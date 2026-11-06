# Laravel에서 `Redis::get()`은 어떤 Redis에 접속하는지

업무 중 Redis 조회 타임아웃이 발생하는 로그를 확인했다. 어떤 연결에서 실패했는 지 코드를 확인했더니, 예전에 이름을 지정하던 Redis 호출이 `Redis::get()`으로 바뀌며 Laravel의 `default` 연결을 사용하고 있었다.
해당 줄만 확인해서는 접속 대상이 드러나지 않아서, Laravel이 Redis 연결을 고르는 방식과 배치·API 같은 위치를 사용해야 하는 이유를 다른 예시로 정리해 공유한다

## `Redis::get()`은 왜 `default`를 사용하는 지

`default`는 Laravel의 **Redis 연결 설정 이름**이다. `RedisManager`는 파사드로 받은 `get()` 같은 명령을 인자 없는 `connection()`으로 전달한다. 연결 이름을 생략하면 `default`를 선택한다. 키 이름에 `warehouse`가 들어 있어도 연결 선택에 영향을 주지 않음.
[Laravel 11.x Redis 문서](https://laravel.com/framework/docs/11.x/redis#using-multiple-redis-connections) · [RedisManager 소스](https://github.com/laravel/framework/blob/11.x/src/Illuminate/Redis/RedisManager.php)

```php
$key = 'warehouse:42:pedning_shipments';

Redis::get($key); // default 연결
Redis::connection()->get($key); // default 연결
Redis::connection('default')->get($key); // default 연결을 명시
Redis::connection('fulfillment')->get($key); // fulfillment 연결을 명시
```

`Cache::store('redis')`의 `redis`는 **캐시 저장소 이름**이다.
해당 경우에는 `config/cache.php`의 `stores.redis.connection`을 먼저 확인, 이름에 해당하는 접속 설정을 `config/database.php`에 찾는다.
[Laravel 11.x 캐시 문서](https://laravel.com/framework/docs/11.x/cache#accessing-multiple-cache-stores)

## 예시

물류센터에 출고를 기다리는 주문이 240건 있다고 가정. 주문 상태는 DB에 있고, 배치는 **출고 대기 건수**

### 출고 현황에 쓸 연결을 지정

### 배치와 API의 읽기·쓰기·삭제를 같은 연결로 맞춘다
