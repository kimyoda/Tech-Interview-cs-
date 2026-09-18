## 1. 디자인 패턴과 프로그래밍 패러다임

---

## 디자인 패턴

디자인 패턴은 소프트웨어 설계에서 반복적으로 발생하는 문제를 해결하기 위한 재사용 가능한 해결책이다. GoF(Gang of Four)는 이름 **생성 패턴**(객체 생성 방식), **구조 패턴(클래스/객체 구성)**, **행위 패턴**(객체 간 상호작용)으로 분류했다.

### 싱글톤 패턴 (Singleton Pattern)

**정의**: 하나의 클래스에 대해 인스턴스가 하나만 생성되도록 제한, 애플리케이션에 그 인스턴스를 공유할 수 있도록 하는 생성 패턴이다.

**특징**

- 여러 곳에서 동일한 인스턴스를 공유한다
- 생성 비용이 크거나 하나만 유지해야 하는 자원을 관리할 때 유용하다
- 인스턴스 생성 시점을 지연시키는 Lazy Initialization을 적용할 수 있다
- 전역 상태처럼 사용되면 클래스 간 결합도가 높아질 수 있다
- 공유 상태를 가져 동시성 환경에서 상태 변경과 초기화에 주의해야 한다
- 정적 메서드로 직접 접근하는 구조는 테스트에서 Mock 객체로 교체하기 어렵다
- DI 컨테이너가 관리하는 Singleton Provider는 테스트에서 Provider를 교체할 수 있어 정적 Signleton보다 테스트 하기 쉽다

**실무 활용**:

- 데이터베이스 커넥션
- Redis Client
- 애플리케이션 설정 객체
- Logger
- 매트릭 수집
- 캐시 관리

> 데이터베이스 커넥션 Singleton이면 데이터베이스 연결이 하나라는 것은 아니다
> 여러 Connection을 관리 Connection Pool 객체 하나를 애플리케이션에 공유한다는 뜻이다.
>
> #### 싱글톤 패턴 장점

- 객체 생성 비용을 줄일 수 있다
- 하나의 공유 자원을 일관되게 관리할 수 있다
- 애플리케이션 전체에서 동일한 설정이나 상태를 공유할 수 있다
- 생성 시점과 생명주기를 중앙에서 관리할 수 있다

#### 싱글톤 패턴의 단점

- 전역 상태처럼 사용될 수 있다
- 의존성이 코드에 명시적으로 드러나지 않을 수 있다
- 여러 테스트가 공유 상태의 영향을 받을 수 있다
- 정적 접근 방식은 Mock 객체로 교체하기 어렵다
- 하나의 객체게 너무 많은 책임을 가지게 될 수 없다
- 프로세스가 여러 개인 환경에서 시스템 전체의 단일성을 보장하지 못한다

---

#### 면접 답변

> 싱글톤 패턴은 하나의 클래스에 대해 인스턴스가 하나만 생성되도록 제한, 인스턴스를 공유하는 생성 패턴이다
> 설정 객체나 Logger, 데이터베이스 커넥션 풀 처럼 하나의 실행 범위에 공유해야 하는 자원에 사용할 수 있다.
> 다만 전역 상태와 강한 결합을 만들 수 있고 테스트 격리를 어렵게 할 수 있다.
> NestJS에서 직접 정적 Singleton을 구현하기보다 기본 Singleton Scope의 Provider를 사용, 테스트에서 해당 Proivder를 Mock으로 교체할 수 있다. 또한 Node.js의 모듈 캐싱은 프로세스와 모듈 캐시 범위 안에서 Signleton처럼 동작한다는 점에 주의해야 한다.

#### 예상 면접 질문

##### 싱글톤 패턴을 사용하면 왜 테스트가 어려워질 수 있는지?

정적 메서드나 전역 변수를 통해 Singletone에 직접 접근하면 의존성이 외부에 명시되지 않고, 테스트 사이에서 상태가 공유 될 수 있기 때문이다. DI를 통해 주입하면 테스트에서 Mock으로 교체허기 쉬워진다.

##### NestJS Provider는 Singleton인지

기본 Scope의 `Scope.DEFAULT`는 Singleton이나 `Scope.REQUEST`와 `Scope.TRANSIENT`를 지정할 수 있다

##### Node.js 모듈 캐싱은 Singleton을 보장하나?

같은 프로세스와 모듈 캐시 범위에서 동일한 Export를 반환, Worker, Cluster, Child Process 또는 별도 서버 인스턴스 사이에서 각각 다른 인스턴스가 생성될 수 있다

##### 데이터베이스 커넥션 풀이 Singleton이라는건 Connection이 하나라는 것인가?

아니다. 여러 Connection을 관리하는 Pool 객체 하나를 애플리케이션에서 공유한다는 것이다

##### 싱글톤 패턴과 Singleton Scopre의 차이는?

싱글톤 패턴은 클래스가 자신의 단일 인스턴스 생성을 직접 제어하는 방식. Singleton Scope는 DI 컨테이너가 객체의 생성과 생명주기를 관리하는 방식

#### JavaScript

```js
class Database {
  static #instance;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }

    this.connection = "connected";

    Database.#instance = this;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }

    return Database.#instance;
  }

  getConnection() {
    return this.connection;
  }
}

const databaseA = Database.getInstance();
const databaseB = Database.getInstance();

console.log(databaseA === databaseB); // true
console.log(databaseA.getConnection()); // connected
```

#### TypeScript

```ts
class Database {
  private static instance?: Database;

  private constructor(private readonly connection: string = "connected") {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  getConnection(): string {
    return this.connection;
  }
}

const databaseA = Database.getInstance();
const databaseB = Database.getInstance();

console.log(databaseA === databaseB); // true
console.log(databaseA.getConnection()); // connected
```

#### Node.js (CommonJS 모듈 활용)

CommonJS 모듈은 처음 `require()` 될 때 실행, 이후 같은 파일로 해석되는 모듈을 불러오면 캐시된 `module.exports`가 반환된다.

객체 인스턴스를 `module.exports`로 내보내고 Singleton과 유사하게 공유할 수 있다.

Node.js 모듈 캐싱은 시스템 전체에서 하나의 인스턴스를 보장하는 것이 아니라, 일반적으로 **하나의 Node.js 모듈 캐시 범위 안에서 동일한 객체를 공유하는 방식**이다.

```js
// database.js
class Database {
  constructor() {
    this.connection = "connected";
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();
```

```js
// user-service.js
const database = require("./database");

module.exports = {
  database,
};
```

```js
// order-service.js
const database = require("./database");

module.exports = {
  database,
};
```

```js
// app.js
const userService = require("./user-service");
const orderService = require("./order-service");

console.log(userService.database === orderService.database); // true
```

#### Node.js - ES Module

동일한 ES Module에서 내보낸 객체도 같은 모듈 실행 환경 안에서 공유된다.

```js
// database.js
class Database {
  constructor() {
    this.connection = "connected";
  }

  getConnection() {
    return this.connection;
  }
}

export const database = new Database();
```

```js
// user-service.js
import { database } from "./database.js";

export function getUserDatabase() {
  return database;
}
```

```js
// order-service.js
import { database } from "./database.js";

export function getOrderDatabase() {
  return database;
}
```

#### NestJS — 기본 Singleton Provider

```ts
import { Injectable, Module } from "@nestjs/common";

@Injectable()
export class DatabaseService {
  private readonly connection = "connected";

  getConnection(): string {
    return this.connection;
  }
}

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(readonly databaseService: DatabaseService) {}
}

@Injectable()
export class OrderService {
  constructor(readonly databaseService: DatabaseService) {}
}
```

NestJS Provider의 기본 Scope는 `Scope.DEFAULT`다. 기본 Scope에서는 하나의 애플리케이션 컨텍스트 안에서 Provider 인스턴스가 공유된다.

따라서 별도의 `getInstance()` 메서드나 정적 필드 없이도 DI 컨테이너가 Provider의 생명주기를 관리한다.

```ts
const userDatabase = userService.databaseService;

const orderDatabase = orderService.databaseService;

console.log(userDatabase === orderDatabase); // true
```

단, 다음 경우에는 하나의 인스턴스가 아닐 수 있다.

- `Scope.REQUEST`로 선언하면 요청마다 새 인스턴스가 생성된다.
- `Scope.TRANSIENT`로 선언하면 주입받는 Consumer마다 새 인스턴스가 생성된다.
- 별도의 Nest Application Context를 여러 개 생성하면 Context마다 인스턴스가 존재할 수 있다.

```ts
import { Injectable, Scope } from "@nestjs/common";

@Injectable({
  scope: Scope.REQUEST,
})
export class RequestScopedService {}
```

NestJS에서 Singleton Provider를 테스트할 때는 정적 인스턴스를 직접 Mocking하지 않고 Provider를 교체한다.

```ts
const databaseServiceMock = {
  getConnection: jest.fn(() => "mock-connected"),
};

const moduleRef = await Test.createTestingModule({
  providers: [UserService, DatabaseService],
})
  .overrideProvider(DatabaseService)
  .useValue(databaseServiceMock)
  .compile();
```

### php - laravel은 실무 내용적으로 적용예정

---

#### 멀티스레드 동시성 주의

다음과 같은 Lazy Initialization은 멀티스레드 언어에서 동시에 실행될 경우 인스턴스가 두 번 생성될 수 있다

```text
Thread A: instance가 null인지 확인
Thread B: instance가 null인지 확인
Thread A: 인스턴스 생성
Thread B: 인스턴스 생성
```

Java 같은 멀티스레드 환경에서 Lock, 정적 초기화 같은 안전한 초기화 방법이 필요하다

일반적인 JavaScript 실행 환경에서 Event Loop 안의 동기 코드가 동시에 실행되지 않는다

다음 같은 경우에 각각 별도의 Singleton 인스턴스가 존재할 수 있다

- Node.js Cluster
- Worker Thread
- Child Process
- 여러 서버 인스턴스
- Serverless Function 개별 실행 환경

Singleton은 "분산 시스템 전체에서 단 하나"가 아닌 **정의된 실행 범위 안에서 하나**라고 설명하는 것이 정확하다

---

````markdown
# 1. 디자인 패턴과 프로그래밍 패러다임

---

## 디자인 패턴

디자인 패턴은 소프트웨어 설계에서 반복적으로 발생하는 문제를 해결하기 위한 재사용 가능한 해결책이다. GoF(Gang of Four)는 이를 **생성 패턴**(객체 생성 방식), **구조 패턴**(클래스/객체 구성), **행위 패턴**(객체 간 상호작용)으로 분류했다.

### 싱글톤 패턴 (Singleton Pattern)

**정의**: 하나의 클래스에 대해 인스턴스가 하나만 생성되도록 제한, 애플리케이션에서 그 인스턴스를 공유할 수 있도록 하는 생성 패턴이다.

**특징**

- 여러 곳에서 동일한 인스턴스를 공유한다

- 생성 비용이 크거나 하나만 유지해야 하는 자원을 관리할 때 유용하다

- 인스턴스 생성 시점을 지연시키는 Lazy Initialization을 적용할 수 있다

- 전역 상태처럼 사용되면 클래스 간 결합도가 높아질 수 있다

- 공유 상태를 가져 동시성 환경에서 상태 변경과 초기화에 주의해야 한다

- 정적 메서드로 직접 접근하는 구조는 테스트에서 Mock 객체로 교체하기 어렵다

- DI 컨테이너가 관리하는 Singleton Provider는 테스트에서 Provider를 교체할 수 있어 정적 Singleton보다 테스트하기 쉽다

**실무 활용**:

- 데이터베이스 커넥션

- Redis Client

- 애플리케이션 설정 객체

- Logger

- 메트릭 수집

- 캐시 관리

> 데이터베이스 커넥션 Singleton이면 데이터베이스 연결이 하나라는 것은 아니다

> 여러 Connection을 관리하는 Connection Pool 객체 하나를 애플리케이션에 공유한다는 뜻이다.

#### 싱글톤 패턴 장점

- 객체 생성 비용을 줄일 수 있다

- 하나의 공유 자원을 일관되게 관리할 수 있다

- 애플리케이션 전체에서 동일한 설정이나 상태를 공유할 수 있다

- 생성 시점과 생명주기를 중앙에서 관리할 수 있다

#### 싱글톤 패턴의 단점

- 전역 상태처럼 사용될 수 있다

- 의존성이 코드에 명시적으로 드러나지 않을 수 있다

- 여러 테스트가 공유 상태의 영향을 받을 수 있다

- 정적 접근 방식은 Mock 객체로 교체하기 어렵다

- 하나의 객체가 너무 많은 책임을 가지게 될 수 있다

- 프로세스가 여러 개인 환경에서 시스템 전체의 단일성을 보장하지 못한다

---

#### 면접 답변

> 싱글톤 패턴은 하나의 클래스에 대해 인스턴스가 하나만 생성되도록 제한, 인스턴스를 공유하는 생성 패턴이다

> 설정 객체나 Logger, 데이터베이스 커넥션 풀처럼 하나의 실행 범위에 공유해야 하는 자원에 사용할 수 있다.

> 다만 전역 상태와 강한 결합을 만들 수 있고 테스트 격리를 어렵게 할 수 있다.

> NestJS에서 직접 정적 Singleton을 구현하기보다 기본 Singleton Scope의 Provider를 사용, 테스트에서 해당 Provider를 Mock으로 교체할 수 있다. 또한 Node.js의 모듈 캐싱은 프로세스와 모듈 캐시 범위 안에서 Singleton처럼 동작한다는 점에 주의해야 한다.

---

### 팩토리 패턴(Factory Pattern)

## 정의

팩토리 패턴은 객체 생성 로직을 별도의 객체나 함수로 분리해 캡슐화하는 설계 방식

클라이언트는 구체적인 클래스의 생성 과정을 직접 알지 않고 팩토리에게 필요한 객체 생성을 요청

```text
클라이언트
  객체 생성 요청
Factory
  적절한 구현체 선택 및 생성
구체 클래스
```

---

## 팩토리 패턴 용어

"팩토리 패턴"이라는 표현은 여러 방식을 포괄적으로 표현

| 구분             | 설명                                                           |
| ---------------- | -------------------------------------------------------------- |
| Simple Factory   | 타입이나 조건에 따라 객체를 반환하는 함수 또는 클래스          |
| Factory Method   | 객체 생성 메서드를 하위 클래스가 결정하도록 하는 GoF 패턴      |
| Abstract Factory | 관련된 객체들의 집합을 생성하는 인터페이스를 제공하는 GoF 패턴 |
| Factory Provider | DI 컨테이너가 팩토리 함수를 이용해 Provider를 생성하는 방식    |

Simple Factory는 다른 패턴에 포함되지 않고 실무에서 자주 사용

---

## 특징

- 복잡한 생성 과정을 한곳에서 관리할 수 있음
- 클라이언트가 구체 클래스에 직접 의존하는 것을 줄임
- 생성 정책을 변경해도 클라이언트 코드의 변경을 줄일 수 있음

팩토리 패턴이 무조건 OCP를 만족시키는 것이 아님, `switch`문으로 타입을 분기하는 Simple Factory는 새로운 타입이 추가될 때 Factory 코드를 수정

> 팩토리 패턴은 객체 생성 책임을 분리, 확장 지점을 제공함으로 OCP를 적용하기 쉽게 만든다. 구현 방식에 따라 Factory 자체의 수정이 필요

---

## 실무 활용

- 이메일, SMS, Push 알림 객체 선택
- 결제 수단별 객체 생성
- 데이터베이스 드라이버 선택
- 파일 저장소 선택
- API Client 생성
- 환경 설정에 따른 Provider 선택
- 테스트 환경, 운영 환경의 구현체 교체

---

## JavaScript Simple Factory

```js
class EmailNotifier {
  send(message) {
    console.log(`Email: ${message}`);
  }
}

class SmsNotifier {
  send(message) {
    console.log(`SMS: ${message}`);
  }
}

class NotifierFactory {
  static create(type) {
    switch (type) {
      case "email":
        return new EmailNotifier();

      case "sms":
        return new SmsNotifier();

      default:
        throw new Error(`지원하지 않는 알림 타입: ${type}`);
    }
  }
}

const notifier = NotifierFactory.create("email");

notifier.send("회원가입이 완료되었다.");
```

클라이언트는 `EmailNotifier`를 직접 생성하지 않고 Factory에 필요한 타입을 전달

---

## TypeScript Simple Factory

```ts
interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SmsNotifier implements Notifier {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}

type NotifierType = "email" | "sms";

type NotifierConstructor = new () => Notifier;

const notifierConstructors = {
  email: EmailNotifier,
  sms: SmsNotifier,
} satisfies Record<NotifierType, NotifierConstructor>;

class NotifierFactory {
  static create(type: NotifierType): Notifier {
    const NotifierClass = notifierConstructors[type];

    return new NotifierClass();
  }
}

const notifier = NotifierFactory.create("email");

notifier.send("결제가 완료되었습니다.");
```

새로운 알림 타입을 추가할 때 기존 Creator의 핵심 로직을 수정하지 않고 새로운 하위 Creator를 추가

---

## Node.js 모듈 Factory

```js
// notifier-factory.js

const notifiers = {
  email: require("./notifiers/email-notifier"),
  sms: require("./notifiers/sms-notifier"),
};

function createNotifier(type) {
  const Notifier = notifiers[type];

  if (!Notifier) {
    throw new Error(`지원하지 않는 알림 타입입니다: ${type}`);
  }

  return new Notifier();
}

module.exports = {
  createNotifier,
};
```

```js
// app.js

const { createNotifier } = require("./notifier-factory");

const notifier = createNotifier(process.env.NOTIFY_TYPE ?? "email");

notifier.send("서버가 시작되었습니다.");
```

---

## NestJS 런타임 타입 선택

NestJS에서 구현체를 직접 `new`로 생성하기보다는, 구현체도 Provider로 등록, Factory에 주입하는 방법이 일반적

```ts
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const NOTIFIER = Symbol("NOTIFIER");

@Module({
  providers: [
    EmailNotifier,
    SmsNotifier,
    {
      provide: NOTIFIER,

      inject: [ConfigService, EmailNotifier, SmsNotifier],

      useFactory: (
        configService: ConfigService,
        emailNotifier: EmailNotifier,
        smsNotifier: SmsNotifier,
      ): Notifier => {
        const type = configService.get<string>("NOTIFY_TYPE");

        return type === "sms" ? smsNotifier : emailNotifier;
      },
    },
  ],

  exports: [NOTIFIER],
})
export class NotificationModule {}
```

```ts
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFIER)
    private readonly notifier: Notifier,
  ) {}

  notify(message: string): void {
    this.notifier.send(message);
  }
}
```

- `useFactory`는 일반적으로 Provider가 처음 생성되는 시점에 어떤 구현체를 사용할지 결정

요청할 때마다 타입을 동적으로 선택해야 한다면 앞서 작성한 `NotifierFactory.create(type)` 같은 구조가 더 적합할 수 있음

---

## TypeScript Interface, DI Token

TypeScript의 Interface는 컴파일 후 JavaScript 코드에서 사라진다

다음과 같이 Interface 자체를 NestJS DI Token으로 사용할 수 없다

```ts
// 잘못된 활용

constructor(
  private readonly notifier: Notifier,
) {}
```

NestJS는 런타임에 `Notifier` Interface를 확인할 수 없다

다음 중 하나를 사용해야 한다

- 클래스
- 문자열 Token
- Symbol Token
- Abstract Class

```ts
export const NOTIFIER = Symbol("NOTIFIER");
```

```ts
constructor(
  @Inject(NOTIFIER)
  private readonly notifier: Notifier,
) {}
```

---

## 일반 Node.js Composition Root

```ts
class UserRegisterService {
  constructor(
    private readonly emailService: UserEmailService,

    private readonly pointService: UserPointService,

    private readonly logService: UserRegisterLogService,
  ) {}

  async register(userId: number, email: string): Promise<void> {
    await this.emailService.sendWelcome(email);

    await this.pointService.grantWelcomePoint(userId);

    await this.logService.record(userId, email);
  }
}

function createUserRegisterService(): UserRegisterService {
  const emailService = new UserEmailService();

  const pointService = new UserPointService();

  const logService = new UserRegisterLogService();

  return new UserRegisterService(emailService, pointService, logService);
}
```

앱 시작점에서 객체 그래프를 조립하는 부분을 Composition Root라고 부른다

NestJS에선 Module, DI 컨테이너가 담당

---

## 생성자 내부의 기본 객체 생성

다음과 같이 의존성이 없으면 생성자 안에서 직접 객체를 만드는 방식은 가능하나 NestJS에선 권장하지 않는다

```ts
class ExampleService {
  private readonly exampleTopService: ExampleTopService;

  constructor(
    exampleRankingService: ExampleRankingService,

    exampleTopService?: ExampleTopService,
  ) {
    this.exampleTopService =
      exampleTopService ?? new ExampleTopService(exampleRankingService);
  }
}
```

해당 구조는 이슈가 있다

- 실제 의존성이 숨겨질 수 있음
- DI 컨테이너가 객체의 생명주기를 관리하지 않음
- `ExampleTopService`가 추가 의존성을 가지면 직접 조립해야 한다
- Scope, Interceptor, Decorator 같은 NestJS 기능이 정상적으로 적용되지 않을 수 있다
- 운영 환경, 테스트 환경의 객체 생성 방식이 달라질 수 있음

NestJS에서 의존성을 명시적으로 Provider로 등록, 테스트에서 `overrideProvider()`를 사용하는 것이 자연스럽다

> 팩토리 패턴은 객체 생성 책임을 클라이언트로 분리하고 별도의 Factory에 캡슐화하는 패턴. 클라이언트가 구체 클래스의 생성 과정에 직접 의존하지 않게 하고, 생성 정책을 한곳에서 관리할 수 있다

> 타입에 따라 `switch` 문으로 객체를 반환하는 Simple Factory는 새로운 타입이 추가될 때 Factory를 수정해야 하여 OCP를 만족한다고 단정 할 수 없다

> NestJS에선 Provider를 직접 `new`로 생성하기보다 Module에 등록, 런타임 선택이 필요하면 Factory Service를 사용, 앱 시작 시 구현체를 선택해야 한다면 `useFactory` Provider를 사용할 수 있음

---

# 전략 패턴

## 정의

- 전략 패턴은 동일한 목적을 가진 여러 알고리즘을 각각 캡슐화, 상황에 따라 교체해서 사용할 수 있게 만드는 행위 패턴

```text
Context
  - CardPaymentStrategy
  - PointPaymentStrategy
  - BankTransferStrategy
```

Context는 구체적인 알고리즘을 직접 구현하는 게 아닌 Strategy에 실행을 위임

---

## 특징

- 알고리즘과 실행 주체를 분리
- 큰 `if` 또는 `switch` 문을 줄일 수 있다
- 실행 중에 알고리즘을 교체할 수 있음
- 알고리즘별 단위 테스트가 쉽다
- 새로운 전략을 독립적인 클래스로 추가할 수 있다

---

## TypeScript

```ts
interface PaymentStrategy {
  pay(amount: number): string;
}

class CardPaymentStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `카드로 ${amount}원 결제`;
  }
}

class PointPaymentStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `포인트로 ${amount}원 결제`;
  }
}

class PaymentContext {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  pay(amount: number): string {
    return this.strategy.pay(amount);
  }
}

const context = new PaymentContext(new CardPaymentStrategy());

console.log(context.pay(10_000));

context.setStrategy(new PointPaymentStrategy());

console.log(context.pay(10_000));
```

---

## NestJS

```ts
import { Injectable } from "@nestjs/common";

interface DiscountStrategy {
  calculate(price: number): number;
}

@Injectable()
export class VipDiscountStrategy implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.8;
  }
}

@Injectable()
export class NormalDiscountStrategy implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.95;
  }
}

type Grade = "vip" | "normal";

@Injectable()
export class PriceService {
  private readonly strategies: Record<Grade, DiscountStrategy>;

  constructor(
    vipStrategy: VipDiscountStrategy,
    normalStrategy: NormalDiscountStrategy,
  ) {
    this.strategies = {
      vip: vipStrategy,
      normal: normalStrategy,
    };
  }

  getFinalPrice(grade: Grade, price: number): number {
    return this.strategies[grade].calculate(price);
  }
}
```

---

## Factory, Strategy 차이

| 구분      | Factory                              | Strategy                             |
| --------- | ------------------------------------ | ------------------------------------ |
| 주요 목적 | 어떤 객체를 생성하거나 제공할지 결정 | 어떤 알고리즘과 동작을 실행할지 결정 |
| 확인      | 객체 생성                            | 행위 교체                            |
| 결과      | 객체를 반환                          | 알고리즘을 실행                      |
| 사용 시점 | 객체 구성 및 생성 시점               | 실제 비즈니스 로직 실행 시점         |

Factory가 Strategy 객체를 선택해 반환하는 식으로 두 패턴을 함께 사용할 수도 있다

---

## 면접 답변

> 전략 패턴은 동일한 목적을 가진 알고리즘을 각각 캡슐화하고 실행 시점에 교체할 수 있도록 하는 행위 패턴이다. 결제 수단, 할인 정책, 인증 방식처럼 상황별로 동작이 달라지는 경우에 사용할 수 있음

> Strategy는 실행할 알고리즘을 교체하는 것이 목적

---

# 옵저버 패턴

## 정의

옵저버 패턴은 Subject의 상태 변화나 이벤트를 여러 Observer가 구독하고 자동으로 통지받는 행위 패턴

```text
Subject
  - Observer A
  - Observer B
  - Observer C
```

---

## JavaScript

```js
class Subject {
  #observers = new Set();

  subscribe(observer) {
    this.#observers.add(observer);

    return () => {
      this.#observers.delete(observer);
    };
  }

  notify(data) {
    for (const observer of this.#observers) {
      observer(data);
    }
  }
}

const scoreBoard = new Subject();

const unsubscribe = scoreBoard.subscribe((score) => {
  console.log(`점수 갱신: ${score}`);
});

scoreBoard.notify(100);

unsubscribe();
```

구독 해제 기능을 제공하지 않으면 더 이상 사용하지 않는 Listener가 계속 남아 메모리 누수의 원인이 될 수 있음

---

## Node.js EventEmitter

```js
const { EventEmitter } = require("node:events");

const gameEvents = new EventEmitter();

function handleScoreUpdated(payload) {
  console.log(`유저 ${payload.userId} 점수: ${payload.score}`);
}

gameEvents.on("score.updated", handleScoreUpdated);

gameEvents.emit("score.updated", {
  userId: 100,
  score: 500,
});

gameEvents.off("score.updated", handleScoreUpdated);
```

`EventEmitter.emit()`은 기본적으로 등록된 Listener를 동기적으로 호출, 비동기 작업이 필요한 Listener에서 Promise 처리와 예외 처리 방식을 별도로 고려해야 한다

---

## NestJS EventEmitter

```ts
import { Injectable } from "@nestjs/common";

import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

type ScoreUpdatedEvent = {
  userId: number;
  score: number;
};

@Injectable()
export class ScoreService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  updateScore(userId: number, score: number): void {
    this.eventEmitter.emit("score.updated", {
      userId,
      score,
    } satisfies ScoreUpdatedEvent);
  }
}

@Injectable()
export class RankingListener {
  @OnEvent("score.updated")
  handleScoreUpdated(event: ScoreUpdatedEvent): void {
    console.log(`랭킹 갱신 대상: ${event.userId}`);
  }
}
```

`@nestjs/event-emitter`는 NestJS 프로세스 안에서 동작하는 인프로세스 이벤트 방식

여러 서버 인스턴스에 이벤트를 전달해야 하면 다음과 같은 외부 메시지 시스템이 필요

- Redis Pub/Sub
- RabbitMQ
- Kafka
- AWS SNS/SQS

---

## Observer, Pub/Sub 차이

| 구분        | Observer                                        | Pub/Sub                                   |
| ----------- | ----------------------------------------------- | ----------------------------------------- |
| 관계        | Subject가 Observer를 직접 알고 있는 경우가 있음 | Publisher, Subscriber 서로 직접 알지 못함 |
| 중간 매개체 | 필수가 아님                                     | Event Bus 또는 Message Broker가 존재      |
| 실행 범위   | 주로 동일 프로세스                              | 여러 프로세스, 서버로 확장 가능           |
| 통신 방식   | 직접 알림                                       | Topic, Channel 기반                       |
| 동기성      | 동기, 비동기                                    | 비동기인 경우가 많음                      |

Node.js의 `EventEmitter`는 Observer와 유사한 인프로세스 이벤트 모델

Kafka, RabbitMQ를 이용한 이벤트 처리 Pub/Sub 또는 메시지 기반 아키텍처에 더 가깝다

> Observer는 Subject, Observer가 직접 연결되는 경우가 많으나 Pub/Sub는 Event Bus, Message Broker가 중간에 존재해 Publisher, Subscriber를 더 강하게 분리

---

# 프록시 패턴, 프록시 서버

## 프록시 패턴 정의

프록시 패턴은 실제 객체와 동일한 인터페이스를 가진 대리 객체를 두고 실제 객체에 대한 접근을 제어하는 구조 패턴

- 접근 권한 확인
- 캐싱
- 로깅
- 지연 로딩
- 원격 객체 호출
- 요청 제한

---

## TypeScript 캐싱 프록시

```ts
interface PlayerReader {
  findName(id: number): string;
}

class DatabasePlayerReader implements PlayerReader {
  findName(id: number): string {
    console.log("데이터베이스 조회");

    return `Player-${id}`;
  }
}

class CachingPlayerReader implements PlayerReader {
  private readonly cache = new Map<number, string>();

  constructor(private readonly target: PlayerReader) {}

  findName(id: number): string {
    const cached = this.cache.get(id);

    if (cached !== undefined) {
      return cached;
    }

    const name = this.target.findName(id);

    this.cache.set(id, name);

    return name;
  }
}

const reader: PlayerReader = new CachingPlayerReader(
  new DatabasePlayerReader(),
);

console.log(reader.findName(1));
console.log(reader.findName(1));
```

Proxy는 실제 객체와 동일한 계약을 제공, 클라이언트는 실제 객체인지 Proxy인지 알 필요가 없다

---

## JavaScript Proxy 객체

```js
const user = {
  name: "Kim",
  role: "admin",
};

const loggingProxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`프로퍼티 접근: ${String(property)}`);

    return Reflect.get(target, property, receiver);
  },
});

console.log(loggingProxy.name);
```

JavaScript의 `Proxy` 객체는 프로퍼티 접근과 함수 호출 등을 가로챌 수 있어 프록시 패턴을 구현하는 데 사용할 수 있음

---

## 프록시 서버

| 구분                  | 포워드 프록시                  | 리버스 프록시              |
| --------------------- | ------------------------------ | -------------------------- |
| 대신하는 대상         | 클라이언트                     | 서버                       |
| 위치                  | 클라이언트 앞                  | 서버 앞                    |
| 서버가 보는 요청 주체 | Proxy                          | Proxy                      |
| 주요 목적             | 접근 제어, 익명화, 사내망 정책 | 로드밸런싱, SSL 종료, 캐싱 |
| 대표 예시             | Squid, 사내 HTTP Proxy         | Nginx, HAProxy, AWS ALB    |

VPN은 네트워크 트래픽을 터널링하는 점에서 포워드 프록시와 비슷한 목적에 사용될 수 있으나, 기술적으로 동일한 개념은 아님

---

## NestJS Interceptor 차이

NestJS Interceptor는 요청과 응답 처리 전후에 공통 로직을 적용

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(`${Date.now() - startedAt}ms`);
      }),
    );
  }
}
```

Interceptor는 요청 흐름을 가로채는 것에서 Proxy와 유사하다

하지만 Proxy는 실제 객체와 동일한 인터페이스를 가진 대리 객체를 두는 패턴, NestJS Interceptor는 AOP 또는 Interceptor Pattern에 더 가깝다

> NestJS Interceptor는 접근을 가로채 공통 로직을 적용한다는 점에서 유사하나, 정상적인 구현과 완전히 같은 개념은 아님

> 프록시 패턴은 실제 객체와 동일한 인터페이스를 가진 대리 객체를 두고 실제 객체에 대한 접근을 제어하는 구조 패턴. 캐싱, 권한 검사, 로깅, 지연 로딩 등에 사용하고 포워드 프록시는 클라이언트를 대신, 리버스 프록시는 서버를 대신

---

# 이터레이터 패턴

## 정의

이터레이터 패턴은 컬렉션의 내부 구조를 노출하지 않고 요소를 순차적으로 탐색할 수 있게 하는 행위 패턴

JavaScript는 Iterable, Iterator Protocol을 지원

---

## JavaScript Iterable 구현

```js
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;

    return {
      next() {
        if (current <= end) {
          return {
            value: current++,
            done: false,
          };
        }

        return {
          value: undefined,
          done: true,
        };
      },
    };
  }
}

for (const number of new Range(1, 5)) {
  console.log(number);
}
```

---

## Generator 활용

```js
function* range(start, end) {
  for (let number = start; number <= end; number += 1) {
    yield number;
  }
}

for (const number of range(1, 5)) {
  console.log(number);
}
```

Generator는 Iterator를 직접 구현하는 것보다 간결하게 순회 로직을 작성할 수 있다

---

## 대량 데이터 비동기 순회

```ts
import { MoreThan, Repository } from "typeorm";

type Player = {
  id: number;
  name: string;
};

async function iteratePlayers(
  repository: Repository<Player>,
  batchSize = 100,
): AsyncGenerator<Player> {
  let lastId = 0;

  while (true) {
    const players = await repository.find({
      where: {
        id: MoreThan(lastId),
      },
      order: {
        id: "ASC",
      },
      take: batchSize,
    });

    if (players.length === 0) {
      break;
    }

    for (const player of players) {
      yield player;
    }

    lastId = players[players.length - 1].id;
  }
}
```

```ts
for await (const player of iteratePlayers(repository)) {
  await processPlayer(player);
}
```

전체 데이터를 한 번에 메모리에 적재하지 않고 일정한 크기의 Batch로 순회

`skip`, `take`를 사용하는 건 Offset Pagination이고 Cursor Pagination과 다름

대량 데이터에서 다음 방식이 더 안정적

```sql
WHERE id > :lastId
ORDER BY id ASC
LIMIT :batchSize
```

---

> 이터레이터 패턴은 컬렉션의 내부 구현을 외부에 노출하는 게 아닌 요소를 순차적으로 탐색하도록 하는 행위 패턴, JS에서 `Symbol.iterator`, Generator, `for...of`가 관련된 기능
> 대량 데이터를 처리할 때 Async Generator, Cursor Pagination을 조합, 모든 데이터를 한 번에 메모리에 올리지 않고 순차적으로 처리

---

## 노출 모듈 패턴

## 정의

노출 모듈 패턴은 Closure를 이용해 내부 상태를 감추고 외부에 공개할 기능만 객체로 변환하는 JS 설계 패턴

ES Module 나오기 전 주로 사용

---

## 전통적 구현

```js
const Counter = (function () {
  let count = 0;

  function increase() {
    count += 1;
  }

  function getCount() {
    return count;
  }

  return {
    increase,
    getCount,
  };
})();

Counter.increase();

console.log(Counter.getCount()); // 1
```

`count`는 Closure 내부에 있어 외부에서 직접 접근할 수 없음

---

## 현대적 ES Module

```js
// counter.js
let count = 0;

export function increase() {
  count += 1;
}

export function getCount() {
  return count;
}
```

`export` 하지 않은 값은 모듈 외부에 공개되지 않음

Node.js는 IIFE 기반 Revealing Module 패턴보다 CommonJS 혹은 ES Module의 모듈 Scope를 사용하는 게 일반적

NestJS Module의 `exports`는 다른 Module에 주입할 수 있는 Provider를 제한하는 역할, Closure의 런타임 비공개 상태와 NestJS Module Provider의 공개 범위는 동일한 개념은 아님

---

# MVC 패턴

## 정의

MVC는 다음 세 역할로 분리하는 아키텍처 패턴

| 구성 요소  | 역할                         |
| ---------- | ---------------------------- |
| Model      | 데이터와 도메인 로직 관리    |
| View       | 사용자에게 결과 표시         |
| Controller | 사용자 입력 처리와 흐름 제어 |

---

## NestJS 서버 렌더링 MVC

NestJS는 MVC 지원

```ts
import { Controller, Get, Param, ParseIntPipe, Render } from "@nestjs/common";

@Controller("players")
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(":id")
  @Render("players/show")
  async show(@Param("id", ParseIntPipe) id: number) {
    const player = await this.playerService.findOne(id);

    return {
      player,
    };
  }
}
```

---

## NestJS REST API

```ts
@Controller("players")
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(":id")
  async show(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PlayerResponseDto> {
    return this.playerService.findOne(id);
  }
}
```

REST API에서 View를 렌더링하지 않고 JSON DTO를 반환, NestJS REST API 구조를 전통적인 MVC가 아닐 수도 있음

---

# MVP 패턴

## 정의

MVP는 Model, View, Presenter 역할로 분리

Presenter는 View의 입력을 전달받아 Model을 호출, 결과를 다시 View에 전달

```text
View <-> Presenter <-> Model
```

View, Model은 직접 통신하지 않음

---

## TypeScript 예시

```ts
interface PlayerView {
  render(name: string, score: number): void;

  showError(message: string): void;
}

class PlayerPresenter {
  constructor(
    private readonly view: PlayerView,
    private readonly model: PlayerModel,
  ) {}

  async loadPlayer(id: number): Promise<void> {
    try {
      const player = await this.model.findOne(id);

      this.view.render(player.name, player.score);
    } catch {
      this.view.showError("플레이어를 찾을 수 없다.");
    }
  }
}
```

MVP는 UI 앱에 주로 사용

NestJS 같은 API 서버에서 전통적인 MVP를 적용하는 경우가 많지 않으나 Clean Architecture 등에 출력 형식을 변환하는 객체를 Presenter라고 부른다

---

# MVVM 패턴

## 정의

MVVM은 Model, View, ViewModel로 역할을 분리

ViewModel은 View가 표시할 상태와 사용자가 실행할 명령을 제공

```text
View
  데이터 바인딩
ViewModel

Model
```

MVVM의 주요 특징은 View와 ViewModel 사이의 선언적인 데이터 바인딩이다

데이터 바인딩은 양방향일 필요는 없다

- 단방향 데이터 바인딩
- 양방향 데이터 바인딩

모두 사용할 수 있음

NestJS 같은 백엔드는 화면을 직접 관리하지 않아 전통적인 MVVM을 적용하는 경우가 드물다

---

## MVC, MVP, MVVM 비교

| 구분             | MVC                             | MVP                           | MVVM                       |
| ---------------- | ------------------------------- | ----------------------------- | -------------------------- |
| 중개 객체        | Controller                      | Presenter                     | ViewModel                  |
| View, Model 관계 | 구현 방식에 따라 직접 참조 가능 | 일반적으로 직접 참조하지 않음 | ViewModel을 통해 상태 사용 |
| View 갱신        | Controller 또는 View 처리       | Presenter가 View 갱신         | 데이터 바인딩으로 반영     |
| 주요 활용        | 웹, 서버 렌더링                 | 전통적인 UI                   | 데이터 바인딩              |
| 백엔드 적용      | 흔함                            | 제한적                        | 거의 없음                  |

---

# 프로그래밍 패러다임

프로그래밍 패러다임은 프로그램을 구성, 문제를 해결하는 기본적인 관점과 방식을 의미

JS와 TS는 여러 패러다임을 함께 지원하는 멀티 패러다임

---

# 선언형 프로그래밍

## 정의

선언형 프로그래밍은 작업을 수행하는 세부 절차보다 원하는 결과가 무엇인지 표현하는 방식

```text
명령형: 어떻게 처리할 것인지
선언형: 무엇을 얻고 싶은지
```

---

## 명령형, 선언형 비교

다음 두 코드는 모두 짝수의 합을 계산

### 명령형

```ts
const numbers = [1, 2, 3, 4, 5];

let evenTotal = 0;

for (const number of numbers) {
  if (number % 2 === 0) {
    evenTotal += number;
  }
}

console.log(evenTotal); // 6
```

### 선언형, 함수형 스타일

```ts
const numbers = [1, 2, 3, 4, 5];

const evenTotal = numbers
  .filter((number) => number % 2 === 0)
  .reduce((total, number) => total + number, 0);

console.log(evenTotal); // 6
```

---

# 함수형 프로그래밍

함수형 프로그래밍은 함수를 중심으로 프로그램을 구성하는 패러다임, 일반적인 선언형 프로그래밍

## 개념

### 순수함수

- 같은 입력에 항상 같은 결과를 반환
- 함수 외부의 상태를 변경하지 않음
- 관찰 가능한 부수효과를 만들지 않음

```ts
function add(first: number, second: number): number {
  return first + second;
}
```

- 다음 함수는 외부 상태를 변경하여 순수 함수가 아님

```ts
let total = 0;

function addTotal(value: number): void {
  total += value;
}
```

---

### 불변성

기존 값을 직접 변경하지 않고 새로운 값을 만듦

```ts
const user = {
  id: 1,
  name: "Kim",
};

const updatedUser = {
  ...user,
  name: "Lee",
};

console.log(user.name); // kim
console.log(updatedUser.name); // Lee
```

---

### 고차함수

고차 함수는 다음 중 하나 이상을 만족하는 함수

- 함수를 인자로 받음
- 함수를 반환

```ts
function calculate(
  first: number,
  second: number,
  operation: (first: number, second: number) => number,
): number {
  return operation(first, second);
}

const result = calculate(10, 20, (first, second) => first + second);

console.log(result); // 30
```

---

## 함수형 프로그래밍 장점

- 입력과 출력 관계가 명확
- 순수 함수는 단위 테스트가 쉬움
- 공유 상태 변경을 줄일 수 있음
- 작은 함수를 조합해 복잡한 로직을 만들 수 있음
- 동시성 문제를 줄이는 데 도움을 줄 수 있음

- 단점으로는 함수형으로 작성한다고 코드가 간단해지는 건 아니고 긴 함수 조합은 가독성을 떨어뜨릴 수 있음

# 객체지향 프로그래밍

## 정의

객체지향 프로그래밍은 상태와 행동을 객체로 묶고 객체 간의 협력으로 프로그램을 구성하는 프로그래밍

## 주요 특성

| 특성   | 설명                                                   |
| ------ | ------------------------------------------------------ |
| 추상화 | 필요한 특징만 표현, 불필요한 세부 구현을 숨김          |
| 캡슐화 | 상태와 행동을 하나로 묶고 내부 구현에 대한 접근을 제한 |
| 상속   | 기존 클래스의 특성과 동작을 물려받아 확장              |
| 다형성 | 동일한 인터페이스로 서로 다른 구현을 사용              |

---

## TypeScript 예시

```ts
abstract class Player {
  #score = 0;

  abstract attack(): string;

  protected addScore(score: number): void {
    this.#score += score;
  }

  getScore(): number {
    return this.#score;
  }
}

class Warrior extends Player {
  attack(): string {
    return "검으로 공격";
  }
}

class Mage extends Player {
  attack(): string {
    return "마법으로 공격";
  }
}

function executeAttack(player: Player): void {
  console.log(player.attack());
}

executeAttack(new Warrior());
executeAttack(new Mage());
```

코드에 확인할 수 있는 개념은 다음과 같다

- `Player`: 추상화
- `#score`: 캡슐화
- `Warrior extends Player`: 상속
- `executeAttack(Player)`: 다형성

실무에서 상속보다는 Interface, Composition을 조합하는 방식이 자주 사용

---

# 절차형 프로그래밍

## 정의

절차형 프로그래밍은 프로그램을 함수와 처리 절차의 순서로 구성하는 방식

```js
function addScore(currentScore, point) {
  return currentScore + point;
}

function resetScore() {
  return 0;
}

let score = 0;

score = addScore(score, 10);
score = addScore(score, 20);

console.log(score); // 30

score = resetScore();
```

---

# 패러다임 혼합

JS와 TS는 패러다임을 함께 사용이 가능

- 객체지향 프로그래밍
- 함수형 프로그래밍
- 절차형 프로그래밍
- 이벤트 기반 프로그래밍
- 선언형 프로그래밍

NestJS도 하나의 패러다임만 사용하는 프레임워크가 아님

```text
Module, Controller, Provider -> 클래스와 DI를 사용하는 객체지향 구조

Pipe 함수, 배열 메서드 -> 함수형 스타일

RxJS Observable -> 함수형, 반응형 프로그래밍

EventEmitter, Microservice Event -> 이벤트 기반 프로그래밍
```

실무에서 하나의 패러다임을 고집하기보다 성격에 맞게 조합하는 것이 중요

---

# 면접 질문 정리

## 디자인 패턴이란?

- 소프트웨어 설계에서 반복적으로 발생하는 문제에 대해 검증된 해결 구조를 이름과 함께 정리한 것이다. 완성된 코드를 그대로 복사하는 것이 아닌 문제 상황에 맞게 적용하는 설계 지침에 가깝다

## 싱글톤과 NestJS Provider의 차이는?

- 싱글톤 패턴은 클래스가 정적 필드와 생성자 제어를 이용해 자신의 단일 인스턴스를 직접 관리. NestJS Singleton Provider는 DI 컨테이너가 인스턴스 생성과 생명주기를 관리하기 때문에 테스트에서 Provider를 교체하기 쉽다

## Factory, Strategy 차이는?

- Factory는 어떤 객체를 생성하거나 제공할지를 결정, Strategy는 어떤 알고리즘을 실행할지를 결정. Factory가 Strategy 구현체를 선택해 반환하는 방식으로 함께 사용할 수 있음

## Observer, Pub/Sub의 차이는?

- Observer는 Subject와 Observer가 직접 연결되는 경우가 많으나 Pub/Sub는 Message Broker나 Event Bus를 통해 Publisher와 Subscriber를 분리. Observer는 같은 프로세스에서 사용되는 경우가 많고 Pub/Sub는 여러 서버로 확장할 수 있다

## NestJS EventEmitter로 분산 이벤트를 처리

- 기본적으로 쉽지 않다. NestJS EventEmitter는 동일한 앱 프로세스 안에서 동작. 여러 서버 인스턴스에 이벤트를 전달하기 위해 Kafka, Redis Pub/Sub 같은 외부 메시지 시스템이 필요

## 포워드 프록시, 리버스 프록시의 차이

- 포워드 프록시는 클라이언트를 대신해 서버로 요청, 리버스 프록시는 서버를 대신해 클라이언트 요청을 받는다.

## MVC, MVP, MVVM의 차이는

- 세 패턴 모두 화면, 상태, 사용자 입력에 대한 책임을 분리. MVC는 Controller가 입력 흐름을 제어, MVP는 Presenter가 View와 Model 사이의 통신을 중개. MVVM은 ViewModel, View 상태와 명령을 제공하고 데이터 바인딩을 통해 View와 연결된다

## 순수 함수란?

- 같은 입력에 항상 같은 결과를 반환, 외부 상태를 변경하는 부수 효과가 없는 함수다. 입력과 출력 관계가 명확하기에 테스트와 재사용이 쉽다.

## Node.js는 싱글스레드인데 동시성 문제가 있는지?

- JavaScript 동기 코드는 기본적으로 하나의 Event Loop에 실행되고 비동기 작업의 `await` 사이에 다른 요청이 실행될 수 있다. 또한 Worker Thread, Cluster, 여러 서버 프로세스를 사용하면 공유 자원에 대한 동시성 문제가 발생할 수 있다.
````
