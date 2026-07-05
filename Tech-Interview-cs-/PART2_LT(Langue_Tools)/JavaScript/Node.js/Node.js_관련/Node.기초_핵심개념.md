# 노드 시작하기(TypeScript 기반)

> Node.js 핵심 개념 이해, TypeScript 개발 환경을 구축한다.
> Node.js가 왜 빠른지, 싱글 스레드인데 동시 요청을 어떻게 처리하는 지 등 관련 내용을 공부하였다.

---

## 핵심 개념 이해하기

```
Node.js 개념 5가지

서버(HTTP) -> JS 런타임 (V8 엔진) -> 이벤트 기반(콜백/이벤트 루프)

-> 논블로킹 I/O (liubv 스레드풀) -> 싱글 스레드(메인 실행 흐름)
```

### 서버

서버는 클라이언트 요청에 응답하는 프로그램이다. Node.js 자바스크립트 서버를 만들 수 있게 해주는 **런타임 환경**이다.

```ts
// src/basic-server.ts
import http, { IncomingMessage, ServerResponse } from "http";

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Hello Node.js with TypeScript!");
  },
);

server.listen(3000, () => {
  console.log("서버가 3000번 포트에서 실행 중입니다.");
});
```

```bash
npx ts-node src/basic-server.ts
```

### 자바스크립트 런타임

Node.js는 크롬의 **V8 자바스크립트 엔진**을 사용한다. 브라우저 밖에서도 자바스크립트를 실행할 수 있게 해주는 것이 Node.js다.

```
브라우저, Node.js 환경

브라우저
- V8 엔진
+ DOM API + Web API(Window 객체)

Node.js
- V8 엔진
+ libuv + 내장 모듈(fs 등) | (global 객체)
```

> 💡 TypeScript는 V8이 직접 실행하지 못합니다. `tsc`로 JavaScript로 컴파일된 후 V8에서 실행되는 구조이다.

### 이벤트 기반

Node.js는 **이벤트 발생 시 콜백을 호출**하는 방식으로 동작한다. 파일을 읽거나, DB에 쿼리를 보내거나, HTTP 요청을 받는 모든 작업이 이벤트다.

```ts
// src/event-emitter.ts
import { EventEmitter } from "events";

interface UserEvents {
  login: (userId: string) => void;
  logout: (userId: string) => void;
}

class UserEventEmitter extends EventEmitter {
  emitLogin(userId: string): void {
    this.emit("login", userId);
  }

  onLogin(callback: (userId: string) => void): void {
    this.on("login", callback);
  }
}

const userEvents = new UserEventEmitter();

userEvents.onLogin((userId: string) => {
  console.log(`사용자 ${userId} 로그인 됨`);
});

userEvents.emitLogin("user-123");
```

### 논블로킹 I/O

I/O 작업(파일, 네트워크, DB)을 기다리는 동안 다른 작업을 차단하지 않는 방식이다. Node.js가 적은 자원으로 많은 동시 요청을 처리할 수 있는 이유이다.

```ts
// src/blocking-nonblocking.ts
import fs from "fs";

// 블로킹 - 파일을 다 읽기까지 다음 코드가 실행되지 않는다
function blockingRead(): void {
  const data: Buffer = fs.readFileSync("./large-file.txt");
  console.log("블로킹 읽기 완료:", data.length);
}

// 논블로킹 - 읽는 동안 다른 작업이 계속 실행된다
function nonBlockingRead(): void {
  fs.readFile(
    "./large-file.txt",
    (err: NodeJS.ErronException | null, data: Buffer) => {
      if (err) {
        throw err;
        console.log("논블로킹 읽기 완료", data.length);
      }
    },
  );
  console.log("이 로그는 파일 읽기보다 먼저 출력한다.");
}

nonBlockingRead();
```

```
블로킹, 논블로킹 흐름

블로킹
요청1 - [I/O 대기] -> 응답1
                    요청2 - [I/O 대기] -> 응답2

논블로킹
요청1
요청2  -> [동시에 I/O 진행] -> 응답1, 응답2 (완료 순서대로)
요청3
```

### 싱글 스레드

## 참고 자료

- [Node.js 공식 사이트](https://nodejs.org/ko)
- [Node.js 공식 가이드](https://nodejs.org/en/docs/guides/)
- [이벤트 루프 시각적 설명 (Loupe)](http://latentflip.com/loupe)
- [이벤트 루프 공식 설명](https://nodejs.org/ko/docs/guides/event-loop-timers-and-nexttick/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Node.js 교과서 1장](https://thebook.io/080334/0001/)
