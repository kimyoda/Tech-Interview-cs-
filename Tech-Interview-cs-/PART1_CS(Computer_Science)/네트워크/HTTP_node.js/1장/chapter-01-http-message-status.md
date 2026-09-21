# 1장. HTTP 메시지와 상태 코드

## 1. HTTP는 어느 계층에서 동작하는가

HTTP는 애플리케이션 계층 프로토콜이다. HTTP 메시지는 전송 과정에서 TCP 또는 QUIC, IP, 데이터 링크 계층의 헤더와 함께 캡슐화된다.

```text
HTTP/1.1·HTTP/2
HTTP 메시지 → TCP 세그먼트 → IP 패킷 → 프레임

HTTP/3
HTTP 메시지 → QUIC/UDP 데이터그램 → IP 패킷 → 프레임
```

소켓은 HTTP 자체가 아니라 프로그램이 운영체제의 네트워크 기능을 사용하는 인터페이스다. Node.js의 `http.createServer()`는 소켓 처리의 많은 부분을 감추고 HTTP 요청과 응답 객체를 제공한다.

## 2. HTTP/1.1 메시지 구조

요청은 시작 라인, 헤더, 빈 줄, 선택적인 본문으로 구성된다.

```http
GET /members/1 HTTP/1.1
Host: localhost:8080
Accept: application/json
```

응답도 상태 라인, 헤더, 빈 줄, 선택적인 본문으로 구성된다.

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 2

ok
```

HTTP/2와 HTTP/3은 메시지를 바이너리 프레임으로 전송하지만 메서드, 상태 코드, 헤더, 본문이라는 의미는 유지된다.

## 3. 상태 코드 분류

| 범위  | 의미                      | 대표 코드                                 |
| ----- | ------------------------- | ----------------------------------------- |
| `1xx` | 처리 중 정보              | `100 Continue`                            |
| `2xx` | 요청 성공                 | `200 OK`, `201 Created`, `204 No Content` |
| `3xx` | 추가 동작 또는 리다이렉션 | `301`, `302`, `304`, `307`, `308`         |
| `4xx` | 클라이언트 요청 문제      | `400`, `401`, `403`, `404`                |
| `5xx` | 서버 처리 문제            | `500`, `502`, `503`                       |

`400`은 요청 형식이나 값이 잘못된 경우에 사용한다. `500`은 예측하지 못한 서버 내부 오류에 사용하며, 클라이언트 입력 오류를 모두 `500`으로 반환하면 안 된다.

## 4. 커스텀 헤더

애플리케이션 전용 헤더를 만들 수 있다. 예전에는 `X-` 접두사를 흔히 사용했지만 현재 표준에서는 필수가 아니다. 공개적으로 오래 유지할 헤더라면 의미가 분명한 이름을 선택한다.

```http
X-Study-Message: world
```

## 5. 실습 파일

### JavaScript

| 파일                               | 확인할 내용                      |
| ---------------------------------- | -------------------------------- |
| [http1.js](http1.js)               | `200 OK` 응답                    |
| [http400.js](http400.js)           | `400 Bad Request` 응답           |
| [http500.js](http500.js)           | `500 Internal Server Error` 응답 |
| [customHeader.js](customHeader.js) | 사용자 정의 응답 헤더            |

### TypeScript

| 파일                     | 확인할 내용                            |
| ------------------------ | -------------------------------------- |
| [http1.ts](http1.ts)     | `200 OK` 응답과 Node.js 요청·응답 타입 |
| [http400.ts](http400.ts) | `400 Bad Request` 응답                 |
| [http500.ts](http500.ts) | `500 Internal Server Error` 응답       |

## 6. JavaScript 실습

현재 위치가 `HTTP_node.js` 폴더라면 터미널 1에서 다음과 같이 실행한다.

```bash
cd 1장
node http1.js
```

서버가 다음 메시지를 출력하면 종료하지 않고 그대로 둔다.

```text
http://localhost:8080에서 대기 중...
```

별도의 터미널 2에서 다음 명령을 실행한다.

```bash
curl -i http://localhost:8080
```

`curl`의 `-i` 옵션을 사용하면 응답 상태 라인, 응답 헤더, 응답 본문을 함께 확인할 수 있다.

`http400.js`를 확인하려면 터미널 1에서 기존 서버를 `Ctrl+C`로 종료한 후 실행한다.

```bash
node http400.js
```

터미널 2에서 다시 요청한다.

```bash
curl -i http://localhost:8080
```

`http500.js`도 같은 방법으로 확인한다.

```bash
node http500.js
```

```bash
curl -i http://localhost:8080
```

모든 예제가 `8080` 포트를 사용하므로 한 번에 하나의 서버만 실행해야 한다.

## 7. TypeScript 코드의 차이

JavaScript에서는 `req`와 `res`의 타입을 직접 작성하지 않는다.

```js
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
  });

  res.end("ok");
});
```

TypeScript에서는 Node.js가 제공하는 타입을 명시할 수 있다.

```ts
import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
    });

    res.end("ok");
  },
);
```

각 타입의 의미는 다음과 같다.

| 타입                   | 의미                               |
| ---------------------- | ---------------------------------- |
| `http.IncomingMessage` | 클라이언트가 보낸 HTTP 요청 객체   |
| `http.ServerResponse`  | 클라이언트에게 보낼 HTTP 응답 객체 |
| `void`                 | 함수가 별도의 값을 반환하지 않음   |

TypeScript 타입은 실행 중에 HTTP 응답을 변경하는 것이 아니라, 코드를 작성하고 컴파일하는 과정에서 잘못된 사용을 확인하도록 돕는다.

## 8. TypeScript 실습 준비

TypeScript 파일은 `1장` 폴더에 두고, `package.json`과 `tsconfig.json`은 상위 `HTTP_node.js` 폴더에 둔다.

```text
HTTP_node.js/
├── package.json
├── package-lock.json
├── tsconfig.json
├── 1장/
│   ├── http1.js
│   ├── http1.ts
│   ├── http400.js
│   ├── http400.ts
│   ├── http500.js
│   └── http500.ts
└── dist/
```

`HTTP_node.js` 폴더에서 최초 한 번 패키지를 설치한다.

```bash
npm install
```

TypeScript 타입 검사만 실행할 때는 다음 명령을 사용한다.

```bash
npm run check:ts
```

타입 검사가 성공하면 TypeScript 파일을 JavaScript로 컴파일한다.

```bash
npm run build:ts
```

컴파일 결과는 `dist` 폴더에 생성된다.

```text
dist/
├── http1.js
├── http400.js
└── http500.js
```

`.gitignore`에 `dist/`를 추가해도 컴파일 결과 생성은 정상적으로 이루어진다. `.gitignore`는 Git이 해당 파일을 추적하지 않게 할 뿐이다.

## 9. TypeScript 서버 실행

터미널 1에서 `HTTP_node.js` 폴더로 이동한 후 실행한다.

```bash
npm run build:ts
npm run start:ts:http1
```

`start:ts:http1` 스크립트 안에 빌드 명령도 포함했다면 다음 한 줄만 실행하면 된다.

```bash
npm run start:ts:http1
```

서버가 실행 중인 상태에서 터미널 2를 열어 요청한다.

```bash
curl -i http://localhost:8080
```

400 응답을 확인하려면 기존 서버를 `Ctrl+C`로 종료한 후 실행한다.

```bash
npm run start:ts:http400
```

```bash
curl -i http://localhost:8080
```

500 응답도 같은 방법으로 확인한다.

```bash
npm run start:ts:http500
```

```bash
curl -i http://localhost:8080
```

TypeScript 실행 과정은 다음과 같다.

```text
1장/http1.ts
    ↓ tsc 컴파일 및 타입 검사
dist/http1.js
    ↓ Node.js 실행
HTTP 서버 시작
```

Node.js가 원본 `.ts` 파일을 직접 실행하는 것은 아니지만, TypeScript로 작성한 코드를 타입 검사하고 JavaScript로 컴파일해서 실행하는 일반적인 TypeScript 실행 방식이다.

## 10. 예상 결과

| 실행 파일                  | 상태 라인                            | 응답 본문                             |
| -------------------------- | ------------------------------------ | ------------------------------------- |
| `http1.js`, `http1.ts`     | `HTTP/1.1 200 OK`                    | `ok`                                  |
| `http400.js`, `http400.ts` | `HTTP/1.1 400 Bad Request`           | `{"message":"잘못된 요청입니다."}`    |
| `http500.js`, `http500.ts` | `HTTP/1.1 500 Internal Server Error` | `{"message":"서버 내부 오류입니다."}` |

JavaScript 버전과 TypeScript 버전은 동일한 HTTP 응답을 반환한다. TypeScript 버전에는 요청 및 응답 객체에 대한 타입 검사가 추가된다.

## 11. 면접 체크

- HTTP 요청과 응답 메시지는 어떤 부분으로 구성되는가?
- `4xx`와 `5xx`의 책임 차이는 무엇인가?
- HTTP의 헤더와 본문은 어떻게 구분되는가?
- `http.IncomingMessage`는 어떤 정보를 제공하는가?
- `http.ServerResponse`는 어떤 역할을 하는가?
- TypeScript 타입은 HTTP 서버 실행 과정에서 어떤 도움을 주는가?
- `tsc`로 컴파일한 후 Node.js가 실행하는 파일은 `.ts`인가 `.js`인가?
- HTTP/2에서 텍스트 상태 라인이 보이지 않아도 상태 코드의 의미가 유지되는 이유는 무엇인가?
