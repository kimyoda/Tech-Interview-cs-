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
(`manage`.`model_has_permissions`,
 CONSTRAINT `model_has_permissions_permission_id_foreign`)
(Connection: manage, SQL: truncate table `permissions`)
```

권한 테이블 정리 이후 테스트를 재실행하자 이번에는 Telescope 테이블에서 동일한 유형의 오류가 추가 발생했다.

```
Cannot truncate a table referenced in a foreign key constraint
(`manage`.`telescope_entries_tags`,
 CONSTRAINT `telescope_entries_tags_entry_uuid_foreign`)
(Connection: manage, SQL: truncate table `telescope_entries`)
```

---

## 3. 원인 분석
