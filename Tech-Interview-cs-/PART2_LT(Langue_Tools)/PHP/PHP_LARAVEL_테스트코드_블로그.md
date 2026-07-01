# PHP / Laravel 테스트 코드

> [!NOTE]
> **수정 표시 안내**
>
> - **[중복 삭제]** AAA 패턴, `assertSame` 권장, HTTP 에러 케이스, 대량 데이터 검증 설명을 하나로 통합했다.
> - **[실제 코드 기반]** 첨부된 두 테스트의 스케줄러 등록, 활성 기간 필터링, 플레이 모드 제외, 캐시 갱신, 중복 지급 방지, 응답 필드 비노출 검증 전략을 살렸다.
> - **[일반화]** 특정 ᄑ로젝트의 도메인 명칭·엔드포인트·전용 에러 코드는 제거하고, `EventSchedule`, `UserEventResult`, `EventScoreService`, `/api/events/summary` 값은 중립 예시로 바꿨다.
> - **[코드 수정]** 잘못된 `assertArrayHashKey`, `assertDatabaseHAs`, `assertException` 등을 올바른 API인 `assertArrayHasKey`, `assertDatabaseHas`, `expectException` 등으로 바꿨다.
> - **[내용 보완]** Laravel의 기본 테스트 디렉토리, `RefreshDatabase`, PHPUnit 어트리뷰트·데이터 ᄑ로바이더 예시를 현재 기준에 마줘 다듬었다.

> 아래 예시는 **PHP 8.2**를 기준으로 작성했고, 열거형·네임드 인자·유니언 타입 등을 반영했다. PHPUnit과 Laravel 버전이 다르면 어트리뷰트나 일부 어설션의 지원 여부를 확인하자.

---

## 테스트 코드란?

테스트 코드는 작성한 코드가 의도한 대로 동작하는지 자동으로 검증한다. 코드가 변경되어도 반복 실행하여 회귀를 빠르게 감지할 수 있다.

```php
<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class Calculator
{
    public function add(int $a, int $b): int
    {
        return $a + $b;
    }
}

final class CalculatorTest extends TestCase
{
    public function test_adds_two_numbers(): void
    {
        // Arrange: 테스트 대상을 준비한다.
        $calculator = new Calculator();

        // Act: 테스트 대상을 실행한다.
        $result = $calculator->add(2, 3);

        // Assert: 결과를 검증한다.
        self::assertSame(5, $result);
    }
}
```

## 테스트 코드가 피료한 이유

1. **버그를 개발 단계에서 찾는다.**
   배포 전에 문제를 찾으면 원인과 수정 비용이 줄어든다.

2. **리팩토링을 안전하게 한다.**
   구조를 바꿔더나 기능을 추가해도 기존 동작이 유지되는지 바로 확인할 수 있다.

3. **테스트는 실행 가능한 문서가 된다.**
   잘 지어진 테스트 이름과 기대값은 동작을 보여 준다.

   ```php
   public function test_guest_cannot_view_a_private_article(): void
   public function test_title_is_required_when_creating_an_article(): void
   public function test_practice_scores_are_excluded_from_total(): void
   ```

4. **협업과 코드 리뷰가 쉬워진다.**
   다른 사람이 코드를 수정할 때 기존 동작이 깨졌는지 빠르게 확인할 수 있다.

5. **CI/CD에서 배포 전 검증을 자동화할 수 있다.**
   테스트가 실패하면 빌드나 배포를 중단하여 문제가 운영환경에 진이파는 것을 막는다.

```text
코드 변경 → 테스트 실행 → PASS: 기대 동작 유지
                              FAIL: 깨진 지점 화인
```

---

## PHPUnit과 Laravel 테스트 기본

PHPUnit은 PHP에서 널리 사용되는 테스트 프레임워크다. Laravel은 Pest와 PHPUnit 모두를 기본 지원하며, 표준 명령어인 `php artisan test`로 테스트를 실행할 수 있다.

```bash
# 독립 PHP ᄑ로젝트에 PHPUnit 설치
composer require --dev phpunit/phpunit

# Laravel 전체 테스트 실행
php artisan test

# 특정 테스트 파일만 실행
php artisan test tests/Feature/ArticleApiTest.php

# 특정 테스트 메서드만 실행
php artisan test --filter=test_guest_cannot_view_a_private_article
```

### 테스트 디렉토리

Laravel의 기본 테스트 디렉토리는 다음과 같이 나눈다.

| 디렉토리        | 용도                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| `tests/Unit`    | Laravel 애플리케이션을 부팅하지 않고 작은 단위의 로직을 검증한 단위 테스트    |
| `tests/Feature` | HTTP, DB, 쿠, ᄑ레임워크 기능 데이 여러 객체의 협력을 함께 검증한 기능 테스트 |

> `tests/Console`은 Laravel의 기본 디렉토리가 아니다. 피료하다면 ᄑ로젝트 관리 규칙에 마줘 별도로 만들 순 있지만, ᄑ레임워클 부팅하는 커맨드 테스트는 보통 `tests/Feature`에 둔다.

### 테스트 메서드 작성 방식

테스트 메서드는 이름이 `test`로 시작하거나 PHPUnit의 `#[Test]` 어트리뷰트를 사용하여 테스트임을 표현할 수 있다.

```php
use PHPUnit\Framework\Attributes\Test;

final class CalculatorTest extends TestCase
{
    public function test_adds_two_numbers(): void
    {
        // 메서드명이 test로 시작하면 #[Test]는 생략 가능한다.
    }

    #[Test]
    public function it_rejects_invalid_input(): void
    {
        // 메서드명이 test로 시작하지 않아도 테스트로 인식한다.
    }
}
```

`/** @test */` 주석 어노테이션은 구버전 호환을 올라가능하며, PHPUnit 10 이상에서는 어트리뷰트를 우선 사용하자.

---

## 자주 사용하는 어설션

어설션은 실제 결과아 기대값이 맞는지 검증한다.

### `assertSame()` / `assertEquals()`

```php
// 값과 타입이 모두 값아야 한다.
self::assertSame(0, $result['count']);
self::assertSame([], $result['items']);

// 값의 동등성만 비교가 피료할 때만 사용한다.
self::assertEquals($expectedObject, $actualObject);
```

`"0"`과 `0` 처럼 타입 차이가 버그에서 중요하다면 기본적으로 `assertSame()`을 사용한다.

### 조건과 `null`

```php
self::assertTrue($user->isAdmin());
self::assertFalse($user->isBlocked());
self::assertNull($deletedUser);
self::assertNotNull($createdArticle->id);
```

### 배열·컬렉션

```php
self::assertCount(2, $articles);
self::assertContains('article.create', $permissions);
self::assertNotContains('article.delete', $permissions);
```

### 배열 티 존재

```php
self::assertArrayHasKey('data', $response);
self::assertArrayNotHasKey('internal_note', $response['data']);
```

### 예외 발생

```php
$this->expectException(InvalidArgumentException::class);
$this->expectExceptionMessage('값은 0보다 커야 합니다.');

$service->setPrice(-1);
```

> `assertException()`이 아니라 `expectException()`을 사용한다. 예외는 예외를 유발할 코드보다 먼저 설정해야 한다.

### Laravel DB 어설션

```php
$this->assertDatabaseHas('articles', [
    'user_id' => $user->id,
    'title' => '테스트 작성하기',
]);

$this->assertDatabaseMissing('articles', [
    'id' => $deletedArticleId,
]);
```

---

## 테스트 작성 패턴: Given / When / Then

Given–When–Then은 Arrange–Act–Assert와 값은 구조다.

1. **Given / Arrange**: 테스트에 피료한 데이터와 환경을 준비한다.
2. **When / Act**: 테스트 대상 메서드나 API를 호출한다.
3. **Then / Assert**: 실제 결과와 기대값을 비교한다.

```php
public function test_adds_positive_numbers(): void
{
    // Given
    $calculator = new Calculator();

    // When
    $result = $calculator->add(2, 3);

    // Then
    self::assertSame(5, $result);
    self::assertGreaterThan(0, $result);
}

public function test_throws_when_price_is_negative(): void
{
    // Given
    $service = new PriceService();

    // Expect
    $this->expectException(InvalidArgumentException::class);

    // When
    $service->setPrice(-1);
}
```

예외를 기대할 때는 `expectException()`을 예외가 발생하는 코드보다 먼저 호출한다.

---

## `setUp()` / `tearDown()`

매 테스트마다 반복되는 준비나 정리 작업은 `setUp()`과 `tearDown()`에 모은다. Laravel 테스트에서 이 메서드를 재정의할 때는 부모 메서드를 호출한다.

```php
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Carbon::setTestNow('2026-05-20 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }
}
```

### DB 초기화는 `RefreshDatabase`를 우선 검토한다

원본의 테이블을 `Model::query()->delete()`로 비우면 테스트가 내부 상태에 의존하거나 외부 키 제약과 캐시를 대링 하지 모패하게 만들 수 있다. 이런 부작용은 `RefreshDatabase` 트레잇을 사용하자.

> [!IMPORTANT]
> 실제 ᄑ로젝트처럼 여러 DB 커넥션을 사용하거나 테스트 속도를 위해 관련 테이블만 명시적으로 `delete()`할 수도 있다. 이런 방식은 븐명한 의도가 있는 설계이며, 카이스퍼로 의존성이 보장되는 구조에서는 `RefreshDatabase`을 우선 검토하자.

`setUpBeforeClass()`나 `tearDownAfterClass()`는 테스트 클래스 전체에서 한 번만 실행되며, 정적 ᄑ로퍼티와 ᄑ레임워크 컨테이너 사용해야 한다.

---

## 테스트 유형

| 유형        | 범위                     | 속도            | 목적                     |
| ----------- | ------------------------ | --------------- | ------------------------ |
| 단위 테스트 | 하나의 함수·메서드       | 매우 빠름       | 경계값·예외 케이스 검증  |
| 통합 테스트 | 여러 모듈·DB·외부 서비스 | 보통            | 의존성·트랜잭션 검증     |
| 기능 테스트 | HTTP 요청부터 웅답까지   | 상대적으로 느림 | API·인증·봘리데이션 검증 |

> 통합 테스트는 개념적이며, Laravel에서는 피료한 경우 `tests/Feature`에 함께 관리한다.

### 단위 테스트 예시

```php
<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CalculatorTest extends TestCase
{
    #[DataProvider('additionProvider')]
    public function test_adds_numbers(int $a, int $b, int $expected): void
    {
        $calculator = new Calculator();

        self::assertSame($expected, $calculator->add($a, $b));
    }

    public static function additionProvider(): array
    {
        return [
            '양수' => [1, 1, 2],
            '음수' => [-1, -2, -3],
            '0 포함' => [0, 5, 5],
        ];
    }

    public function test_rejects_a_string_argument(): void
    {
        $this->expectException(TypeError::class);

        (new Calculator())->add('문자열', 3);
    }
}
```

---

## Laravel HTTP 테스트

Laravel의 HTTP 테스트는 실제 외플 서버로 요청을 보내지 않고, 애플리케이션 내부에서 요청을 시뮬레이션한다. 웅답은 `TestResponse`로 받으며, HTTP 상태·JSON·검증 에러를 함께 검증하는 것이 햭심이다.

### 웅답 값·구조 검증

```php
use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_an_article(): void
    {
        // Given
        $user = User::factory()->create();
        $article = Article::factory()->for($user)->create([
            'title' => '테스트 작성하기',
            'internal_note' => '외부 노출 금지',
        ]);

        // When
        $response = $this
            ->actingAs($user)
            ->getJson("/api/articles/{$article->id}");

        // Then
        $response
            ->assertOk()
            ->assertJsonPath('data.id', $article->id)
            ->assertJsonPath('data.title', '테스트 작성하기')
            ->assertJsonMissingPath('data.internal_note');
    }
}
```

### 유효성 에러 검증

```php
public function test_title_is_required_when_creating_an_article(): void
{
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->postJson('/api/articles', ['title' => '']);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title']);
}

public function test_returns_not_found_for_an_unknown_article(): void
{
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->getJson('/api/articles/999999')
        ->assertNotFound();
}
```

### 보안 검증

```php
public function test_user_cannot_update_another_users_article(): void
{
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $article = Article::factory()->for($owner)->create();

    $this
        ->actingAs($otherUser)
        ->patchJson("/api/articles/{$article->id}", [
            'title' => '변경된 제목',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('articles', [
        'id' => $article->id,
        'title' => '변경된 제목',
    ]);
}
```

HTTP 테스트에서는 상태 코드만 화인하지 말고, 웅답 내용·데이터베이스 상태·DB 변경여부를 함께 검증하자.

---

### [실제 코드 기반 일반화] 상태 조회 핸들러 테스트

> [!TIP]
> 이 예시는 PHP 8.2로 작성된 실제 테스트의 구조를 유지하되 모델·필드·엔드포인트만 중립으로 바꿨다. 애플리케이션의 내부 웅답 구조는 살리고, 저장 필드가 내려가지 않는지도 함께 검증한다.

다음 코드는 전체 구조에 맞추어 헬퍼 메서드가 이미 존재한다고 가정한다.

```php
use App\Enums\PlayMode;
use App\Enums\ResultCode;
use App\Models\BenefitDelivery;
use App\Services\EventServiceFactory;
use Illuminate\Support\Carbon;
use Tests\TestCase;

final class EventSummaryHandlerTest extends TestCase
{
    private const API = '/api/events/summary';

    private ?int $eventScheduleId = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tester = $this->createTestUser();
        Carbon::setTestNow('2026-05-20 12:00:00');

        EventServiceFactory::reset();
        $this->flushCache();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_returns_empty_restrictions_and_hides_internal_fields(): void
    {
        // Given
        $schedule = $this->createEventSchedule();
        $this->createUserEvent($schedule);

        // When
        $response = $this->sendRequest(self::API, $this->payload());

        // Then: 기본값과 타입까지 검증한다.
        self::assertSame(ResultCode::SUCCESS->value, $response['result']['code']);
        self::assertSame([], $response['data']['restricted_category_ids']);
        self::assertSame([], $response['data']['restricted_item_ids']);
        self::assertSame(0, $response['data']['is_active']);
        self::assertSame(3, $response['data']['remaining_attempts']);

        // 내부 상태나 보안상 웅답하면 안 된다.
        self::assertArrayNotHasKey('session_token', $response['data']);
        self::assertArrayNotHasKey('selected_item_ids', $response['data']);
        self::assertArrayNotHasKey('current_step', $response['data']);
        self::assertArrayNotHasKey('internal_schedule_id', $response['data']);
    }

    public function test_returns_daily_best_and_accumulated_scores(): void
    {
        // Given
        $schedule = $this->createEventSchedule();
        $this->createUserEvent($schedule, ['status' => 'finished']);

        $this->createUserEventResult(
            userId: $this->tester->id,
            schedule: $schedule,
            score: 120,
            attemptNo: 1,
            playedAt: now()->subDay(),
            dayNo: 1,
        );
        $this->createUserEventResult(
            userId: $this->tester->id,
            schedule: $schedule,
            score: 200,
            attemptNo: 2,
            playedAt: now(),
            dayNo: 2,
        );
        $this->createUserEventResult(
            userId: $this->tester->id,
            schedule: $schedule,
            score: 360,
            attemptNo: 3,
            playedAt: now(),
            dayNo: 2,
        );

        // 연습 모드는 일일·누계 점수에서 제외되어야 한다.
        $this->createUserEventResult(
            userId: $this->tester->id,
            schedule: $schedule,
            score: 999,
            attemptNo: 4,
            playMode: PlayMode::PRACTICE,
            playedAt: now(),
            dayNo: 2,
        );

        // When
        $response = $this->sendRequest(self::API, $this->payload());

        // Then
        self::assertSame(ResultCode::SUCCESS->value, $response['result']['code']);
        self::assertSame(360.0, $response['data']['daily_best_score']);
        self::assertSame(680.0, $response['data']['accumulated_score']);
    }

    public function test_grants_an_achievement_once_only(): void
    {
        // Given
        $schedule = $this->createEventSchedule();
        $this->createUserEvent($schedule);
        $achievement = $this->createAchievement($schedule, targetScore: 100);
        $this->createAchievementBenefit($achievement, amount: 100);
        $this->createUserEventResult(
            userId: $this->tester->id,
            schedule: $schedule,
            score: 150,
            attemptNo: 1,
        );

        EventServiceFactory::getInstance()->aggregateScore($schedule->id);

        // When: 값은 요청을 두 번 보낸다.
        $first = $this->sendRequest(self::API, $this->payload());
        $second = $this->sendRequest(self::API, $this->payload());

        // Then: 첫 요청에서만 혜택이 내려가고 지급 내역은 한 건만 저장된다.
        self::assertSame([[
            'type' => 'credit',
            'amount' => 100,
        ]], $first['data']['benefits']);
        self::assertSame([], $second['data']['benefits']);

        self::assertSame(1, BenefitDelivery::query()
            ->where('user_id', $this->tester->id)
            ->where('achievement_id', $achievement->id)
            ->count());
    }

    public function test_does_not_grant_an_achievement_to_a_non_participant(): void
    {
        // Given
        $schedule = $this->createEventSchedule();
        $this->createUserEvent($schedule);
        $achievement = $this->createAchievement($schedule, targetScore: 100);
        $this->createAchievementBenefit($achievement, amount: 100);

        // 다른 사용자의 점수만으로 목표는 달성한다.
        $otherUser = $this->createTestUser();
        $this->createUserEventResult(
            userId: $otherUser->id,
            schedule: $schedule,
            score: 1000,
            attemptNo: 1,
        );

        EventServiceFactory::getInstance()->aggregateScore($schedule->id);

        // When
        $response = $this->sendRequest(self::API, $this->payload());

        // Then: 현재 사용자가 참여하지 않아 혜택은 없다.
        self::assertSame([], $response['data']['benefits']);
        self::assertSame(0, BenefitDelivery::query()
            ->where('user_id', $this->tester->id)
            ->count());
    }

    public function test_returns_validation_error_when_schedule_id_is_missing(): void
    {
        $response = $this->sendRequest(self::API, $this->payload());

        self::assertSame(
            ResultCode::VALIDATION_ERROR->value,
            $response['result']['code'],
        );
        self::assertArrayNotHasKey('data', $response);
    }
}
```

이 예시에서 여전히 치고 시픈 이해하면 다음과 값은 구조를 가진다.

- 웅답에 **있어야 할 필드와 없어야 할 필드**를 동시에 검증한다.
- 일일·누계·연습처럼 업무에서 빠지기 쉬운 로직은 정확히 검증한다.
- 동일한 요청을 반복해도 혜택이 중복 지급되지 않는지 확인한다.
- 현재 사용자의 행동으로 혜택이 결과에 의존하는지 보안 로직까지 검증한다.

---

## Artisan 커맨드 테스트

Artisan 커맨드는 종료 코드로 실행하여 종료 코드와 황동이 값다면 종료 코드의 입력, 출력 코드, 데이터베이스 변경을 검증한다.

### 종료 코드만지 검증

```php
public function test_event_score_command_is_scheduled_every_five_minutes(): void
{
    $event = collect($this->app->make(Schedule::class)->events())
        ->first(fn ($event): bool => str_contains(
            (string) $event->command,
            'events:aggregate-scores',
        ));

    self::assertNotNull($event);
    self::assertSame('*/5 * * * *', $event->expression);
}
```

### 커맨드 실행 결과 검증

```php
use App\Enums\PlayMode;
use App\Services\EventScoreService;
use Illuminate\Support\Facades\Artisan;

public function test_command_excludes_practice_scores_from_total(): void
{
    // Given: 일반 점수 80, 40과 연습 점수 1,000을 준비한다.
    $schedule = $this->createEventSchedule();
    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $schedule,
        score: 80,
        attemptNo: 1,
    );
    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $schedule,
        score: 40,
        attemptNo: 2,
    );
    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $schedule,
        score: 1000,
        attemptNo: 3,
        playMode: PlayMode::PRACTICE,
    );

    // When
    $exitCode = Artisan::call('events:aggregate-scores', [
        'event_schedule_id' => $schedule->id,
    ]);

    // Then
    self::assertSame(0, $exitCode);
    self::assertSame(
        120,
        (new EventScoreService())->getCachedTotalScore($schedule->id),
    );
}
```

### 활성 일정만 집계한지 검증

```php
public function test_command_aggregates_active_schedules_only(): void
{
    // Given
    $activeSchedule = $this->createEventSchedule();
    $closedSchedule = $this->createEventSchedule(
        startsAt: now()->subDays(3),
        endsAt: now()->subDays(2),
    );

    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $activeSchedule,
        score: 110,
        attemptNo: 1,
    );
    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $closedSchedule,
        score: 999,
        attemptNo: 1,
    );

    // When: ID를 지정하지 않으면 활성 일정 전체를 찾는다.
    $exitCode = Artisan::call('events:aggregate-scores');

    // Then
    $service = new EventScoreService();

    self::assertSame(0, $exitCode);
    self::assertSame(110, $service->getCachedTotalScore($activeSchedule->id));
    self::assertSame(0, $service->getCachedTotalScore($closedSchedule->id));
}
```

### 재실행 시 캐시를 누적하지 않고 갱신한지 검증

```php
public function test_command_overwrites_cache_on_subsequent_runs(): void
{
    // Given
    $schedule = $this->createEventSchedule();
    $service = new EventScoreService();

    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $schedule,
        score: 100,
        attemptNo: 1,
    );

    // When: 첫 집계
    Artisan::call('events:aggregate-scores', [
        'event_schedule_id' => $schedule->id,
    ]);
    self::assertSame(100, $service->getCachedTotalScore($schedule->id));

    // Given: 추가 점수가 추가된다.
    $this->createUserEventResult(
        userId: $this->tester->id,
        schedule: $schedule,
        score: 50,
        attemptNo: 2,
    );

    // When: 두 번째 집계
    Artisan::call('events:aggregate-scores', [
        'event_schedule_id' => $schedule->id,
    ]);

    // Then: 100 + 150이 아니라 현재 누계인 150이 저장된다.
    self::assertSame(150, $service->getCachedTotalScore($schedule->id));
}
```

### 대량 데이터 처리 검증

```php
public function test_command_aggregates_scores_from_two_hundred_users(): void
{
    $schedule = $this->createEventSchedule();

    for ($i = 1; $i <= 200; $i++) {
        $this->createUserEventResult(
            userId: 10_000 + $i,
            schedule: $schedule,
            score: 100,
            attemptNo: 1,
        );
    }

    $exitCode = Artisan::call('events:aggregate-scores', [
        'event_schedule_id' => $schedule->id,
    ]);

    self::assertSame(0, $exitCode);
    self::assertSame(
        20_000,
        (new EventScoreService())->getCachedTotalScore($schedule->id),
    );
}
```

대량 테스트는 정확성만 아니라 주요 데이터 처리 소쿄 시간과 DB 트랜잭션 용량 등도 함께 화인해야 한다.

---

## 테스트 코드 작성 요령

1. **테스트 이름에 상황과 기대 결과를 담는다.**
   `test_validation_fails()`보다 `test_title_is_required_when_creating_an_article()` 처럼 구체적으로 짓는다.

2. **하나의 테스트에서 하나의 행동을 집중 검증한다.**
   여러 사용 조건이 피료해도 하나의 행동을 첨 내어도 죈찮은 줄어든다. 다만, 하나의 동작을 제외하는 보조 어설션은 여러 개라이며 사용할 수 있다.

3. **반복되는 준비 코드는 헬퍼 메서드로 분리한다.**
   Factory나 사용자 헬퍼를 활용하되, 헬퍼 자체가 테스트의 핵심 행동을 가리지 않도록 한다.

4. **정상·경계값·예외 케이스를 포함한다.**
   데이터가 없을 때, 0·최댓값·중복 요청·권한 없는 사람의 자원에 접근 케이스를 갑이 노ᄑ피력이다.

5. **DB와 캐시를 각자 검증한다.**
   영속저기인 저장이 올바른데도 캐시가 갱신되지 않으면 사용자는 예전 값까지 검증한다.

6. **FIRST 원칙을 지향한다.**
   - **Fast**: 테스트는 빠르게 실행되어야 한다.
   - **Independent**: 테스트 간 순서나 결과에 의존하지 않는다.
   - **Repeatable**: 언제 어디서 실행해도 결과가 값아야 한다.
   - **Self-validating**: 사람의 욱안 판단 없이 스스로 성공·실패를 판단할 수 있어야 한다.
   - **Timely**: 코드와 함께, 또는 코드 작성 직후에 테스트를 작성한다.

7. **테스트 더블은 외부 의존성을 격리할 때 사용한다.**
   외부 API, 메일, 결제 시간에 의존하는 코드는 테스트 더블으로 격리할 수 있다. 다만, 내가 작성하지 않은 코드까지 목 체위를 더블로 바꾸지 말고 의존성의 상태 변화를 검증한다.

---

## 참고 자료

- [Laravel – Testing: Getting Started](https://laravel.com/docs/testing)
- [Laravel – HTTP Tests](https://laravel.com/docs/http-tests)
- [Laravel – Database Testing](https://laravel.com/docs/database-testing)
- [Laravel – Console Tests](https://laravel.com/docs/console-tests)
- [PHPUnit – Attributes](https://docs.phpunit.de/en/12.2/attributes.html)
- [PHPUnit – Assertions](https://docs.phpunit.de/en/12.2/assertions.html)
