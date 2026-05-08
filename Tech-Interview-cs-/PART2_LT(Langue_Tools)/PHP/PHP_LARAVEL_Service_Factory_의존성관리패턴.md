# 🌐 PHP_Laravel, Service Factory로 의존성 관리

---

## 1. 패턴 이름 및 개념

서비스를 조립하는 **Service Factory 패턴**은 **Factory Method Pattern**과 **Dependency Injection**을 조합한 구조다.
서비스는 오직 비지니스 로직만 담당, 팩토리는 필요한 하위 서비스를 조립, 완성된 서비스를 반환한다.

- 해당 구조는 **Factory Method Pattern + Dependency Injection**조합이다.
- 실무에서는 **Service Factory 패턴**이라 부른다.

| 패턴                   | 역할                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Factory Method Pattern | 객체 생성 책임을 Factory 클래스로 분리, 팩토리 패턴은 객체 생성을 캡슐화해 변경에 유연함                                                                            |
| Dependency Injection   | Service가 필요한 의존성을 외부에서 주입받음, 클래스가 직접 new로 객체를 만들지 않고 외부에서 의존성 주입.객체 생성 과정과 사용을 분리해 코드를 재사용 가능하게 한다 |
| Service Factory        | 객체 생성과 비즈니스 로직을 분리하는 구조, 하위 서비스를 조립하여 완성된 서비스를 반환한다. 조립 과정만 담당                                                        |

> **Service는 로직 처리, Factory는 객체 조립만 담당**

### PHP 공식 문서 관련 개념

- PHP 공식 매뉴에는 명칭의 패턴이 직접 정의되지 않는다. 대신 네임스페이스와 동적 클래스 이름을 다루는 문서에 **factory 패턴**예제가 등장, 네임스페이스를 고려한 팩토리 메서드 구현을 보여준다.동적으로 클래스 이름을 전달해 객체를 생성하는 방법 설명
- 의존성 주입은 하드와이어된 의존성을 해결하는 방법, 레거시 라이브러리를 활용하기 위해 커스텀 팩토리가 필요하다고 설명한다. 객체 생성 시 ObjectFactoryInterface를 받아 인터페이스 이름으로 구현체를 생성하는 예제를 보여준다.

---

## 2. 해당 패턴을 사용하는 이유?

예를 들어, 카페 주문 기능을 만든다

주문을 처리하려면 다음과 같은 작업이 필요할 것 이다.

- 가입 환영 이메일 발송
- 신규 회원 포인트 지급
- 가입 이력 로그 기록

이때 Handler나 Controller 에서 직접 객체를 생성하면 코드가 점점 복잡해진다.

```php
// 안좋은 예시 - Handler에서 직접 객체 생성
class UserRegisterHandler
{
    public function register(Request $request): JsonResponse
    {
        $emailService = new UserEmailService();
        $pointService = new UserPointService();
        $logService   = new UserRegisterLogService();

        $registerService = new UserRegisterService(
            $emailService,
            $pointService,
            $logService
        );

        $result = $registerService->register($request->userId, $request->email);

        return response()->json($result);
    }
}
```

### 문제점

- 객체 생성 코드가 컨트롤러와 섞인다 - 로직보다 객체 조립에 집중하게 된다.
- 의존성이 바뀌면 Hnalder 코드도 수정해야 한다
- 테스트할 때 Mock 객체를 넣기 어렵다
- Handler가 비지니스 흐름보다 객체 조립에 집중하게 된다

### Service Factory + DI

위를 해결하기 위해 Service Factory를 도입하면 컨트롤러는 객체 생성 과정을 모르고 서비스 인터페이스에만 의존한다.
의존성 주입을 통해 하위 서비스들을 생성자에 전달, 팩토리에서 조립한다. 비즈니스 로직과 객체생성 로직을 분리할 수 있어 유지보수성과 테스트 용이성이 향상된다.

---

## 3. 기본 구조

**유저 회원가입 기능**을 만든다고 하자.

회원가입 서비스는 직접 이메일을 보내거나, 포인트를 지급하거나, 로그를 남기지 않는다.  
각각의 하위 서비스에게 역할을 위임한다.

---

## 4. 하위 서비스 만들기

### 이메일 발송 서비스

```php
class UserEmailService
{
    public function sendWelcome(string $email): void
    {
        // Mail::to($email)->send(new WelcomeMail());
    }
}
```

### 포인트 지급 서비스

```php
class UserPointService
{
    private const WELCOME_POINT = 1000;

    public function grantWelcomePoint(int $userId): int
    {
        // Point::create(['user_id' => $userId, 'amount' => self::WELCOME_POINT]);

        return self::WELCOME_POINT;
    }
}
```

### 가입 로그 기록 서비스

```php
class UserRegisterLogService
{
    public function record(int $userId, string $email): void
    {
        // RegisterLog::create(['user_id' => $userId, 'email' => $email]);
    }
}
```

---

## 5. 메인 서비스

`UserRegisterService`는 회원가입 흐름만 담당한다.

```php
class UserRegisterService
{
    public function __construct(
        private readonly UserEmailService $emailService,
        private readonly UserPointService $pointService,
        private readonly UserRegisterLogService $logService
    ) {}

    public function register(int $userId, string $email): array
    {
        $this->emailService->sendWelcome($email);

        $grantedPoint = $this->pointService->grantWelcomePoint($userId);

        $this->logService->record($userId, $email);

        return [
            'user_id'       => $userId,
            'email'         => $email,
            'granted_point' => $grantedPoint,
            'message'       => '회원가입이 완료되었습니다.',
        ];
    }
}
```

여기서 포인트는 `register()` 안에서 `new UserEmailService()`를 직접 호출하지 않는다는 것이다.  
필요한 의존성은 생성자에서 외부로부터 주입받는다.

---

## 6. Factory 만들기

Factory는 객체 생성만 담당한다.

```php
class UserRegisterServiceFactory
{
    // 운영 환경: 내부에서 직접 생성
    public static function create(): UserRegisterService
    {
        return new UserRegisterService(
            new UserEmailService(),
            new UserPointService(),
            new UserRegisterLogService()
        );
    }

    // 테스트 환경: 외부에서 의존성 주입
    public static function createWithDependencies(
        UserEmailService $emailService,
        UserPointService $pointService,
        UserRegisterLogService $logService
    ): UserRegisterService {
        return new UserRegisterService(
            $emailService,
            $pointService,
            $logService
        );
    }
}
```

## 7. Handler에서 사용

Handler에서 Service 내부 의존성을 확인할 필요가 없다

```php
class UserRegisterHandler
{
    public function register(Request $request): JsonResponse
    {
        $service = UserRegisterServiceFactory::create();

        $result = $service->register(
            $request->userId,
            $request->email
        );

        return response()->json($result);
    }
}
```

Handler는 단순히 Factory를 통해 Service를 가져와 사용한다

```php
$service = UserRegisterServiceFactory::create();
```

해당 줄로 객체 조립을 완성할 수 있다
Handler는 `UserEmailService`, `UserPointService`, `UserRegisterLogService`의 존재를 전혀 몰라도 된다.

---

## 8. 테스트 활용

테스트에서 실제 가격 계산 서비스나 영수증 서비스를 그대로 쓰지않고, Mock 객체로 교체하여 사용할 수 있다.

```php
class UserRegisterServiceTest extends TestCase
{
    public function testRegisterGrantsWelcomePoint(): void
    {
        $emailService = $this->createMock(UserEmailService::class);
        $pointService = $this->createMock(UserPointService::class);
        $logService   = $this->createMock(UserRegisterLogService::class);

        // 이메일 발송이 정확히 1번 호출되는지 검증
        $emailService
            ->expects($this->once())
            ->method('sendWelcome')
            ->with('test@example.com');

        // 포인트 지급이 1번 호출되고 1000을 반환하는지 검증
        $pointService
            ->expects($this->once())
            ->method('grantWelcomePoint')
            ->with(1)
            ->willReturn(1000);

        // 로그 기록이 1번 호출되는지 검증
        $logService
            ->expects($this->once())
            ->method('record')
            ->with(1, 'test@example.com');

        $service = UserRegisterServiceFactory::createWithDependencies(
            $emailService,
            $pointService,
            $logService
        );

        $result = $service->register(1, 'test@example.com');

        $this->assertEquals(1000, $result['granted_point']);
        $this->assertEquals('회원가입이 완료되었습니다.', $result['message']);
    }
}
```

`createWithDependencies()`를 사용하면 테스트 환경에서 원하는 의존성을 직접 넣을 수 있다.

즉, 실제 구현체 대신 Mock 객체를 넣어서 Service의 흐름만 검증할 수 있다.

---

## 9. create(), createWithDependencies()를 나누는 이유

### create()

운영 코드에서 사용한다.

```php
$service = UserRegisterServiceFactory::create();
```

Factory 내부에서 실제 서비스를 생성한다. Handler는 어떤 하위 서비스가 조립되는 지 알 필요가 없다

### createWithDependencies()

테스트 코드에서 사용한다

```php
$service = UserRegisterServiceFactory::createWithDependencies(
    $mockEmailService,
    $mockPointService,
    $mockLogService
);
```

외부에서 원하는 의존성을 직접 주입할 수 있다.  
실제 이메일이 발송되거나 DB에 포인트가 적립되는 일 없이, Service 흐름만 검증할 수 있다.

## 10. 장점

Service Factory를 사용하면 다음과 같은 장점이 있다

- Handler가 단순해진다
- 객체 생성 코드가 Factory 한곳에 모인다
- 의존성이 바뀌어도 수정 범위가 줄어든다
- 테스트에서 Mock 객체를 주입하기 쉽다
- Service는 비즈니스 로직에만 집중할 수 있다

---

## 11. 활용은?

### 사용하기 좋을 때

- 하나의 Service가 여러 하위 Service를 사용할 때
- 이메일, Redis, 외부 API처럼 테스트에서 격리가 필요한 의존성이 있을 때
- 테스트에서 의존성을 쉽게 교체하고 싶을 때
- 같은 Service를 여러 Handler에서 사용할 때

의존성이 늘어나도 Handler 코드는 크게 바뀌지 않는다.  
Factory에서 조립 방식만 관리하면 된다.

---

## 12. 요약

> **Handler는 요청을 받고, Service는 로직을 처리하고, Factory는 객체를 조립한다.**
