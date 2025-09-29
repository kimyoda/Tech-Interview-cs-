# 🌐 Node.js CS 개념 정리

## 1. Node.js 정체성

### 1-1. 🎯 Node.js의 정확한 정의

**Node.js는 언어가 아니다.**

- **Node.js = JavaScript 런타임 환경(Runtime Environment)**
- JavaScript V8 엔진을 기반으로 한 실행환경이다.
- 브라우저 밖에서 JavaScript를 실행할 수 있게 하는 플랫폼이다.

```js
// JavaScript 언어
const message = "Hello World";
console.log(message);

// Node.js 환경에서 실행된다.
// 브라우저가 아닌 서버 / 데스크탑 실행된다
```

### 1-2. 🔍 언어 vs 런타임 환경 구분

```js
JavaScript (언어)
├── 문법과 규칙
├── 변수, 함수, 객체 등의 개념
└── ECMAScript 표준 준수

Node.js (런타임 환경)
├── JavaScript 코드를 실행하는 환경
├── 파일 시스템 접근 기능
├── 네트워크 기능
└── 운영체제와의 상호작용
```

- JavaScript = 언어
- 브라우저 = 환경
- Node.js = 다른 환경(비슷한)

---

## 2. JavaScript 서버

### 2-1. 🌅 JavaScript의 탄생과 목적

**원래 JavaScript의 한계:**

```js
//  오직 브라우저만 가능
document.getElementById("button").addEventListener("click", function () {
  alert("버튼이 클릭되었다.");
});

// 할 수 없었던 것들:
// ❌ 파일 읽기/쓰기
// ❌ 서버 생성
// ❌ 운영체제 명령어 실행
```

### 2-2. 🚀 Node.js의 활용

**Node.js로 가능하게 하는 것:**

```js
//  HTTP 서버 생성
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("Hello from Node.js Server!");
});

// 데이터베이스 연결
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "password",
  database: "myapp",
});
```

## 3. Node.js 아키텍처

### 3-1. 🏗️ Node.js 내부 구조

**Node.js로 가능하게 하는 것:**

```js
Node.js 아키텍처
├── JavaScript Code (개발자가 작성)
├── Node.js APIs (fs, http, path 등)
├── Node.js Bindings (C++과 JavaScript 연결)
├── V8 Engine (JavaScript 해석/실행)
├── libuv (이벤트 루프, 비동기 I/O)
└── Operating System (파일시스템, 네트워크)
```

### 3-2. 🔄 이벤트 루프 (Event Loop) - Node.js의 핵심

**동기, 비동기 처리**

```js
// 동기 처리 - 다른 언어들의 일반적 방식
console.log("1");
const data = readFileSync("large-file.txt"); // 파일 읽을때 까지 대기 후 실행
console.log("2");
consoel.log(data);

// ✅ Node.js 비동기 처리 (Non-blocking)
console.log("1");
readFile("large-file.txt", (err, data) => {
  console.log(data); // 파일 읽기 완료 후 실행
});

console.log("2"); // 파일 읽는 동안 실행

// 순서 : 1 + 2 -> 파일 확인
```

### 3-3. 🎯 Single Thread vs Multi Thread

**전통적인 서버 (Multi-Thread)**

```js
요청1 → Thread1 ─┐
요청2 → Thread2 ─┤── 각각 독립적으로 처리
요청3 → Thread3 ─┘
메모리 사용량: 높음, Context Switching 비용 발생
```

**Node.js (Single Thread + Event Loop)**

```js
요청1 ┐
요청2 ├── Event Loop ── 하나의 Thread에서 순차 처리
요청3 ┘
메모리 사용량: 낮음, Context Switching 없음
```

---

## 4. 다른 서버 비교

### 4-1. 📊 성능 특성 비교

| 구분            | Node.js     | PHP         | Java        | Python      |
| --------------- | ----------- | ----------- | ----------- | ----------- |
| **언어 기반**   | JavaScript  | PHP         | Java        | Python      |
| **실행 방식**   | 인터프리터  | 인터프리터  | 컴파일      | 인터프리터  |
| **동시성 모델** | 이벤트 기반 | 스레드 기반 | 스레드 기반 | 스레드 기반 |
| **메모리 사용** | 낮음        | 중간        | 높음        | 중간        |
| **학습 곡선**   | 쉬움        | 쉬움        | 어려움      | 쉬움        |

---

## 5. Node.js 생태계 - "개발 도구들의 천국"

### 5-1. 📦 NPM (Node Package Manager)

```javascript
// package.json - 프로젝트의 설계도
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",    // 웹 프레임워크
    "mongoose": "^6.0.0",    // MongoDB ODM
    "lodash": "^4.17.0"      // 유틸리티 라이브러리
  },
  "devDependencies": {
    "nodemon": "^2.0.0",     // 개발 서버
    "jest": "^27.0.0"        // 테스트 프레임워크
  }
}

// 설치 및 사용
npm install express
const express = require('express');
```

### 5-2. 🚀 주요 프레임워크와 라이브러리

**1. Express.js - 웹 프레임워크**

```javascript
const express = require("express");
const app = express();

// 미들웨어 패턴
app.use(express.json()); // JSON 파싱
app.use("/api", authMiddleware); // 인증 미들웨어

// 라우팅
app.get("/users/:id", (req, res) => {
  const user = getUserById(req.params.id);
  res.json(user);
});
```

## 정리: Node.js의 정체성

**Node.js는:**

- ❌ 새로운 프로그래밍 언어가 아님
- ✅ JavaScript를 서버에서 실행할 수 있게 해주는 런타임 환경
- ✅ 이벤트 기반, 비동기 I/O 모델로 높은 성능 제공
- ✅ 풍부한 생태계(NPM)를 가진 개발 플랫폼

**CS 학습에 Node.js가 좋은 이유:**

- 운영체제, 네트워크, 데이터베이스 등 다양한 CS 개념을 실습할 수 있음
- 상대적으로 진입 장벽이 낮아 CS 이론을 코드로 구현하기 좋음
- 현업에서 많이 사용되어 실무 경험도 함께 쌓을 수 있음
