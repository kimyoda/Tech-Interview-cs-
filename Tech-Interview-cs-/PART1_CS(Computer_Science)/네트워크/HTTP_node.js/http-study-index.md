# HTTP 학습 자료 작성 중

이 자료는 HTTP의 기본 메시지부터 HTTP/3까지 순서대로 학습하고, Node.js 예제로 직접 응답 헤더와 동작을 확인할 수 있도록 구성했다.

## 학습 순서

1. [HTTP 메시지와 상태 코드](chapter-01-http-message-status.md)

---

## 작성예정

2. [HTTP 리다이렉션](chapter-02-redirect.md)
3. [콘텐츠 협상과 CORS](chapter-03-content-negotiation-cors.md)
4. [HTTP 쿠키](chapter-04-cookie.md)
5. [HTTP 캐시](chapter-05-cache.md)
6. [HTTPS·Proxy·Gateway](chapter-06-https-proxy-gateway.md)
7. [WebSocket](chapter-07-websocket.md)
8. [HTTP/2와 HTTP/3](chapter-08-http2-http3.md)

## 실습 파일

### JavaScript

| 파일                                   | 확인할 내용                      |
| -------------------------------------- | -------------------------------- |
| [http1.js](1장/http1.js)               | `200 OK` 응답                    |
| [http400.js](1장/http400.js)           | `400 Bad Request` 응답           |
| [http500.js](1장/http500.js)           | `500 Internal Server Error` 응답 |
| [customHeader.js](1장/customHeader.js) | 사용자 정의 응답 헤더            |

### TypeScript

| 파일                         | 확인할 내용                      |
| ---------------------------- | -------------------------------- |
| [http1.ts](1장/http1.ts)     | `200 OK` 응답                    |
| [http400.ts](1장/http400.ts) | `400 Bad Request` 응답           |
| [http500.ts](1장/http500.ts) | `500 Internal Server Error` 응답 |

## 작성 예정인 실습 파일

| 장  | 파일                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2장 | [redirect.js](redirect.js)                                                                                                                                 |
| 3장 | [contentNegotiation.js](contentNegotiation.js), [cors.js](cors.js)                                                                                         |
| 4장 | [cookie.js](cookie.js), [cookie2.js](cookie2.js), [cookie3.js](cookie3.js)                                                                                 |
| 5장 | [cache.js](cache.js), [cacheNoCache.js](cacheNoCache.js), [cacheNoStore.js](cacheNoStore.js), [cachePublic.js](cachePublic.js), [cacheSWR.js](cacheSWR.js) |
| 7장 | [socket.js](socket.js), [socket.html](socket.html), [package.json](package.json)                                                                           |

## JavaScript 실행 방법

현재 위치가 `HTTP_node.js` 폴더라면 먼저 `1장` 폴더로 이동한다.

```bash
cd 1장
```

터미널 1에서 JavaScript 서버를 실행한다.

```bash
node http1.js
```

서버를 종료하지 않고 터미널 2에서 요청한다.

```bash
curl -i http://localhost:8080
```

400 또는 500 응답을 확인할 때는 터미널 1의 기존 서버를 `Ctrl+C`로 종료한 후 다른 서버를 실행한다.

```bash
node http400.js
```

또는:

```bash
node http500.js
```

터미널 2에서는 동일한 명령으로 확인한다.

```bash
curl -i http://localhost:8080
```

## TypeScript 실행 방법

TypeScript 설정 파일과 npm 패키지는 상위 `HTTP_node.js` 폴더에서 관리한다.

현재 `1장` 폴더에 있다면 상위 폴더로 이동한다.

```bash
cd ..
```

최초 한 번 의존성을 설치한다.

```bash
npm install
```

타입 검사만 실행하려면 다음 명령을 사용한다.

```bash
npm run check:ts
```

TypeScript 파일을 JavaScript로 컴파일한다.

```bash
npm run build:ts
```

컴파일된 `http1` 서버를 실행한다.

```bash
npm run start:ts:http1
```

서버를 종료하지 않고 별도의 터미널에서 요청한다.

```bash
curl -i http://localhost:8080
```

400 응답을 확인하려면 기존 서버를 `Ctrl+C`로 종료한 후 실행한다.

```bash
npm run start:ts:http400
```

500 응답을 확인할 때도 기존 서버를 종료한 후 실행한다.

```bash
npm run start:ts:http500
```

모든 HTTP 예제는 `8080` 포트를 사용하므로 한 번에 하나의 서버만 실행해야 한다.

TypeScript의 실행 과정은 다음과 같다.

```text
1장/*.ts
   ↓ TypeScript 컴파일
dist/*.js
   ↓ Node.js 실행
HTTP 서버 시작
```
