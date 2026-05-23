# 🌐 PHP_Laravel

# MySQL Error 1701 — 테스트 DB 초기화 중 FK 제약 오류 해결기

> Laravel + Sail 환경에서 테스트 실행 시 `SQLSTATE[42000] Error 1701`이 반복 발생했던 원인을 분석하고, 단계적으로 해결한 과정을 정리한다.

## 1. 개요

새로운 API 테스트를 작성하던 중 기존에 통과하던 다른 테스트 등 무관한 테스트까지 함께 실패하기 시작했다.

처음에는 새로 작성한 테스트 코드 자체의 문제처럼 보였지만, 기존 테스트까지 동일하게 실패한다는 점에서 **테스트 공통 초기화 로직 및 로컬 DB 상태 문제**로 방향을 돌려 조사 및 해결 방안을 확인하고 해결하였던 이슈를 공유하고자 한다.

---

## 2. 발생 이슈

테스트 실행 시 `tests/TestCase.php`의 `setUp()` 내부에서 아래와 같이 DB 초기화가 수행된다

```php
$this->truncateConnection('manage');
$this->truncateConnection('user');
$this->truncateConnection('ranking');
$this->truncateConnection('log');
```

이때 manage DB의 테이블을 일괄 `truncate()` 하던 중 FK 제약 조건으로 인해 아래 오류가 발생했다.

```
SQLSTATE[42000]: Syntax error or access violation: 1701
Cannot truncate a table referenced in a foreign key constraint
(manage.example_child,
CONSTRAINT example_child_parent_id_foreign)
(Connection: manage, SQL: truncate table example_parent)
```

권한 테이블 정리 이후 테스트를 재실행하자 이번에는 Telescope 테이블에서 동일한 유형의 오류가 추가 발생했다.

```
Cannot truncate a table referenced in a foreign key constraint
(manage.example_log,
CONSTRAINT example_log_entry_uuid_foreign)
(Connection: manage, SQL: truncate table example_entries)
```

---

## 3. 원인 분석

### 3-1. MySQL Error 1701이 발생했던 이유

MySQL의 `TRUNCATE`는 내부적으로 테이블을 드랍 후 재생성하는 **DDL 작업**이다. 다른 테이블이 FK로 참조 중인 parent 테이블은 `TRUNCATE`를 직접 실행할 수 없다.

```
example_child.parent_id  →  example_parent.id
example_log.entry_uuid   →  example_entries.uuid
```

위 예시 `example_parent`, `example_entries`를 먼저 truncate 하면 FK 제약에 의해 1701 오류가 발생한다.

### 3-2. 기존 truncateConnection()의 문제

`truncateConnection()` FK 관계를 고려하지 않고 전체 테이블을 순서대로 truncate 하고 있다.

```
1. connection 이름을 받는다.
   예: manage, tool, user1

2. 해당 connection에 접속한다.

3. show tables 명령어로 테이블 목록을 가져온다.

4. 결과에서 테이블명만 뽑는다.

5. 테이블을 하나씩 돌면서 truncate 한다.

6. 결과적으로 해당 DB 커넥션의 모든 테이블 데이터가 비워진다.
```

FK child 테이블보다 parent 테이블이 먼저 처리되는 순서가 되면 즉시 오류가 발생하는 구조였다.

### 3-3. manage DB에 잘못 생성된 테이블

Sail tinker로 각 커넥션의 실제 연결 DB를 먼저 확인했다.

> ### Sail tinker란?,
>
> `Sail tinker`는 Laravel Sail 환경에서 Laravel의 대화형 실행 도구인 `tinker`를 실행하는 명령어다. 즉, Docker 컨테이너 안에서 Laravel 애플리케이션을 직접 실행하면서 DB 연결 상태, 모델 조회, 설정값, Redis 연결, 특정 로직 실행 결과 등을 빠르게 확인할 수 있다. 일반 Laravel 환경에서는 보통 아래처럼 실행한다.
> php artisan tinker`

Laravel Sail을 사용하는 Docker 환경에서는 PHP와 Laravel 애플리케이션이 컨테이너 내부에서 실행되기 때문에 아래처럼 실행한다.

```bash
./vendor/bin/sail artisan tinker
```

또는 alias를 설정해둔 경우 아래처럼 짧게 실행할 수 있다.

```bash
sail artisan tinker
```

tinker에 진입하면 Laravel 코드와 동일한 방식으로 DB, Model, config(), env() 등을 직접 실행해볼 수 있다.

따라서 이번 이슈에서 sail tinker를 사용해 다음과 같은 과정으로 확인했다

1. manage 커넥션이 실제 manage DB를 바라보는지

2. tool 커넥션이 실제 tool DB를 바라보는지

3. `example_parent`, `example_child`, `example_entries` 등의 테이블이 어느 DB에 생성되어 있는지

4. 커넥션 설정 문제인지, 마이그레이션 실행 위치 문제인지

결과:

| DB     | example_parent | example_child | example_entries |
| ------ | -------------- | ------------- | --------------- |
| manage | **존재**       | **존재**      | **존재**        |
| tool   | 존재           | 존재          | —               |

권한 관련 테이블은 tool DB에만 있어야 하는데, manage DB에도 동일하게 생성되어 있었다. migration 작성 시 `connection()`을 명시하지 않아 기본 커넥션(manage)에도 테이블이 생성된 것으로 판단했다.

---

## 4. 조치 내용

### 4-1. manage DB의 태이블 제거

FK 제약 때문에 DROP 전에 외래키 검사를 일시 비활성화했다.

```php
DB::connection('manage')->statement('SET FOREIGN_KEY_CHECKS=0');

DB::connection('manage')->statement('DROP TABLE IF EXISTS example_role_permissions');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_model_roles');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_child');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_roles');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_parent');

DB::connection('manage')->statement('SET FOREIGN_KEY_CHECKS=1');
```

제거 후 확인:

```php
DB::connection('manage')->select("show tables like 'example_parent'");
// → []

DB::connection('manage')->select("show tables like 'example_child'");
// → []

DB::connection('tool')->select("show tables like 'example_parent'");
// → 정상 존재
```

### 4-2. manage DB의 example2 테이블 제거

위 테이블 정리 후 테스트를 재실행하자 이번에는 `example_entries` 관련 FK 오류가 추가로 발생했다. 먼저 테이블 존재 여부를 확인했다.

```php
DB::connection('manage')->select("show tables like 'example%'");

```

확인 후 동일하게 제거했다.

```php
DB::connection('manage')->statement('SET FOREIGN_KEY_CHECKS=0');

DB::connection('manage')->statement('DROP TABLE IF EXISTS example_log');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_entries');
DB::connection('manage')->statement('DROP TABLE IF EXISTS example_monitoring');

DB::connection('manage')->statement('SET FOREIGN_KEY_CHECKS=1');
```

제거 후 확인:

```php
DB::connection('manage')->select("show tables like 'example%'");
// → []
```

## 5. 최종 결과

manage DB에서 잘못 생성된 테이블들을 제거한 뒤 테스트를 재실행했다. 기존 테스트 코드가 모두 정상 통과하는 것을 확인했다.

```
✓ 기존 테스트 전체 통과
✓ 신규 작성 테스트 통과
```

이번 이슈는 신규 테스트 코드 자체의 문제가 아니라, 테스트 실행 전 공통 DB 초기화 과정에서 manage DB 내 FK 테이블을 truncate 하면서 발생한 문제였다.

> 📌 테스트 실행 중 출력된 `Xdebug: [Step Debug] Could not connect to debugging client` 메시지는 이번 DB 오류와 **무관한** 디버깅 클라이언트 연결 실패 로그이므로 무시해도 된다.

---

## 6. 재발 방지 계획

### 6-1. migration 작성 시 connection 명시

특정 DB에만 생성되어야 하는 테이블은 migration에서 반드시 `connection()`을 명시해야 한다

```php
// 잘못된 예 - 기본 connection(manage)에 생성할 수 있다
Schema::create('example_parent', function (Blueprint $table) {
  // ...
});

// 올바른 예 - tool DB에만 생성
Schema::connection('tool')->create('example_parent', function (Blueprint $table) {
  // ...
});
```

`example_parent`, `example_roles`, `example_child`, `example_model_roles`, `example_role_permissions` 등 관련 테이블은 모두 동일한 connection을 명시해야 한다.

### 6-2 TestCase truncate 로직 보완

현재 테스트 초기화는 FK 관계를 고려하지 않고 전체 테이블을 truncate 한다. 향후 각 DB에 FK가 추가될 경우 동일한 문제가 다시 발생할 수 있으므로, `FOREIGN_KEY_CHECKS` 비활성화를 적용하는 방향으로 개선한다.

```
1. 초기화 대상 DB 커넥션을 가져온다.
2. 해당 커넥션의 전체 테이블 목록을 조회한다.
3. 테이블 초기화 전에 외래키 체크를 잠시 비활성화한다.
4. 전체 테이블을 순회하면서 데이터를 비운다.
5. 초기화가 끝나면 외래키 체크를 다시 활성화한다.
6. 중간에 오류가 발생하더라도 외래키 체크는 반드시 복구되도록 처리한다.
```

핵심은 truncate를 실행하는 동안만 외래키 검사를 잠시 끄고, 작업이 끝나면 다시 켜는 것이다.

```
FOREIGN_KEY_CHECKS = 0

→ 외래키 검사 임시 비활성화

전체 테이블 truncate

→ 테스트 데이터 초기화

FOREIGN_KEY_CHECKS = 1

→ 외래키 검사 다시 활성화

기존 문제

- 외래키 관계가 있는 테이블에서 truncate 실패 가능
- 테이블 초기화 순서에 따라 테스트 결과가 불안정해질 수 있음
- 다중 DB 커넥션 환경에서 특정 커넥션별 초기화 안정성이 필요함

수정 방향

- 테스트 초기화 시 외래키 체크를 임시로 비활성화
- 전체 테이블 초기화 후 외래키 체크를 다시 활성화
- 오류가 발생해도 설정이 복구되도록 처리

결과

- 외래키 관계가 있는 테이블도 안정적으로 초기화 가능
- 테스트 시작 전 DB 상태를 일관되게 맞출 수 있음
- 다중 커넥션 환경에서도 커넥션별 초기화 처리가 명확해짐
```

---

## 7. 주의 사항

- 이번 조치는 **로컬 Sail 테스트 DB 기준**으로 수행했다.
- 운영 또는 공용 DB에서 동일한 `DROP` 명령을 실행하면 안 된다.
- 테스트 실패 원인은 DB FK 제약 조건이었다.

---

## 8. 결론

| 구분      | 내용                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| 직접 원인 | FK 참조 중인 parent 테이블에 `TRUNCATE` 실행 → MySQL 1701                         |
| 근본 원인 | migration `connection()` 미명시로 manage DB에 테이블 중복 생성                    |
| 즉시 조치 | manage DB에서 잘못 생성된 `example_parent` / `example_entries` 관련 테이블 `DROP` |
| 코드 개선 | `truncateConnection()`에 `FOREIGN_KEY_CHECKS=0/1` 감싸기                          |
| 재발 방지 | migration 작성 시 `Schema::connection()` 명시 철저화                              |

이번 오류의 직접 원인은 테스트 DB 초기화 중 FK가 걸린 테이블을 `TRUNCATE` 하면서 발생한 MySQL 1701 오류였다. 근본적으로는 tool DB에 있어야 할 테이블들이 manage DB에도 존재하고 있던 로컬 DB 상태 문제였으며, 해당 테이블을 manage DB에서 제거한 뒤 테스트가 정상 통과했다.

향후에는 migration 작성 시 connection을 명확히 지정하고, 테스트 DB 초기화 로직도 FK를 고려하도록 개선하는 것을 권장한다.
