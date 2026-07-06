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

Node.js의 자바스크립트 실행 자체는 **단일 스레드**에서 이뤄진다. 내부적으로 `libuv`가 별도의 스레드풀을 사용해 I/O 작업을 처리한다.

```ts
// src/single-thread-trap.ts

// 집약적인 작업은 싱글 스레드를 블로킹 시킨다
function heavyComputation(): number {
  let result = 0;
  for (let i = 0; i < 10_000_000_000; i++) {
    result += 1;
  }
  return result;
}
// 해당 함수가 실행되는 동안 서버는 다른 요청을 처리할 수 없다
// Worker Threads나 별도 프로세스로 분리 되어야 한다
```

> I/O 작업 (DB 조회, 파일 읽기, 네트워크 요청) `libuv` 스레드 풀과 커널이 비동기로 처리하기 때문에 메인 스레드를 막지 않는다.
> 이미지 처리, 암호화, 대량 반복 연산 같은 **CPU 집약적 작업**이다. 해당 작업은 `worker_threads`나 별도 프로세스로 분리해야 한다.

---

## 2. 서버로서의 노드

Node.js가 웹 서버로 많이 쓰이는 이유다.

| 장점              | 설명                                                 |
| ----------------- | ---------------------------------------------------- |
| 빠른 I/O 처리     | 논블로킹 I/O + 이벤트 루프로 동시 연결 처리에 유리   |
| 동일 언어         | 프론트엔드(JS/TS)와 백엔드를 같은 언어로 작성이 가능 |
| 다양한 라이브러리 | npm에 많은 패키지                                    |
| 빠른 개발 속도    | Express, NestJS 등 프레임워크로 빠른 프로토타이핑    |

```ts
// src/rest-api-basic.ts
import http, { IncomingMessage, ServerResponse } from "http";

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "홍길동" },
  { id: 2, name: "김철수" },
];

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/users" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
      return;
    }

    res.writehEAD(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  },
);

server.listen(3000, () =>
  console.log("API 서버 실행 중: http://localhost:3000"),
);
```

> Node.js가 CPU의 집약적인 연산(영상 인코딩, 대량 이미지 처리 등)에는 적합하지 않다는 것도 알고 있어야 한다.

---

## 3. 서버 외의 노드

Node.js는 서버 외에도 다양한 영역에서 사용한다.

```
Node.js 활용

CLI 도구(npm, eslint), 빌드 도구(webpack, vite), 데스크톱 앱(Electron)

자동화 스크립트(배치, 크론), 서버리스 함수(Lambda), IoT(라즈베리파이)
```

```ts
// src/cli-script-example.ts
// 간단한 파일 정리 CLI 스크립트 예시
import fs from "fs";
import path from "path";

function cleanupOldFiles(directory: string, daysOld: number): void {
  const files: string[] = fs.readdirSync(directory);
  const now: number = Date.now();
  const threshold: number = daysOld * 24 * 60 * 60 * 1000;

  files.forEach((file: string) => {
    const filePath: string = path.join(directory, file);
    const stats: fs.Stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > threshold) {
      fs.unlinkSync(filePath);
      console.log(`삭제됨: ${file}`);
    }
  });
}

// 사용예시: 30일 이상 된 로그 파일 정리
cleanupOldFiles("./logs", 30);
```

---

## 4. 개발 환경 설정(TypeScript)

### 노드 설치하기

```bash
# nvm으로 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install --lts
nvm use --lts

# 버전 확인
node -v
npm -v
```

### npm 버전 업데이트하기

```bash
npm install -g npm@latest
npm -v
```

### TypeScript 프로젝트 초기 설정

```bash
mkdir my-node-ts-project && cd my-node-ts-project

npm init -y
npm install -D typescript ts-node @types/node nodemon
npx tsc --init
```

```json
// tsconfig.json (실무 권장 옵션)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```json
// package.json scripts 영역
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 동작 확인

```ts
// src/index.ts
console.log('TypeScript + Node.js 환경 설정 완료!');

interface Greeting {
  message: string;
  timestamp: Date;
}

const greet: Greeting = {
  message: 'Hello, Node.js Textbook in TypeScript',
  timestamp: new Date(),
};

console.,log(greet);
```

```bash
npm run dev
```

## 참고 자료

- [Node.js 공식 사이트](https://nodejs.org/ko)
- [Node.js 공식 가이드](https://nodejs.org/en/docs/guides/)
- [이벤트 루프 시각적 설명 (Loupe)](http://latentflip.com/loupe)
- [이벤트 루프 공식 설명](https://nodejs.org/ko/docs/guides/event-loop-timers-and-nexttick/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Node.js 교과서 1장](https://thebook.io/080334/0001/)
