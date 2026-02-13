## Redis 기본개념과 명령어

### 개요

- Redis는 "Remote Dictionary Servcer"의 약자, 오픈 소스 기반의 인메모리 NoSQL 키/값 데이터베이스이다. 모든 데이터를 저장하고 처리하기에 디스크 기반 데이터베이스보다 훨씬 낮은 지연 시간과 높은 처리량을 제공한다.
- 애플리케이션 캐시나 고성능 데이터 저장소로 사용, 복제 기능과 다양한 데이터 구조 lua 스크립팅, 디스크 기반 백업 지원 등을 제공해 높은 가용성과 확장성을 갖춘다.

### Redis의 데이터 모델과 키

- Redis에서 저장하는 모든 값은 고유한 키와 함께 저장된다.
- 메모리 기반이라 매우 빠른 응답 속도(낮은 지연 시간)
- 다양한 데이터 구조(String, Hash, List, Set, Sorted Set 등) 지원
- 캐시 뿐 아니라 세션 저장소, 랭킹, 실시간 집계, 큐 처리 등에도 활용이 가능하다
- 복제(Replication), 영속성(RDB/AOF), Sentinel/Cluster를 통한 고가용성 구성 가능
- 키는 단순한 문자열로 정의되며 공백이나 특수문자가 포함될 수 있고 이론적으로 바이트 배열도 가능하다.
- 주로 `도메인:아이디` 형식으로 이름을 구분하기 위해 콜론(:)을 사용하고, 너무 긴키는 메모리와 성능을 떨어뜨리므로 피해야 한다.
- 키에는 TTL(Time To Live)을 설정해 만료시간이 지나면 자동으로 삭제할 수 있고, `EXPIRE` 명령으로 초 단위 만료를 설정, `TTL`로 남은 시간을 조회할 수 있다.

### Redis 데이터 모델과 키 설계

- 키(Key)는 보통 문자열, **명확한 네이밍 규칙**이 중요하다.
- 일반적으로 `도메인:리소스:ID` 형태를 많이 사용한다.
- 예: `user:1001:profile`, `order:202040211:items`, `session:token:abc123`
- 키가 과도하게 길면 메모리 사용량과 처리 효율에 불리할 수 있다.

### TTL(Time To Live)

- Redis는 키 단위로 만료 시간을 지정할 수 있다.
- `EXPIRE key seconds`: 초 단위 TTL 설정
- `TTL key`: 남은 TTL 조회
- `PERSIST key`: 만료 제거
- `SET key value EX 60`: 저장과 동시에 TTL 설정

```bash
SET login:fail:user123 1 EX 300
TTL login:fail:user123
EXPIRE login:fail:user123 600
```

### 주요 데이터 구조와 기본 명령어

**문자열(Strings)**

- 문자열은 Redis에 가장 기본적인 데이터 타입이다.
- `SET` 명령은 특정 키에 문자열 값을 저장, 기존 값이 있다면 덮어쓴다.
- `GET` 명령은 키에 저장된 값을 가져오며, 존재하지 않는 키는 `nil`을 반환한다.
- 여러 키를 한번에 조회할 때는 `MGET`을 사용한다.
- 숫자 값을 1씩 증가시키는 `INCR` 명령은 카운터 구현에 유용하다.
- `SET key value`, `GET key`, `MGET key1 key2 ...`, `INCR key`, `DECR key`, `SET key value NX(키가 없을때만 저장)`, `SET key value XX(키가 있을때만 저장)`

```bash
SET page:view:home 100
INCR page:view:home
GET page:view:home
```

**해시(Hashes)**

- 해시는 필드-값 쌍을 저장하는 작은 맵 구조, 하나의 키에 여러 속성을 묶어 저장할 때 사용한다.
- `HSET`은 지정된 필드에 값을 저장하고 새로운 필드면 1을 반환한다.
- `HGET`은 해시에서 특정 필드의 값을 조회한다
- `HGETALL`은 해시의 모든 필드와 값을 반환한다.
- `HSET key filed value`, `HGET key field`, `HGETALL key`, `HMGETkey field1 field2 ...`, `HDEL key field`

```bash
HSET user:1001 name "Kim" age 29 city "Seoul"
HGET user:1001 name
HGETALL user:1001
```

**리스트(Lists)**

- 리스트는 두 방향으로 삽입과 삭제가 가능한 연결 리스트다.
- `LPUSH`는 리스트 머리에 값들을 삽입한다.
- `RPUSH`는 꼬리에 삽입한다.
- `LRANGE key start stop`은 지정된 범위의 요소를 반환한다.
- `LLEN`은 리스트 길이를 반환한다. 큐와 스택 모두를 간단히 구현할 수 있다.
- `LPUSH key value`, `RPUSH key value`, `LPOP key`, `RPOP key`, `LRANGE key start stop`, `LLEN key`

```bash
RPUSH queue:email "job1" "job2" "job3"
LPOP queue:email
LLEN queue:email
```

**집합(Sets)**

- 집합은 중복되지 않은 문자열 요소들의 모음이다.
- `SADO`는 집합에 요소를 추가한다
- `SMEMBERS`는 집합의 모든 멤버를 반환한다.
- `SCARD`는 집합의 크기를 확인한다.
- `SISMEMBER`는 특정 멤버 존재 여부를 확인한다.
- `SADD key member`, `SMEMBERS key`, `SCARD key`, `SISMEBER key member`, `SREM key member`

```bash
SADD post:1:tags "redis" "nosql" "cache"
SISMEMBER post:1:tags "redis"
SMEMBERS post:1:tags
```

**정렬된 집합(Sorted Sets)**

- 정렬된 집합은 각 멤버에 점수(score)가 할당된 집합으로, 순위 계산에 적합하다.
- `ZADO key scroe member` 명령으로 멤버를 추가한다.
- `ZRANGE key start stop[WITHSCORES]`는 점수 순으로 지정된 구간의 멤버를 반환한다.
- `ZADD key score member`, `ZRANGE key start stop WITHSCORES`, `ZREVRANGE key start stop WITHSCORES`, `ZSCORE key member`, `ZREM key member`

```bash
ZADD game:rank 1200 user:1 950 user:2 1800 user:3
ZREVRANGE game:rank 0 2 WITHSCORES
```

## 일반적으로 유용한 명령어

- `KEYS pattern` 은 패턴에 매칭되는 모든 키를 반환하지만 전체 데이터베이스를 순회하므로 생산 환경에서는 사용에 주의해야 한다.
- `SCAN cursor [MATCH pattern]` 은 반복 가능한 방식으로 키를 조회하여 `KEYS`보다 안전하게 사용할 수 있다.
- `EXISTS key`는 키 존재 여부를 확인, `DEL key`는 키와 값을 삭제한다.
- `EXPIRE key seconds`는 키의 만료 시간을 설정, `TTL key`는 TTL을 반환한다.
- `INFO` 명령은 서버 상태, 메모리 사용량, 복제 상태 등 다양한 정보를 출력한다.

## redis-cli 사용 방법

- `redis-cli`는 Redis 서버와 상호 작용하는 기본 명령줄 인터페이스다.
- 기본적으로 `redis-cli` 로컬 호스트(127.0.0.1)의 6379 포트에 접속한다.
- 다른 서버나 포트에 접속하려면 `-h <호스트>`와 `-p <포트>` 옵션을 사용한다.

```bash
redis-cli -h redis15.localnet.org -p 6390 PING
```

- 위 명령은 지정된 호스트와 포트로 연결하여 `PING` 명령을 실행하고 `PONG`을 받는다.

- 비밀번호가 설정된 인스턴스에 접속할 때 `-a <pasword>` 옵션으로 인증할 수 있다.
- 데이터베이스 번호를 선택하려면 `-n <dbnum>` 옵션을 사용한다. 예를들어 데이터베이스 1에 값을 증가시키리면 `redis-cli -n 1 INCR a`와 같이 실행한다.
- URI 형식(`redis://user:password@host:port/dbnum`)을 사용하는 `-u` 옵션도 지원한다.
- `redis-cli`는 명령어를 파일이나 다른 프로그램에서 읽어 실행할 수 있다.
- `-x` 옵션과 입멱 리다이렉션을 이용하면 파일 내용을 값을 설정할 수 있고, 여러 명령을 담은 텍스트 파일을 파이프로 전달하면 일괄 실행된다.
- 특정 명령을 반복 실행하고 지연 시간을 줄 수 있는 `-r <회수>`와 `-i <지연>` 옵션도 있다.
- 예를들어 매초 `INFO` 명령을 실행하여 메모리 사용량을 모니터링 할 수 있다.

## Redis 키 관리와 만료

- Redis의 주요 장점 중 하나는 키에 만료 시간을 설정할 수 있다는 점이다.
- `EXPIRE key seconds` 명령을 사용하면 지정된 시간 이후 키가 자동으로 삭제된다.
- TTL은 밀리초 단위까지 설정할 수 있고, 만료 정보는 디스크에도 저장되어 서버가 재시작될 때 적용된다.
- 만료 시간을 제거하려면 `PERSIST key` 명령을 사용한다.

## 실무 팁 모범 사례

- 키 명명 규칙: 명확한 도메인과 식별자를 포함하도록 `object-type:id:field` 형식을 사용하고, 콜론으로 구분해 그룹화를 쉽게 한다. 너무 긴 키는 성능을 저하시킬 수 있으므로 적당한 길이를 유지한다.
- 만료 사용: 캐시로 사용할 때는 모든 키에 만료 시간을 설정해 메모리를 회수하고 데이터 일관성을 유지한다. `EXPIRE`나 `SET key value EX seconds`를 적극 활용한다.
- SCAN 사용: 운영 환경에서 대량의 키를 조회할 때는 `KEYS` 대신 `SCAN`을 사용해 서버를 블로킹하지 않도록 한다.
- 원자적 명령: Redis 명령은 기본적으로 단일 스레드에서 실행되며 원자성을 보장한다. `INCR`, `HSET`, `LPUSH` 등은 경쟁 조건 없이 안전하게 사용할 수 있다.
- 지속성 설정: 기본적으로 Redis는 데이터를 메모리에 저장하지만 RDB 스냅샷과 AOF(Append Only File) 옵션을 통해 디스크에 기록하여 장애 시 복구할 수 있다. 애플리케이션 요구 사항에 따라 적절한 지속성 옵션을 설정해야한다.

## 랭킹 구현 및 디버깅에 유용한 명령어

- 정렬된 집합(`Sorted Set`)과 해시(`Hash`) 구조를 사용하면 게임의 리더보드나 포인트 시스템처럼 점수 기반 랭킹을 쉽게 구현할 수 있다. 운영 과정에서 데이터 상태를 확인하고 문제를 파악하기 위해 다양한 명령어를 사용한다. 명령어들은 실무에서 랭킹 구현과 디버깅에 특히 유용하다.

**`ZREVRANGE` - 상위 N개 멤버 조회**

- `ZREVRANGE key start stop [WITHSCORES]는 정렬된 집합에서 점수가 높은 순서대로 지정된 범위의 멤버를 반환한다. 점수가 동일한 경우 역순으로 사전적 정렬을 적용한다.
- 예를들어 `ZREVRANGE leaderboard 0 2 WITHSCORES`는 상위 3명의 멤버와 점수를 확인하는데 활용할 수 있다.
