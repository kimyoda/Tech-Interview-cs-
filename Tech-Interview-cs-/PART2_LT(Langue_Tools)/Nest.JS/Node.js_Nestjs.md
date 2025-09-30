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

**2. 타입 안전성 부족**

**3. 의존성 관리 어려움**

### 2-2. NestJS로의 발전

**1. 보다 나은 아키텍처 제공**

**2. TypeScript 기본 지원**

**3. 자동 의존성 주입**

---
