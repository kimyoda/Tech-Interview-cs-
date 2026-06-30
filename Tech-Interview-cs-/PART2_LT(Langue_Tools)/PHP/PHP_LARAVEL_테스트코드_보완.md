# PHP / LARAVEL 테스트 코드

### 테스트 코드는?

테스트 코드는 내가 작성한 코드가 의도한 대로 동작하는지 자동으로 검증하는 코드다. 테스트는 반복 실행이 가능하고 코드가 변경되면 자동으로 회귀를 감지한다.
PHPUnit 문서에서 테스트는 Arrange-Act-Assert(AAA) 패턴을 따르는 것이 좋다고 설명한다. 필요한 상태를 준비, 테스트 대상 코드를 실행한 뒤, 결과를 검증하는 세 단계를 구분하라고 강조한다.

```php
// 간단한 게산기와 그에 대한 테스트 예시
class Calculator {
   public function add(int $a, int $b): int
   {
      return $a + $b;
   }
}

class CalculatorTest extends TestCase {
   public function testAdd(): void
   {
        // Arrange: 준비
        $calculator = new Calculator();

        // Act: 실행
        $result = $calculator->add(2, 3);

        // Assert: 검증
        $this->assertEquals(5, $result);
   }
}
```

### 테스트 코드가 필요한 이유는?

**1. 개발 단계에서 버그를 잡는다.**
버그를 개발 단계에서 발견하면 고치기 쉽고 비용도 적게 든다. 배포 후 라이브 환경에서 발견되는 버그는 수정에 몇 배용괴 들 수 있다.
테스트는 배포 전 미리 잠재적인 문제를 찾아낸다.

**2. 리팩토링을 안전하게 한다**.
새로운 기능 추가나 구조 변경을 할 때 기존 동작이 깨지지 않았는 지 테스트를 통해 확인할 수 있다. 테스트가 모두 통과하면 안심하고 배포할 수 있고, 실패하는 경우 어디가 문제인지 찾기가 훨씬 수월하다.

```
기존 코드 변경 → 테스트 실행 →  전부 PASS = 안전하게 배포 가능
                               FAIL 발생 = 어디가 망가졌는지 즉시 확인
```

**3. 테스트는 문서다**.
좋은 테스트는 메소드명과 코드만 읽어도 기능의 동작 조건과 결과를 이해할 수 있게 한다. 테스트 가 곧 명세가 되고 코드 흐름을 빠르게 파악할 수 있다.

```php
// 이 테스트 이름만 봐도 스펙이 보인다
public function testAggregateMiniGlobalMissionsCommandUpdatesCachedTotalScore(): void
public function testCommandExcludesPracticeScoreFromAggregation(): void
public function testDoesNotGrantGlobalMissionRewardToNonParticipant(): void
```

**4. 팀 협업이 원활하게 할 수 있다**.
다른 사람이 작성한 코드를 수정할 떄 테스트가 있으면 내가 깨뜨린 부분을 확인하는 것이 더 편한다. 코드 리뷰 또한 테스트 케이스를 기반으로 구체적으로 진행할 수 있어 협업 효율이 높아진다.

**5. 배포도 자동으로 검증할 수 있다**.
CI/CD 파이프라인에 테스트 스위트를 연결하면 배포 직전에 전체 테스트를 자동으로 실행할 수 있다. 테스트가 실패하면 배포가 중단되어 문제르르 미리 차단한다.

---

## PHPUnit 개념

PHP의 표준 테스트 프레임워크는 **PHPUnit**이다. Laravel은 PHPUnit을 기본으로 내장하고 있어 별도 설치 없이 바로 사용할 수 있다.

```bash
# PHPUnit 독립 설치 (Laravel 없이 쓸 때)
composer require --dev phpunit/phpunit

# Laravel 프로젝트에 테스트 실행
php artisan test

# 특정 테스트 파일만 실행
php artisan test tests/Feature/MiniExampleScheduleTest.php

# 특정 메소드만 실행
php artisan test --filter testCommandExcludesExampleFromAggregation
```

### 테스트 클래스 구조

테스트는 `tests/` 디렉터리 아래에 저장된다. 다음과 같이 나누어 관리한다.

| 디렉터리        | 설명                                                   |
| --------------- | ------------------------------------------------------ |
| `tests/Unit`    | 순수 로직을 검증하는 단위 테스트                       |
| `tests/Feature` | HTTP, DB, 큐 등 프레임워크 기능을 포함하는 기능 테스트 |
| `tests/Console` | Artisan 커맨드나 스케줄러 테스트                       |

각 테스트 클래스는 `TestCase`를 상속, 테스트 메소드는 `test`로 시작 `#[Test]` 어트리뷰트를 사용한다. PHPUnit 10부터는 주석 기반 어노테이션 대신 **어트리뷰트** 사용을 권장, 그리고 이외에 다양한 어트리뷰트가 제공된다.

```php
class CalculatorTest extends TestCase
{
    // ✅ 메소드명이 test로 시작
    public function testAdd(): void { ... }

    // ✅ @test 어노테이션 사용
    /** @test */
    public function it_adds_two_numbers(): void { ... }
}
```

---

## 핵심 어설션 메서드

어설션은 "값이 이래야 한다"를 선언하는 검증 메소드다. 일부 중요한 어설션은 다음과 같다.

### assertEquals / assertSame(expected, actual)

값과 타입이 모두 같은지 검증한다. API 응답에서 문자열 "0"과 정수 `0`을 구분하고 싶은 경우 유용하다

```php
// 값이 같은지 (타입 변환 허용)
$this->assertEquals(5, $result);

// 값과 타입이 모두 같은 지(엄격비교)
$this->assertSame(0, $response['response']['is_playing']); // int 0 확인
$this->assertSame([], $response['response']['reward_data']); // 빈 배열인지 확인
```

> `assertSame`을 쓰면 타입까지 검증되어 `"0"`, `0` 같은 애매한 버그를 잡을 수 있다.

### assertTrue / assertFalse

조건이 참인지 / 거짓인지 확인한다

```php
$this->assertTrue($user->isAdmin());
$this->assertFalse($result > 0);
```

### assertNull(value) / assertNotNull(value)

값이 `null`인지 아닌지 검증한다

```php
// 유저가 삭제됐는지 확인
$user->delete();
$deleteUser = User::find($userId);
$this->assertNull($deleteUser); // 삭제 후 조회 결과는 null이어야 한다
```

### assertCount(expectedCount, iterable)

배열이나 컬렉션의 개수를 확인한다

```php
// 배열/컬렉션 크기 확인
$ths->assertCount(2, $response['response']['banned_year_list']);
```

### assertContains(value, array) / assertContains(value, array)

특정 값이 포함되는지/되지 않는지 확인한다

```php
$permissions = $admin->getPermissions();
$this->assertContains('delete_user', $paermissions);
$this->assertNotContains('edit_post', $permissions);
```

### assertArrayHashKey(key, array) / assertArrayNotHasKey(key, array)

배열에 키가 존재하는지 확인한다. 필드가 응답에 포함되지 않아야 할 때 사용한다

```php
// 응답에 있어선 안 되는 빌드가 내려오지 않는지 확인
$this->assertArrayNotHasKey('play_card_id', $response['response']);
$this->assertArrayNotHasKey('current_score', $response['response']);
$this->assertArrayNotHasKey('play_uuid', $response['response']);
```

### assertDatabaseHAs(table, conditions) / assertDatabaseMissing(table, conditions)

DB에 원하는 데이터가 존재하는지 검증할 수 있다

```php
// DB에 데이터가 저장되었는지 확인
$this->assertDatabaseHas('user_examples', [
    'user_id' => $this->tester->id,
    'example_schedule_id' => $miniSchedule->id,
    'play_count' => 3,
    'play_example' => 4,
], 'user');
// 두 번째 DB 커넥션 지정도 가능
```

### assertException(class)

특정 예외가 발생해야 테스트를 통과시킨다

```php
$this->expectException(InvalidArgumentException::class);
$this->calculator->add('문자열', 3); // 예외가 발생해야 테스트 통과
```

모든 테스트는 가능한 한 `assertSame`처럼 엄격한 어설션을 사용하여 타입까지 검증하도록 하는 것이 좋다.
이를 통해 문자열이나 숫자가 같은 데이터 이슈를 초기에 발견할 수 있다.

---

## 테스트 작성 패턴: Given / When / Then

테스트를 구성할 때 Given -> When -> Then 패턴(또는 Arrange -> Act -> Assert)을 적용하면 가독성이 높아진다. PHPUnit 매뉴얼에서 테스트는 이 세 단계로 분리해 작성하라고 권장한다

1. Given / Arrange - 테스트에 필요한 데이터와 환경을 준비한다
2. When / Act - 테스트 대상 메소드나 API를 호출한다
3. Then / Assert - 결과가 기대값과 일치하는지 검증한다.

예외를 기대하는 경우 Arrange - Act - Asser 순서를 사용한다.
먼저 `expectException()`으로 예외를 설정, 다음 동작을 수행해야 한다

```php
public function testAddWithPositiveNumbers(): void
{
    // Given: 더할 두 숫자를 준비한다
    $a = 2;
    $b = 3;

    // When: 더하기 메소드를 호출한다
    $result = $this->calculator->add($a, $b);

    // Then: 결과가 5인지, 양수인지 검증한다
    self::assertEquals(5, $result);
    self::assertTrue($result > 0);
}

public function testThrowsExceptionForInvalidInput(): void
{
    // Expect: 예외 설정 (Arrange와 Expect를 먼저)
    $this->expectException(InvalidArgumentException::class);

    // Act: 잘못된 입력으로 호출
    $this->calculator->add('문자열', 3);
}
```

---

## setUp / tearDown

테스트 전에 공통 상태를 설정하고 테스트 후에 정리해야 한다. `setUp()`과 `tearDown()` 메소드를 활용하면 매 테스트마다 반복되는 준비 작업을 줄일 수 있다.

```php
protected function setUp(): void
{
    parent::setUp();

    // 테스트 유저 생성
    $this->tester = $this->createTestUser();

    // 관련 테이블 초기화 (테스트 독립성 확보)
    MiniSchedule::query()->delete();
    UserMini::query()->delete();
    UserMiniResult::query()->delete();

    // 시간 고정 – 시간에 의존하는 로직을 안정적으로 테스트
    Carbon::setTestNow('2026-05-20 12:00:00');

    // 싱글턴/캐시 초기화
    MiniServiceFactory::reset();
    $this->flushCache();
}

protected function tearDown(): void
{
    // 고정된 시간 해제
    Carbon::setTestNow();

    // 기타 정리 작업 (임시 파일 삭제 등)
    parent::tearDown();
}
```

> 테이블을 직접 `delete` 하는 이유
> Laravel의 `RefreshDatabase` 트레이트를 사용하면 마이그레이션을 재실행하여 모든 테이블을 비우고, 테이블이 많아질수록 시간이 오래 걸릴 수 있다. 테스트에서 사용하는 테이블만 선택적으로 초기화하면 빠르게 테스트를 실해앟ㄹ 수 있다. 각 퀘스트 간 의존성이 완전히 제거되도록 주의해야 한다.

### setUpBeforeClass() / tearDownAfterClass()

테스트 클래스 전체에서 한 번만 실행해야 하는 무거운 세팅에 사용한다

```php
public static function setUpBeforeClass(): void
{
    parent::setUpBeforeClass();
    // 클래스 전체에서 한 번만 실행 (static)
}
```

---

## 테스트 유형

테스트는 범위와 목적에 따라 크게 세 가지로 나뉜다
| 유형 | 범위 | 속도 | 목적 |
|---|---|---|---|
| 단위 테스트 (Unit Test) | 함수/메소드 하나 | 매우 빠름 | 비지니스 로직 검증 |
| 통합 테스트(Intergration Test) | 여러 모듈, DB 등 | 보통 | 모듈 간 연동 검증 |
| 기능 테스트 (Feature Test) | HTTP 요청-응답 전체 | 느림 | 실제 API 동작 검증 |

- 단위 테스트는 순수 PHP 로직을 격리해 테스트 한다. 외부 의존성을 최소화하고, 예외 케이스나 경계 값을 집중적으로 검증한다
- 통합 테스트는 여러 컴포넌트와 데이터베이스가 함께 동작할 때 올바른지 확인한다. 컨트롤러와 서비스 간 상호작용, DB 쿼리의 실제 결과 등을 확인한다.
- 기능 테스트는 HTTP 요청부터 응답까지 전 과정을 시뮬레이션 한다. Laravel의 `actingAs()` 메소드를 이용해 로그인 유저를 설정, `post()/get()` 메소드로 API를 호출해 결과를 검증한다.

### 단위 테스트 예시 — 순수 계산 로직

```php
class CalculatorTest extends TestCase
{
    protected Calculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new Calculator();
    }

    public function testAddWithPositiveNumbers(): void
    {
        self::assertEquals(5, $this->calculator->add(2, 3));
    }

    public function testAddWithNegativeNumbers(): void
    {
        self::assertEquals(-3, $this->calculator->add(-1, -2));
        self::assertFalse($this->calculator->add(-1, -2) > 0);
    }

    public function testAddThrowsExceptionOnInvalidInput(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->calculator->add('문자열', 3);
    }

    /**
     * @dataProvider additionProvider
     */
    public function testAddWithDataProvider(int $a, int $b, int $expected): void
    {
        self::assertEquals($expected, $this->calculator->add($a, $b));
    }

    public function additionProvider(): array
    {
        return [
            '양수 더하기'  => [1,  1,  2],
            '큰 숫자 더하기' => [10, 20, 30],
            '0 포함'      => [0,  5,  5],
        ];
    }
}
```

---

## 실제 패턴: Laravel HTTP 테스트

Laravel의 기능 테스트를 활용하면 실제 API 호출처럼 요청을 보내고 응답을 검증할 수 있다. 있어야 하는 값과 있으면 안되는 필드를 동시에 검증하는 것이다.

### 기본 구조

```php
class TopHandlerTest extends TestCase
{
    private const API = '/api/mini/top';

    public function setUp(): void
    {
        parent::setUp();

        // 테스트 유저 생성
        $this->tester = $this->createTestUser();

        // 관련 테이블 초기화
        MiniSchedule::query()->delete();
        UserMini::query()->delete();
        UserMiniResult::query()->delete();

        // 시간 고정
        Carbon::setTestNow('2026-05-20 12:00:00');

        MiniServiceFactory::reset();
        $this->flushCache();
    }

    // ...
}
```

### API 응답 구조 검증

응답에 **있어야 할 값**과 **없어야 할 필드**를 동시에 검증하는 것이 핵심이다.

```php
public function testReturnsEmptyBannedLists(): void
{
    // Given: 기본 스케줄과 유저 미니 데이터
    $miniSchedule = $this->createMiniSchedule();
    $this->createUserMini($miniSchedule);

    // When: API 호출
    $response = $this->sendRequest(self::API, $this->payload());

    // Then: 응답 코드와 구조 검증
    $this->assertEquals(ErrorCode::OK->value, $response['result']['code']);

    // 있어야 할 값
    $this->assertSame([], $response['response']['banned_year_list']);
    $this->assertSame([], $response['response']['banned_card_ids']);
    $this->assertEquals(3, $response['response']['remain_count']);

    // 있으면 안 되는 필드 (보안/스펙상 내려가면 안 됨)
    $this->assertArrayNotHasKey('mini_schedule_id', $response['response']);
    $this->assertArrayNotHasKey('cooldown_card_data', $response['response']);
}
```

### 에러 코드 검증

```php
// 유저 미니 데이터가 없을 때 NOT_EXIST_DATA 에러 반환 확인
public function testNotExistDataWhenUserMiniDoesNotExist(): void
{
    $this->createMiniSchedule();

    $response = $this->sendRequest(self::API, $this->payload());

    $this->assertEquals(ErrorCode::NOT_EXIST_DATA->value, $response['result']['code']);
}

// 필수 파라미터 누락 시 VALIDATION 에러 반환 확인
public function testValidationWhenMiniScheduleIdIsMissing(): void
{
    $response = $this->sendRequest(self::API, $this->payload());

    $this->assertEquals(ErrorCode::VALIDATION->value, $response['result']['code']);
}
```

### 보안 검증 — 비참여자에게 보상을 주지 않는다

```php
public function testDoesNotGrantGlobalMissionRewardToNonParticipant(): void
{
    // Given: 글로벌 미션 달성 조건 설정
    $miniSchedule = $this->createMiniSchedule();
    $this->createUserMini($miniSchedule);
    $reachedMission = $this->createGlobalMission($miniSchedule, 100, 2001);
    $this->createGlobalReward($reachedMission, RewardType::FREE_COIN, 0, 100);

    // 다른 유저의 점수로만 미션 달성
    $otherUser = $this->createTestUser();
    $this->createUserMiniResult($otherUser->id, $miniSchedule, 1000, 1);
    MiniServiceFactory::getInstance()->aggregateGlobalMission($miniSchedule->id);

    // When: 테스트 유저가 API 호출
    $response = $this->sendRequest(self::API, $this->payload());

    // Then: 본인이 참여하지 않았으므로 보상 없음
    $this->assertEquals(ErrorCode::OK->value, $response['result']['code']);
    $this->assertSame([], $response['response']['reward_data']);
    $this->assertEquals(0, UserPresentBox::query()
        ->where('user_id', $this->tester->id)
        ->count());
}
```

API 테스트에서 응답 코드와 응답 구조를 함께 검증해야 한다. `assertSame`으로 타입까지 검증하는 습관을 들이는 것이 필요하다.
에러 케이스도 테스트하는 것이 필요하다. 필수 파라미터가 없을 때 `VALIDATION`에러를 반환하는지, 존재하지 않는 자원에 접근할 때 `NOT_EXIST_DATA` 에러가 나오는지 확인한다.

---

## Artisan Command
