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

- 음료 가격 계산
- 영수증 생성
- 주문 자저아

이때 Handler나 Controller 에서 직접 객체를 생성하면 코드가 점점 복잡해진다.

```php
// 안좋은 예시 - Handler에서 직접 객체 생성
class CafeOrderHandler
{
    public function order(Request $request)
    {
        $priceSerivce = new DrinklPriceSerivce();
        $receiptService = new ReceiptService();

        $orderSerivce = new CafeOrderService(
            $priceService,
            $receiptService
        );

        $orderSerivce->order($request->drinkName, $request->quantity);

        return response()->json(['ok' => true]);
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

예시는 카페 주문 서비스다
주문 서비스는 직접 가격 계산이나 영수증 생성을 하지 않고, 각각의 하위 서비스에게 역할을 위임한다.

---

## 4. 하위 서비스 만들기

### 음료 가격 계산 서비스

```php
class DrinkPriceService
{
    public function calculate(string $drinkName, int $quantity): int
    {
        $prices = [
            'americano' => 4500,
            'latte' => 5000,
            'tea' => 4000,
        ];

        return ($prices[$drinkName] ?? 0 ) * $quantity;
    }
}
```

### 영수증 생성 서비스

```php
class ReceiptService
{
    public function create(string $drinkName, int $quantity, int $totalPrice)
    {
        return [
            'drink' => $drinkName,
            'quantity' => $qantity,
            'total_price' => $totalPrice,
            'message' => '주문이 완료되었다',
        ];
    }
}
```

---

## 5. 메인 서비스

`CafeOrderService`는 주문 흐름만 담당한다.

```php
class CafeOrderService
{
    public function __construct(
        private readonly DrinkPriceService $priceService,
        private readonly ReceiptService $receiptService
    ) {}

    public function order(string $drinkName, int $quantity): array
    {
        $totalPrice = $this->priceService->calculate($drinkName, $quantity);

        return $this->receiptService->create(
            $drinkName,
            $quantity,
            $totalPrice
        );
    }
}
```

여기서 포인트는 직접 `new DrinkPriceService()`를 하지 않는다는 것이다. 필요한 의존성은 생성자에서 외부로부터 주입받는다.

---

## 6. Factory 만들기

Factory는 객체 생성만 담당한다.

```php
class CafeOrderSerivceFactory
{
    public static function create(): CafeOrderSerivce
    {
        return new CafeOrderService(
            new DrinkPriceService(),
            new ReceiptService()
        );
    }

    public static function createWithDependencies(
        DrinkPriceService $priceService,
        ReceiptService $receiptService
    ): CafeOrderService {
        return new CafeOrderService(
            $priceService,
            $receiptService
        );
    }
}
```

## 7. Handler에서 사용

Handler에서 Service 내부 의존성을 확인할 필요가 없다

```php
class CafeOrderHandler
{
    public function order(Request $request): JsonResponse
    {
        $service = CafeOrderServiceFactory::create();

        $receipt = $service->order(
            $request->drinkName,
            $request->quantity
        );

        return response()->json($receipt);
    }
}
```

Handler는 단순히 Factory를 통해 Service를 가져와 사용한다

```php
$service = CafeOrderServiceFactory::create();
```

해당 줄로 객체 조립을 완성할 수 있다

---

## 8. 테스트 활용

테스트에서 실제 가격 계산 서비스나 영수증 서비스를 그대로 쓰지않고, Mock 객체로 교체하여 사용할 수 있다.

```php
class CafeOrderServiceTest extends TestCase
{
    public function testOrderCreatesRceipt(): void
    {
        $priceService = $this->createMock(DrinkPridceService::class);
        $receiptService = $this->createMock(ReceiptService::class);

        $priceService->expects($this->once())
          ->method('calculate')
          ->with('americano', 2)
          ->willReturn(9000);

        $receiptService->expects($this->once())
          ->method('create')
          ->with('americano', 2, 9000)
            ->willReturn([
                'drink' => 'americano',
                'quantity' => 2,
                'total_price' => 9000,
                'message' => '주문이 완료되었습니다.',
            ]);

        $service = CafeOrderServiceFactory::createWithDependencies(
            $priceService,
            $receiptService
        );

        $result = $service->order('americano', 2);

        $this->assertEquals(9000, $result['total_price']);
    }
}
```

`createWithDependencies()`를 사용하면 테스트 환경에서 원하는 의존성을 직접 넣을 수 있다.

즉, 실제 구현체 대신 Mock 객체를 넣어서 Service의 흐름만 검증할 수 있다.

---

## 9. create(), createWithDependencies()를 나누는 이유
