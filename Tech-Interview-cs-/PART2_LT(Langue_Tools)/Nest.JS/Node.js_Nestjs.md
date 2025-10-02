# 🌐 Node.js -> NestJS 과정

## 1. 발전과정

### 1-1. 발전단계

```js
JavaScript (언어)
    ↓
Node.js (런타임 환경)
    ↓
Express.js (기본 웹 프레임워크)
    ↓
NestJS (엔터프라이즈급 프레임워크)
```

### 1-2. 단계 특징

**1. Node.js (2009)**

```js
const http = require("http");

const server = http.createServer((req, res) => {
  // URL 파싱부터 응답 처리까지 모든 것을 수동으로
  if (req.url === "/users" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: [] }));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});
```

**2. Express.js (2010)**

```js
// Express.js - 라우팅과 미들웨어 패턴 도입
const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  res.json({ users: [] });
});

app.post("/users", (req, res) => {
  // 사용자 생성 로직
  res.json({ message: "User created" });
});

app.listen(3000);
```

**3단계: NestJS(2017) - 아키텍쳐**

```ts
// NestJS - 구조화된 아키텍처와 TypeScript
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(): Promise {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise {
    return this.usersService.create(createUserDto);
  }
}
```

---

## 2. NestJS 등장 이유 - Express.js보다 좋은 기능

### 2-1. Express.js 문제점들

**1. 구조의 부재**

```js
// Express.js - 자유도가 높으나 일관성이 부족하다
project1/
├── routes/
├── controllers/
└── models/

project2/
├── api/
├── services/
└── data/

project3/
├── handlers/
├── business/
└── db/
```

**2. 타입 안전성 부족**

```js
// Express.js - JavaScript의 동적 타입으로 인한 런타임 에러
app.post("/users", (req, res) => {
  const user = {
    name: req.body.name, // 이 값이 존재하는지 모름
    email: req.body.email, // 타입이 string인지 모름
    age: req.body.age, // 숫자인지 문자열인지 모름
  };

  // 런타임에서야 오류 발견!
  database.save(user); // 💥 에러 발생 가능
});
```

**3. 의존성 관리 어려움**

```js
// Express.js - 수동 의존성 관리
const express = require("express");
const app = express();

// 서비스 인스턴스를 수동으로 생성하고 관리
const databaseService = new DatabaseService();
const userService = new UserService(databaseService);
const emailService = new EmailService();
const userController = new UserController(userService, emailService);
```

### 2-2. NestJS로의 발전

**1. 보다 나은 아키텍처 제공**

```ts
// NestJS - 명확하고 일관된 구조
src/
├── modules/
│   └── users/
│       ├── users.controller.ts  # 요청/응답 처리
│       ├── users.service.ts     # 비즈니스 로직
│       ├── users.module.ts      # 모듈 정의
│       └── dto/                 # 데이터 전송 객체
└── app.module.ts               # 루트 모듈

// 모든 NestJS 프로젝트가 동일한 구조!
```

**2. TypeScript 기본 지원**

```ts
// NestJS - 컴파일 타임에 타입 검사
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNumber()
    @Min(0)
    @Max(150)
    age: number;
}

@Post()
create(@Body() createUserDto: CreateUserDto): Promise {
    // ✅ 타입 안전성 보장!
    return this.usersService.create(createUserDto);
}
```

**3. 자동 의존성 주입**

```ts
// NestJS - 자동 의존성 관리
@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService, // 자동 주입
    private emailService: EmailService // 자동 주입
  ) {}
}

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {} // 자동 주입
}
```

---

## 3. NestJS, Express.js 비교

### 3-1. 비교표

| 구분              | Express.js        | NestJS               |
| ----------------- | ----------------- | -------------------- |
| **학습 곡선**     | 쉬움              | 중간-어려움          |
| **프로젝트 구조** | 자유도 높음       | 강제된 구조          |
| **타입 안전성**   | JavaScript (약함) | TypeScript (강함)    |
| **의존성 관리**   | 수동              | 자동 (DI)            |
| **테스트 지원**   | 별도 설정 필요    | 내장 지원            |
| **API 문서화**    | 별도 도구 필요    | Swagger 자동 생성    |
| **확장성**        | 개발자 역량 의존  | 프레임워크 차원 지원 |

### 3-2. 사용하는 방법

**Express.js 선택**

```js
// 프로토타이핑
const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// 소규모 API
app.get("/api/data", (req, res) => {
  res.json({ data: "simple response" });
});

// 간단한 REST API
// 빠른 개발
```

**Nest JS**

```ts
// 복잡한 비즈니스 로직
@Injectable()
export class OrderService {
  constructor(
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {}

  async createOrder(orderDto: CreateOrderDto): Promise {
    // 복잡한 주문 처리 로직
    await this.inventoryService.checkAvailbility(orderDto.items);
    const payment = await this.paymentService.process(orderDto.payment);
    const order = await this.orderRepository.create(orderDto);
    await this.notificationService.sendOrderConfirmation(order);
    return order;
  }
}
// 대규모 애플리케이션
// 마이크로서비스 아키텍쳐
// 유지보수를 오래 필요한 경우
```

---

## 4. NestJS 개념 - 설계

### 4-1. 핵심 기능

**컨트롤러**

```ts
@Controller("users")
export class UsersController {
  @Get() // Get/users
  findAll() {}

  @Get("id:") // Get /users/12
  findOne(@Param("id") id: string) {}

  @Post() // Post /users
  create(@Body() createUserDto: CreateUserDto) {}

  @Put(":id") // PUT /users/12
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {}

  @Delete(":id") // DELETE /users
  remove(@Param("id") id: string) {}
}
```

**검증 데코**

```ts
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  eamil: string;

  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsOptionl()
  @IsString()
  phone?: string;
}
```

---

## 5. NestJS 다른 기능들

### 5-1. 🔄 모듈 시스템

```ts
// users.module.ts - 기능별 모듈화
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 다른 모듈 사용 가능
})
export class UsersModule {}

// app.module.ts - 루트 모듈
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UsersModule,
    OrdersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 5-2. 로깅

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log("Before...");

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now}() - now{}ms`)));
  }
}
```

### 5-3. API 문서

```ts
// swagger 설정 자동 API 문서 생성
@ApiTags('users')
@Controller('users')
export class UsersController {

  @ApiOperation({ summary: '사용자 목록 조회'})
  @ApiResponse({ status: 200m desciption: '사용자 목록', type: [User]});
  @Get()
  findAll(): Promise {
    return this.usersService.findAll();
  }

  @ApiOperation( { summary: '사용자 정의' })
  @ApiBody( {type: CreateUserDto })
  @Post()
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
// 결과: http://localhost:3000/api 에서 자동 생성된 API 문서 확인 가능

```

---

## 6. 프로젝트 구조 비교

### 6-1. Express

```js
express-app/
├── app.js                 # 메인 애플리케이션
├── routes/
│   ├── users.js          # 사용자 라우트
│   └── products.js       # 상품 라우트
├── controllers/
│   ├── userController.js
│   └── productController.js
├── models/
│   ├── User.js
│   └── Product.js
├── middleware/
│   ├── auth.js
│   └── validation.js
└── utils/
    └── database.js

// 각 파일이 독립적으로 구성됨
// 개발자마다 다른 패턴 사용 가능
```

### 6-2. NestJS

```ts
nestjs-app/
├── src/
│   ├── app.module.ts          # 루트 모듈
│   ├── main.ts               # 애플리케이션 시작점
│   ├── users/                # 사용자 모듈
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── products/             # 상품 모듈
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── entities/product.entity.ts
│   ├── auth/                 # 인증 모듈
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   └── strategies/
│   └── common/               # 공통 모듈
│       ├── filters/
│       ├── interceptors/
│       └── pipes/
└── test/                     # 테스트 파일

// 명확하고 일관된 구조
// 모든 NestJS 프로젝트가 동일한 패턴
```

---

## 정리

**발전 과정:**

- Node.js (런타임) → Express.js (웹 프레임워크) → NestJS (엔터프라이즈 프레임워크)

**핵심 차이:**

- Express.js: 자유도 높음, 간단함, 빠른 개발
- NestJS: 구조화됨, 타입 안전, 확장성 좋음
