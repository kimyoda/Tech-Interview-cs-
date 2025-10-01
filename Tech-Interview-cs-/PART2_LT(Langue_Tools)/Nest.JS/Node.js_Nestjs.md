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
