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

다음과 같은 Lazy Initialization은 멀티스레드 언어에서 동시에 실행될 경우

---

### 팩토리 패턴(Factory Pattern)

**정의**: 객체 생성 로직을 별도의 팩토리로 위임해 캡슐화 하는 패턴이다. 클라이언트 코드는 `new`를 직접 호출하지 않고 팩토리를 통해 필욯나 객체를 얻는다.
**특징**: OCP(개방-폐쇄 원칙) 준수에 도움, 생성 로직 변경이 클라이언트 코드에 영향을 주지 않는다
**실무 활용**: 알림 전송 방식, DB 선택, 한꺼번에 Servie 관리

#### JavaScript

```js
class EmailNotifier {
  send(msg) {
    console.log(`Email: ${msg}`);
  }
}
class SnsNotifier {}
```
