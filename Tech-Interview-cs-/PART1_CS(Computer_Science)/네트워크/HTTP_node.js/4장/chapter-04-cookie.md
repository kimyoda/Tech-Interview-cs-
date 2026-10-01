# 4장 HTTP 쿠키

## 쿠키의 역할

HTTP는 기본적으로 각 요청을 독립적으로 처리한다. 쿠키를 사용하면 서버가 브라우저에 작은 값을 저장하도록 지시, 브라우저가 조건에 맞는 다음 요청에 그 값을 전송하게 할 수 있다

```http
Set-Cookie: sessionId=abc123; path=/; HttpOnly; Secure; SameSite=Lax
```

다음 요청에 브라우저가 보내는 헤더는 다음과 같다

```http
Cookie: sessionId=abc123
```

쿠키에 비밀번호나 민감한 원문을 직접 넣지 않는다. 세션 쿠키도 탈취되면 계정 접근에 악용될 수 있어 속성, 짧은 만료 시간, 서버 측 검증이 중요

## 주요 속성

| 속성       | 의미                                                                 |
| ---------- | -------------------------------------------------------------------- |
| `MAX-Age`  | 현재부터 쿠키가 유지될 초 단위 시간                                  |
| `Expires`  | 쿠키가 만료되는 절대 시각                                            |
| `Domain`   | 쿠키를 보낼 호스트 범위                                              |
| `Path`     | 쿠키를 보낼 URL 경로 범위                                            |
| `HpptOnly` | JavaScript의 `document.cookie` 접근 차단                             |
| `Secure`   | HTTPS 요청에서만 전송. `localhost` 는 브라우저별 예외가 있을 수 있다 |
| `SameSite` | 교차 사이트 요청에 쿠키 전송 범위 제어                               |

`SameSite=None` 은 반드시 `Secure`와 함께 사용해야 현대 브라우저에 정상적으로 설정된다. CSRF 방어는 `SameSite`만 믿기보다 CSRF 토큰과 Origin 검증 등을 함께 고려한다

쿠키 값에는 ASCII 범위를 벗어난 문자를 그대로 넣지 않고 `encodeURIComponent` 등으로 인코딩한다

## 실습

| 파일                     | 확인할 내용                               |
| ------------------------ | ----------------------------------------- |
| [cookie.js](cookie.js)   | `HttpOnly`, `SameSite=Lax` 세션 쿠키      |
| [cookie2.js](cookie2.js) | `Max-Age`를 사용한 만료 시간              |
| [cookie3.js](cookie3.js) | HTTPS 환경용 `SameSite=None; Secure` 쿠키 |

```bash
node cookie.js
curl -i http://localhost:8080
```

### TypeScript 실습 파일

| JavaScript 파일          | TypeScript 파일          | 확인할 내용                            |
| ------------------------ | ------------------------ | -------------------------------------- |
| [cookie.js](cookie.js)   | [cookie.ts](cookie.ts)   | 세션 쿠키와 `HttpOnly`, `SameSite=Lax` |
| [cookie2.js](cookie2.js) | [cookie2.ts](cookie2.ts) | `Max-Age=200`                          |
| [cookie3.js](cookie3.js) | [cookie3.ts](cookie3.ts) | `SameSite=None; Secure` 응답 헤더      |

TypeScript 파일은 JavaScript 예제와 같은 응답을 만든다. `req`에는 `http.IncomingMessage`, `res`에는 `http.ServerResponse` 타입을 지정해 컴파일할 때 사용 방법을 검사한다.

### TypeScript 실행

`HTTP_node.js` 폴더 또는 그 아래 `4장` 폴더에서 원하는 서버 하나를 실행한다.

```bash
npm run start:ts:cookie
```

또는 기존 서버를 `Ctrl+C`로 종료한 뒤 다른 예제를 실행한다.

```bash
npm run start:ts:cookie2
npm run start:ts:cookie3
```

각 명령은 해당 `.ts` 파일 하나를 컴파일하고 생성된 `dist/4장/*.js`를 바로 실행한다. 세 서버 모두 8080 포트를 사용하므로 한 번에 하나만 실행한다.

서버를 켜 둔 채 다른 터미널에서 응답 헤더를 확인한다.
