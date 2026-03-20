# 🌐 PHP_Laravel

## Laravel 이벤트와 브로드캐스팅 개념 및 구조

- 채팅과 같은 실시간 기능을 구현하려면 서버에서 발생하는 일을 클라이언트에 전달할 수 있는 구조가 필요하다.
- PHP-Laravel은 **이벤트(Event)와 브로드캐스팅(Broadcasting)**을 통해 이런 요구사항을 수행할 수 있다.
- Laravel 공식 Broadcasting 문서에 적혀있는 내용이다

  > "Before diving into event broadcasting, make sure you have read Laravel's documentation on events and listeners."

- Broadcasting은 Events 위에서 동작하기 때문이다
- Events를 모르면 Broadcasting을 이해하기 어렵다.

### 1-1. Laravel 이벤트(Event)개념

#### 이벤트와 리스너의 역할

- Laravel 이벤트는 옵저버 패턴을 간단하게 구현하는 도구이다. 특정 동작이 일어낫을 때 이벤트를 발생, 구독하는 리스너가 독립적으로 후손 작업을 처리한다.
- 이벤트 클래스는 `app/Events` 디렉터리
- 리스너 클래스는 `app/Listeners` 디렉터리에 위치, Artisan 명령으로 자동생성 할 수 있다.
- 즉, **옵저버 패턴(Observer Pattern)**의 구현체라고 볼 수 있다.
  > 어떤 일이 일어났다는 것을 선언, 그 일에 반응하는 것들을 분리한다.

채팅 메시지가 저장됐을 때, 일어날 일들은

- 같은 방 유저들에게 실시간 전달
- 오프라인 유저에게 Push 알림
- 채팅 로그 기록

- 이걸 `ChatService` 하나에 전부 구현하면 서비스가 Push 알림 서비스, 로그 서비스, 브로드 캐스트 서비스 전부 의존하게 된다.
- Events를 쓰면 `ChatService`는 메시지가 저장됐다만 선언한다.
- 나머지는 각자의 Listener가 독립적으로 처리한다.

```
ChatService -> MessagerCreated:dispatch() <- 저장됐다

각자 독립적으로 반응
  Listener A -> 실시간 브로드 캐스트
  Listener B -> Push 알림 발송
  Listener C -> 채팅 로그 기록
```

이것이 **느슨한 결합(Loose Coupling)**이라 한다.

- 이벤트 시스템은 애플리케이션 관심사를 분리하는 데 유용하다. 주문이 완료될떄마다 알림을 보내면 주문 처리 코드에 알림 코드를 작성하는 대신
- `OrderShipped` 이벤트를 발생, 별도의 리스너에서 알림을 전송하도록 구현할 수 있다.
- 이벤트를 여러 리스너가 독립적으로 처리할 수 있어 기능 확장이나 테스트가 쉬워진다.

#### Event 클래스의 역할

- Event 클래스 자체는 로직이 없다.
- 무슨일이 일어났고, 관련 데이터가 뭔지만 담는 데이터 컨테이너다.
- 명령어로는 아래처럼 구성할 수 있다.

```bash
php artisan make:event MessagerCreated
php artisan make:listener SendPushNotifcation --event=MessagerCreated
```

Event 클래스에는 항상 3개의 Trait이 붙는다.

| Trait                  | 역할                                                 |
| ---------------------- | ---------------------------------------------------- |
| `Dispatchable`         | `MessageCreated::dispatch()` 정적 호출을 가능하게 함 |
| `InteractsWithSockets` | Broadcasting의 `toOthers()` 기능 지원                |
| `SerializesModels`     | Queue에 넣을 때 Eloquent 모델을 안전하게 직렬화      |

#### Listener 클래스의 역할

Listener는 Event가 발생했을 때 실제로 일을 처리하는 클래스다.
`handle()` 메서드 하나가 핵심, 파라미터로 Event 객체를 받는다.
Listener에 `ShouldQueue`를 구현하면 Queue에서 비동기로 처리된다.
무거운 작업ㅇ은 반드시 `ShouldQueue`를 붙여야 HTTP 응답속도에 영향을 주지않는다.
