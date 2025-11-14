# 🌐 PHP*Laravel*테스트 코드

### 📚 목차

1. [테스트 코드란?](#)
2. [왜 테스트 코드가 필요한가?](#)
3. [PHPUnit 기본 개념](#)
4. [테스트 메소드 & 어설션](#)
5. [실전 테스트 패턴](#)

---

## 1.테스트 코드란?

### 1-1. 🐘 테스트 코드 개념

- 테스트 코드는 작성한 코드가 의도대로 동작하는지 자동으로 검증하는 코드이다.
- 신뢰성과 유지보수성을 보장을 해야한다.
- CS 이론적으로, 소프트웨어는 입력에 대한 출력의 예측 가능성을 강조하고, 테스트는 이를 검증하는 과정이다.
- 테스트 코드는 예상 동작을 수학적으로 증명하는 비슷한 역할을 한다.

```php
class Calculator {
    public function add($a, $b) {
        return $a + $b;
    }
}

// Test code 테스트 코드
class CalculatorTest extends TestCase {
    public function testAdd() {
        $calculator = new Calculator();
        $result = $calculator->add(2, 3);

        $this->assertEquals(5, $result); // 2 + 3 이 5인지 검증
    }
}
```

### 1-2. 이해하기

1. 회원가입 테스트 -> 가입이 되는가?
2. 로그인 테스트 -> 로그인이 되는가?
3. 결제 테스트 -> 결제가 정상인가?
4. 권한 테스트 -> 권한 체크가 되는가?

## 2. 테스트 코드가 왜 필요한지?

### 2-1. 버그 조기 발견

- 코드가 복잡할수록 큰 문제가 생길 확률이 높다.
- 테스트를 통해 개발 단계에서 버그를 잡아 이르 대비할 수 있다.

### 2-2. 코드 리팩토링

- 기능을 추가하거나 코드를 개선할 때 기존의 기능이 꺠지지 않도록 한다.
- 해당 코드 추가로 다른 부분이 망가지는 경우를 대비할 수 있다.

### 2-3. 팀 협업

- 테스트 코드는 코드의 문서화 역할을 한다. 안전하게 수정할 수 있다.

### 2-4. 성능과 안정성 향상

- 자동화된 테스트를 통해 배포 전 검증을 자동화하여, 라이브할 때 대비를 할 수 있다.

### 2-5. 비즈니스 가치

- 사용자 경험을 보호할 수 있다.

-> 즉 위와 같은 과정을 통해 제품이나 해당 기술의 안전성을 높이는 방법이라고 생각한다.

## 3. PHP에서 테스트 코드 작성

#### PHPUnit의 기본 개념과 메소드

- PHP의 대표적인 테스트 프레임 워크는 PHP Unit이다.
- TDD(Test-Driven Development)나 BDD(Behavior-Driven Development)를 지원한다.
- 객체 지향적인 테스트를 쉽게 작성 할 수 있다.
- PHPUnit은 PHP의 표준 테스트 도구, Composer를 설치(`composer require --dev phpunit/phpunit`)을 입력하면 바로 사용할 수 있다.

### 3-1. 주요 메소드와 함수: 이름과 역할

- PHPUnit 테스트 캘르스는 `TestCase`를 상속받아 작성되고, 각 테스트 메소드는 `test`로 시작한다. 아래는 자주 사용되는 메소드들이다.

- `setUp()`: 각 테스트 메소드 전에 실행되는 초기화 메소드, 테스트 환경을 준비한다.(사용자 인스턴스를 미리 만들어 중복 코드를 피한다)

```php
protected function setup(): void
{
    $this->calculator = new Calculator();
}
```

- `tearDown()`: 각 테스트 후 실행되는 정리 메소드, 리소스를 해제한다.(임시 파일 삭제 등), 테스트 후 객체 삭제로 메모리를 정리한다.

```php
protected function tearDown(): void
{
    unset($this->calculator);
}

```

- `assertEquals($expected, $actual)`: 예상 값과 실제 값이 같은지 검증한다. 가장 기본적인 어설션이다.
  - 계산결과 예상과 같은지
  - 저장된 데이터가 입력값과 같은지
  - API 응답이 기대값과 같은지

```php
self::assertEquals(5, $this->calculator->add(2, 3)); // 2 + 3 = 5 인지 확인
```

- `assertTrue($condition)/ assertFalse($condition)`: 조건이 참, 거짓인지 확인한다.
  - 로그인 성공, 실패 여부
  - 권한 체크 결과
  - 유효성 검사 통과/실패

```php
self:assertTrue($this->calculator->isPositive(5)); // 5가 양수인지 확인
```

- `assertNotEmpty()/ assertEmpty()`: 값이 비어있지 않은지, 들어 있는지 확인한다.

```php
self::assertNotEmpty($this->calcualtor->getHistory()); // 계산 기록 배열이 비어 있지 않은지 확인
```

- `assertInstanceOf()`: 객체가 특정 클래스 인스턴스인지

```php
self::assertInstanceOf(Calculator::class, $this->calculator); // 객체가 Calculator 클래스인지 확인
```

- `assertThrows($exceptionClass, $callback)`: 예외가 발생하는 지 확인

```php
self::assertThrows(InvalidArgumentException::class, function( { $this->calculator->add('a', 3); })); // 문자열 입력 시 예외 발생 확인s
```

- `aassertNull/assertNotNull()`: 값이 비어있는 지 확인한다.
  - 데이터가 삭제되었는 지 확인
  - 조회 결과가 존재하는지 확인
  - 선택적 필드가 비어있는 지 확인

```php
assertNull($variable, $message = '')
assertNotNull($variable, $message = '')

$user = User::factory()->create();
$userId = $user->id;

$user->delete();
$deletedUser = User::find($userId);
$this->assertNull($deletedUser);
```

- `assertCount()`: 개수를 확인한다.
  - 배열이나 컬렉션의 크기 확인
  - 검색 결과 개수 확인
  - 목록의 아이템 수 확인 등

```php
assertCount($expectedCount, $haystack, $message = '')

public function testCartItemCount()
{
    $cart = new ShoppingCart();
    $cart->addItem('상품A');
    $cart->addItem('상품B');
    $cart->addItem('상품C');

    $this->assertCount(3, $cart->getItems());
    // 장바구니에 3개의 상품이 있는 지 확인s
}
```

- `assertContains()/assertNotContains()`: 포함 여부를 확인한다
  - 배열에 특정 값이 있는 지 확인
  - 권한 목록에 특정 권한이 있는 지 확인
  - 태그 목록에 특정 태그가 있는지

```php
assertContains($needle, $haystack, $message = '')
assertNotContains($needle, $haystack, $message = '')

// 권한 확인
public function testUserPermissions()
{
    $admin = User::factory()->admin()->create();
    $permissions = $admin->getPermissions();

    $this->assertContains('delete_user', $permissions);
    // 관리자 권한 목록에 delete_user가 있어야 한다

    $this->assertNotContains('edit_post', $permissions);
    // 관리자 권한 목록에 edit_post가 없어야 한다.
}
```

- `assertGreaterThan()/assertLesThan()`: 크기비교
  - 숫자 값의 범위 확인
  - 날짜 비교
  - 성능 측정

```php
// 시간 확인
public function testCreatedAtIsRecent()
{
    $user = User::factory()->create();

    $fiveMinutesAgo = now()->subaMinutes(5);

    $this-.assertGreaterThan($fiveMinutesAgo, $user->created_at);

    // 생성 시간이 5분전보다 최근이어야 한다.s
}
```

- 위의 방식으로 '단위 테스트'를 구현한다.
- 단위 테스트는 코드의 가장 작은 단위(함수, 메소드)를 독립적으로 검증하고, 전체 시스템의 안전성을 쌓아간다.

---

## 4. 테스트 코드 구성
