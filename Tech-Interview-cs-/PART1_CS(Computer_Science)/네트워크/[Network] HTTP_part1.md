# 🌐 HTTP Part 1

> 비전공자도 이해할 수 있도록 정리한 자료이다.

---

## 1. HTTP란?

HTTP는 `HyperText Transfer Protocol`의 약자로, 클라이언트와 서버가 데이터를 주고받기 위한 애플리케이션 계층 프로토콜이다.

하이퍼텍스트를 전송하는 규칙으로 시작했지만, 현재는 인터넷에서 데이터를 주고받는 거의 모든 곳에 사용된다.

**HTTP로 전송할 수 있는 것들**

| 종류   | 예시                        |
| ------ | --------------------------- |
| 문서   | HTML, Text, CSS, JavaScript |
| 미디어 | 이미지, 음성, 영상          |
| 데이터 | JSON, XML 등 API 데이터     |
| 기타   | PDF, 압축 파일, 실행 파일   |

```text
클라이언트가 HTTP 요청을 보낸다
→ 서버가 요청을 처리한다
→ 서버가 HTTP 응답을 반환한다
```

> 유튜브 영상을 보거나 쇼핑몰에서 상품을 주문하는 등 대부분의 웹 통신에 HTTP가 사용된다.

### HTTP와 HTTPS

HTTPS는 완전히 별개의 프로토콜이라기보다 **TLS로 보호되는 HTTP 통신**을 의미한다.

```text
HTTP  = HTTP 메시지를 평문으로 전송
HTTPS = HTTP 메시지를 TLS로 암호화하여 전송
```

HTTPS는 다음을 제공한다.

- 기밀성: 통신 내용을 제삼자가 쉽게 읽지 못하게 한다.
- 무결성: 전송 중 데이터가 변경되었는지 검증한다.
- 서버 인증: 접속한 서버가 인증서의 주체와 일치하는지 확인한다.

---

## 2. HTTP의 역사

```text
1991년  HTTP/0.9
        GET 메서드만 존재했던 기초적인 버전

1996년  HTTP/1.0
        메서드와 헤더가 추가됨
        요청마다 새로운 연결을 사용하는 방식

1997년  HTTP/1.1
        지속 연결, Host 헤더, 캐시 제어 등이 개선됨
        현재까지도 널리 사용되는 버전

2015년  HTTP/2
        하나의 TCP 연결에서 여러 요청을 처리하는 멀티플렉싱 지원
        헤더 압축 등 성능 개선

현재    HTTP/3
        TCP 대신 QUIC을 사용
        스트림 간 전송 지연 문제 개선
```

### 전송 계층 비교

```text
HTTP/1.1, HTTP/2 → TCP 기반
HTTP/3           → QUIC 기반
```

HTTP/3가 QUIC을 사용한다고 해서 신뢰성 없는 통신을 그대로 사용한다는 뜻은 아니다.

QUIC이 패킷 재전송, 흐름 제어, 혼잡 제어와 같은 신뢰성 기능을 제공한다.

HTTP 메서드, 상태 코드, 헤더와 같은 핵심 의미는 버전이 달라져도 대부분 유지된다. 따라서 HTTP/1.1 메시지 형태를 기준으로 기본 개념을 학습할 수 있다.

---

## 3. 클라이언트·서버 구조

HTTP는 `요청(Request) → 응답(Response)` 구조로 작동한다.

```text
클라이언트                                                서버
    │                                                       │
    │  ① 요청: GET /members/1 HTTP/1.1                      │
    │ ─────────────────────────────────────────────────────> │
    │                                                       │
    │                         요청 처리 및 결과 생성          │
    │                                                       │
    │  ② 응답: HTTP/1.1 200 OK                              │
    │          {"id": 1}                                    │
    │ <───────────────────────────────────────────────────── │
```

- 클라이언트: 요청하는 쪽으로, 브라우저나 모바일 앱 등이 해당한다.
- 서버: 요청을 받아 처리하고 응답을 반환하는 쪽이다.

### 역할을 분리하는 이유

| 계층       | 주요 책임                                     |
| ---------- | --------------------------------------------- |
| 클라이언트 | 화면 표시, 사용자 입력, 사용자 경험           |
| 서버       | 인증, 인가, 비즈니스 로직, 데이터 저장과 조회 |

클라이언트와 서버의 역할을 분리하면 각각의 역할에 집중할 수 있고, 독립적으로 개발하고 확장하기 쉬워진다.

다만 API 요청 형식과 응답 형식이라는 계약은 서로 합의되어야 한다.

---

## 4. Stateful과 Stateless

서버가 클라이언트의 이전 상태를 기억하는지에 따른 차이이다.

### Stateful(상태 유지)

서버가 이전 대화 내용을 기억하고 다음 요청을 처리할 때 사용한다.

```text
고객: 이 노트북 얼마인가요?
점원: 100만 원입니다.              ← "노트북" 기억

고객: 2개 구매하겠습니다.
점원: 200만 원입니다. 카드/현금?   ← "노트북 2개" 기억

고객: 신용카드로 구매할게요.
점원: 200만 원 결제 완료!
```

**점원이 중간에 바뀐다면?**

```text
고객: 2개 구매하겠습니다.
점원 B: 무엇을 2개 구매하시겠어요?  ← 이전 대화를 기억하지 못함
```

서버 한 대의 메모리에만 상태를 저장하면 다음 요청도 같은 서버로 보내는 고정 세션이 필요할 수 있다.

해당 서버에 장애가 발생하면 상태를 잃을 수도 있다.

여러 서버가 Redis나 데이터베이스 같은 공용 저장소에 세션을 공유하면 반드시 같은 서버가 처리할 필요는 없다. 다만 상태 저장과 동기화에 추가 비용이 발생한다.

> 서버의 로컬 메모리에만 상태를 저장했다면 항상 같은 서버가 응답해야 할 수 있다. 해당 서버에 장애가 발생하면 대화가 처음부터 다시 시작될 수 있다.

### Stateless(무상태)

서버가 클라이언트의 이전 요청 상태를 기억하지 않는 방식이다.

클라이언트가 요청을 처리하는 데 필요한 정보를 매번 포함하여 보낸다.

```text
고객: 노트북 2개를 신용카드로 구매하겠습니다.
점원 C: 200만 원 결제 완료!
```

각 요청이 필요한 정보를 모두 포함하므로 어느 서버가 요청을 받아도 같은 방식으로 처리하기 쉽다.

따라서 장애 대응과 수평 확장에 유리하다.

| 구분                       | Stateful          | Stateless                 |
| -------------------------- | ----------------- | ------------------------- |
| 서버가 상태를 기억하는가?  | 예                | 아니요                    |
| 항상 같은 서버가 필요한가? | 필요할 수 있음    | 일반적으로 필요하지 않음  |
| 서버 장애 대응             | 상대적으로 취약   | 다른 서버로 전환하기 쉬움 |
| 스케일 아웃                | 상대적으로 어려움 | 상대적으로 쉬움           |

> 스케일 아웃은 서버를 여러 대로 늘려 트래픽을 분산하는 방식이다.

- Stateless 예시: 로그인하지 않고 이용하는 단순 정보 조회
- Stateful 요소가 필요한 예시: 로그인 상태 유지

가능하면 요청 사이의 상태 의존성을 최소화하는 것이 좋다.

### 헷갈리기 쉬운 부분

Stateless는 다음과 같은 의미가 아니다.

- 데이터베이스를 사용하지 않는다는 뜻이 아니다.
- 로그인 기능을 만들 수 없다는 뜻이 아니다.
- 서버가 어떤 데이터도 저장하면 안 된다는 뜻이 아니다.

핵심은 **요청 사이의 문맥을 특정 서버의 로컬 상태에 의존하지 않는 것**이다.

#### 세션 방식

```text
클라이언트 쿠키
sessionId=abc123

서버 또는 Redis
abc123 → userId=10
```

클라이언트는 세션 ID를 보내고 서버는 세션 저장소에서 로그인 정보를 조회한다.

인증 상태가 서버 측 저장소에 있으므로 애플리케이션 수준에서는 Stateful한 방식이다.

#### 토큰 방식

클라이언트가 요청할 때 액세스 토큰을 보내고 서버는 토큰을 검증한다.

JWT처럼 필요한 정보를 토큰 자체에 담으면 서버의 세션 저장소 의존성을 줄일 수 있다.

```http
Authorization: Bearer eyJhbGciOi...
```

다만 로그아웃, 토큰 폐기, 재발급 토큰 관리 등을 위해 별도의 상태 저장소를 사용할 수도 있다.

따라서 JWT를 사용한다고 해서 항상 완전히 Stateless한 것은 아니다.

---

## 5. 비연결성과 HTTP 연결 관리

HTTP의 요청과 응답은 한 번의 작업 단위로 독립적이다.

비연결성은 애플리케이션의 요청을 처리하지 않는 동안 네트워크 연결을 계속 유지하지 않아도 된다는 의미이다.

하지만 **응답을 보낼 때마다 네트워크 연결을 반드시 즉시 끊는 것**으로 이해하면 안 된다.

### 연결 유지와 비연결

| 구분      | 연결 유지                        | 비연결                                  |
| --------- | -------------------------------- | --------------------------------------- |
| 방식      | 하나의 연결을 여러 요청에 재사용 | 필요하지 않은 연결을 계속 유지하지 않음 |
| 서버 자원 | 연결이 유지되는 동안 사용        | 필요한 시간 동안만 사용                 |

HTTP는 기본적으로 비연결 모델을 지향한다.

> 1시간 동안 수천 명이 서비스를 이용하더라도 실제로 동시에 처리되는 요청은 수십 개 이하일 수 있다. 사용자가 페이지를 읽는 동안 불필요한 연결을 유지하지 않는 것이 효율적이다.

### 버전별 연결 방식

| 버전     | 일반적인 연결 방식                                    |
| -------- | ----------------------------------------------------- |
| HTTP/1.0 | 요청마다 TCP 연결을 새로 만드는 방식                  |
| HTTP/1.1 | 지속 연결이 기본이며 하나의 연결을 여러 요청에 재사용 |
| HTTP/2   | 하나의 TCP 연결에서 여러 스트림을 동시에 처리         |
| HTTP/3   | QUIC 연결에서 여러 독립 스트림을 처리                 |

### 한계와 해결책

매번 새로운 연결을 맺으면 TCP 3-way handshake 시간이 반복적으로 발생한다.

```text
초기 HTTP 방식

연결 → HTML 요청/응답 → 종료       0.3초
연결 → JS 요청/응답 → 종료         0.3초
연결 → 이미지 요청/응답 → 종료     0.3초

총 0.9초
```

HTTP 지속 연결을 사용하면 하나의 연결을 여러 요청에 재사용할 수 있다.

```text
연결
  ├── HTML 요청/응답
  ├── JavaScript 요청/응답
  └── 이미지 요청/응답
종료

총 0.5초
```

연결을 영원히 유지하는 것은 아니다.

서버와 클라이언트는 유효 시간, 최대 요청 수, 장애 등의 조건에 따라 연결을 종료할 수 있다.

> HTTP의 Stateless는 애플리케이션의 요청 문맥에 관한 개념이고, 지속 연결은 네트워크 연결 재사용에 관한 개념이다. 두 개념은 서로 다른 문제를 다룬다.

---

## 6. HTTP 메시지 구조

HTTP로 데이터를 주고받을 때는 정해진 메시지 구조를 따른다.

```text
┌──────────────────────────────┐
│ start-line                   │ 요청 정보 또는 응답 상태
├──────────────────────────────┤
│ header                       │ 부가 정보
├──────────────────────────────┤
│ 빈 줄                        │ 헤더와 바디 구분
├──────────────────────────────┤
│ message body                 │ 실제 전송 데이터
└──────────────────────────────┘
```

### 요청 메시지 예시

```http
GET /search?q=hello&hl=ko HTTP/1.1
Host: www.google.com

```

- 시작 라인: 메서드, 경로, HTTP 버전
- 헤더: 요청에 관한 부가 정보
- 빈 줄: 헤더와 바디 구분
- 바디: 서버로 전달할 데이터로, 없을 수도 있음

### 응답 메시지 예시

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 3423

<html>
  <body>...</body>
</html>
```

- 시작 라인: HTTP 버전, 상태 코드, 이유 문구
- 헤더: 응답에 관한 부가 정보
- 빈 줄: 헤더와 바디 구분
- 바디: 실제 응답 데이터

### HTTP/1.1 요청 메시지

```http
GET /members/1?detail=true HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer access-token

```

HTTP/1.1 요청 메시지는 다음과 같이 구성된다.

```text
요청 라인: 메서드, 요청 대상, HTTP 버전
헤더: 요청에 관한 부가 정보
빈 줄: 헤더와 본문 구분
본문: 서버에 전달할 데이터로, 없을 수도 있음
```

### HTTP/1.1 응답 메시지

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 40

{"id":1,"username":"alice","age":25}
```

```text
상태 라인: HTTP 버전, 상태 코드, 사유 문구
헤더: 응답에 관한 부가 정보
빈 줄: 헤더와 본문 구분
본문: 실제 응답 데이터로, 없을 수도 있음
```

### 주요 상태 코드

| 코드                        | 의미                     |
| --------------------------- | ------------------------ |
| `200 OK`                    | 요청 성공                |
| `201 Created`               | 리소스 생성 성공         |
| `400 Bad Request`           | 클라이언트의 잘못된 요청 |
| `401 Unauthorized`          | 인증 필요                |
| `403 Forbidden`             | 권한 없음                |
| `404 Not Found`             | 리소스를 찾을 수 없음    |
| `500 Internal Server Error` | 서버 내부 오류           |

### 주요 헤더

| 헤더             | 설명                      |
| ---------------- | ------------------------- |
| `Content-Type`   | 전송하는 데이터 형식      |
| `Content-Length` | 데이터 크기               |
| `Host`           | 요청하는 서버 주소        |
| `User-Agent`     | 클라이언트 정보           |
| `Authorization`  | 인증 정보                 |
| `Cookie`         | 저장된 쿠키를 서버로 전송 |

### 요청 데이터를 전달하는 위치

| 위치            | 예시                        | 주요 용도                      |
| --------------- | --------------------------- | ------------------------------ |
| Path Parameter  | `/members/10`               | 특정 리소스 식별               |
| Query Parameter | `/members?age=20&page=1`    | 검색, 필터, 정렬, 페이지네이션 |
| Header          | `Authorization: Bearer ...` | 인증, 콘텐츠 협상, 메타데이터  |
| Body            | `{ "username": "alice" }`   | 생성하거나 수정할 데이터       |

### CORS

CORS는 브라우저가 다른 출처의 서버에 요청할 때 적용하는 보안 정책이다.

서버 간 통신이나 일반적인 `curl` 요청을 브라우저와 같은 방식으로 차단하는 기능은 아니다.

브라우저는 필요한 경우 실제 요청 전에 `OPTIONS` 사전 요청을 보낸다.

```http
OPTIONS /members HTTP/1.1
Origin: https://frontend.example.com
Access-Control-Request-Method: POST

```

서버는 허용 정책을 응답 헤더로 알린다.

```http
Access-Control-Allow-Origin: https://frontend.example.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Node.js 실습

Node.js의 기본 `http` 모듈만 사용해 회원 CRUD API를 구현한다.

HTTP 요청이 서버에 도착하고 URL 분석, 본문 파싱, 비즈니스 로직 실행, HTTP 응답 반환으로 이어지는 흐름을 확인하기 위한 예제이다.

> 이 예제에서 서버는 Node.js로 작성하지만, 완성된 서버를 테스트할 때는 `curl`뿐 아니라 Postman을 사용해도 된다.

### 실행 환경

```bash
node --version
node server.js
```

별도의 패키지 설치는 필요하지 않다.

### 전체 코드

```js
// server.js

const http = require("node:http");
const { URL } = require("node:url");

// 요청 처리 함수 밖에 선언해야 요청이 끝난 뒤에도 데이터가 유지된다.
// 서버를 재시작하면 초기화되는 학습용 데이터이다.
const members = [
  { id: 1, username: "alice", age: 25 },
  { id: 2, username: "bob", age: 30 },
];

let nextId = 3;

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendJson(res, statusCode, data, additionalHeaders = {}) {
  const body = data === undefined ? "" : JSON.stringify(data);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...additionalHeaders,
  });

  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      body += chunk;

      if (Buffer.byteLength(body) > 1_000_000) {
        reject(new HttpError(413, "요청 본문이 너무 큽니다."));
        req.pause();
      }
    });

    req.on("end", () => {
      if (body.length === 0) {
        reject(new HttpError(400, "요청 본문이 필요합니다."));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new HttpError(400, "올바른 JSON 형식이 아닙니다."));
      }
    });

    req.on("error", reject);
  });
}

function validateMember(body, { partial = false } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "JSON 객체를 전송해야 합니다.");
  }

  const allowedFields = ["username", "age"];

  const unknownFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key),
  );

  if (unknownFields.length > 0) {
    throw new HttpError(
      400,
      `허용되지 않은 필드입니다: ${unknownFields.join(", ")}`,
    );
  }

  if (!partial || body.username !== undefined) {
    if (typeof body.username !== "string" || body.username.trim() === "") {
      throw new HttpError(
        422,
        "username은 비어 있지 않은 문자열이어야 합니다.",
      );
    }
  }

  if (!partial || body.age !== undefined) {
    if (!Number.isInteger(body.age) || body.age < 0) {
      throw new HttpError(422, "age는 0 이상의 정수여야 합니다.");
    }
  }

  if (partial && Object.keys(body).length === 0) {
    throw new HttpError(422, "수정할 필드를 하나 이상 전송해야 합니다.");
  }
}

function findMemberIndex(id) {
  const index = members.findIndex((member) => member.id === id);

  if (index === -1) {
    throw new HttpError(404, `${id}번 회원을 찾을 수 없습니다.`);
  }

  return index;
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(
      req.url,
      `http://${req.headers.host ?? "localhost"}`,
    );

    const { pathname, searchParams } = requestUrl;
    const memberPath = pathname.match(/^\/members\/(\d+)$/);

    // GET /members?minAge=20
    if (req.method === "GET" && pathname === "/members") {
      const minAgeText = searchParams.get("minAge");

      if (minAgeText === null) {
        sendJson(res, 200, members);
        return;
      }

      const minAge = Number(minAgeText);

      if (!Number.isInteger(minAge) || minAge < 0) {
        throw new HttpError(400, "minAge는 0 이상의 정수여야 합니다.");
      }

      sendJson(
        res,
        200,
        members.filter((member) => member.age >= minAge),
      );

      return;
    }

    // GET /members/:id
    if (req.method === "GET" && memberPath) {
      const id = Number(memberPath[1]);
      const index = findMemberIndex(id);

      sendJson(res, 200, members[index]);
      return;
    }

    // POST /members
    if (req.method === "POST" && pathname === "/members") {
      const body = await readJson(req);

      validateMember(body);

      const newMember = {
        id: nextId++,
        username: body.username.trim(),
        age: body.age,
      };

      members.push(newMember);

      sendJson(res, 201, newMember, {
        Location: `/members/${newMember.id}`,
      });

      return;
    }

    // PUT /members/:id
    if (req.method === "PUT" && memberPath) {
      const id = Number(memberPath[1]);
      const index = findMemberIndex(id);
      const body = await readJson(req);

      validateMember(body);

      members[index] = {
        id,
        username: body.username.trim(),
        age: body.age,
      };

      sendJson(res, 200, members[index]);
      return;
    }

    // PATCH /members/:id
    if (req.method === "PATCH" && memberPath) {
      const id = Number(memberPath[1]);
      const index = findMemberIndex(id);
      const body = await readJson(req);

      validateMember(body, { partial: true });

      members[index] = {
        ...members[index],
        ...(body.username !== undefined
          ? { username: body.username.trim() }
          : {}),
        ...(body.age !== undefined ? { age: body.age } : {}),
      };

      sendJson(res, 200, members[index]);
      return;
    }

    // DELETE /members/:id
    if (req.method === "DELETE" && memberPath) {
      const id = Number(memberPath[1]);
      const index = findMemberIndex(id);

      members.splice(index, 1);

      res.writeHead(204);
      res.end();
      return;
    }

    throw new HttpError(404, "존재하지 않는 경로입니다.");
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, {
        message: error.message,
      });
      return;
    }

    console.error(error);

    sendJson(res, 500, {
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
});

server.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});
```

### 요청 테스트

다음 요청은 터미널에서 `curl`로 실행할 수 있다.

Postman에서는 메서드와 URL을 선택하고, 필요한 경우 `Body → raw → JSON`을 선택하여 같은 요청을 보낼 수 있다.

```bash
# 전체 회원 조회
curl -i http://localhost:3000/members

# 쿼리 파라미터로 필터링
curl -i "http://localhost:3000/members?minAge=26"

# 단일 회원 조회
curl -i http://localhost:3000/members/1

# 회원 생성
curl -i -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{"username":"charlie","age":22}'

# 회원 전체 교체
curl -i -X PUT http://localhost:3000/members/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"alice-updated","age":26}'

# 회원 일부 변경
curl -i -X PATCH http://localhost:3000/members/1 \
  -H "Content-Type: application/json" \
  -d '{"age":27}'

# 회원 삭제
curl -i -X DELETE http://localhost:3000/members/1
```

> 이 예제는 HTTP 흐름을 학습하기 위한 코드이다. 실제 서비스에서는 데이터베이스, 동시성 제어, 인증·인가, 구조화된 로깅, 요청 제한 등이 추가로 필요하다.

---

## NestJS 실습

NestJS는 Node.js 런타임 위에서 동작하는 서버 프레임워크이다.

데코레이터, 의존성 주입, 모듈 구조 등을 제공하여 HTTP 서버 코드를 역할별로 나누어 구현할 수 있다.

> Node.js 예제와 NestJS 예제는 Postman을 대체하기 위한 것이 아니다. Node.js와 NestJS는 요청을 받아 응답하는 서버를 만드는 기술이고, Postman은 완성된 서버에 HTTP 요청을 보내 테스트하는 클라이언트 도구이다.

### 프로젝트 생성

```bash
npm install -g @nestjs/cli

nest new http-study
cd http-study

npm install class-validator class-transformer @nestjs/mapped-types

npm run start:dev
```

### 프로젝트 구조

```text
src/
├── main.ts
├── app.module.ts
└── members/
    ├── members.module.ts
    ├── members.controller.ts
    ├── members.service.ts
    └── dto/
        ├── create-member.dto.ts
        ├── find-members-query.dto.ts
        ├── replace-member.dto.ts
        └── update-member.dto.ts
```

### DTO 작성

```ts
// src/members/dto/create-member.dto.ts

import { IsInt, IsString, Length, Min } from "class-validator";

export class CreateMemberDto {
  @IsString()
  @Length(1, 30)
  username!: string;

  @IsInt()
  @Min(0)
  age!: number;
}
```

```ts
// src/members/dto/replace-member.dto.ts

import { CreateMemberDto } from "./create-member.dto";

// PUT은 전체 교체이므로 두 필드를 모두 필수로 받는다.
export class ReplaceMemberDto extends CreateMemberDto {}
```

```ts
// src/members/dto/update-member.dto.ts

import { PartialType } from "@nestjs/mapped-types";
import { CreateMemberDto } from "./create-member.dto";

// CreateMemberDto의 모든 필드를 선택 항목으로 만든다.
export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
```

DTO는 TypeScript 타입을 지정하는 역할뿐 아니라 `class-validator`와 함께 런타임 요청 값을 검증하는 데 사용된다.

### Service 작성

```ts
// src/members/members.service.ts

import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";

import { CreateMemberDto } from "./dto/create-member.dto";
import { ReplaceMemberDto } from "./dto/replace-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";

interface Member {
  id: number;
  username: string;
  age: number;
}

@Injectable()
export class MembersService {
  private readonly members: Member[] = [
    { id: 1, username: "alice", age: 25 },
    { id: 2, username: "bob", age: 30 },
  ];

  private nextId = 3;

  findAll(minAge?: number): Member[] {
    if (minAge === undefined) {
      return this.members;
    }

    return this.members.filter((member) => member.age >= minAge);
  }

  findOne(id: number): Member {
    const member = this.members.find((item) => item.id === id);

    if (!member) {
      throw new NotFoundException(`${id}번 회원을 찾을 수 없습니다.`);
    }

    return member;
  }

  create(dto: CreateMemberDto): Member {
    const newMember: Member = {
      id: this.nextId++,
      username: dto.username,
      age: dto.age,
    };

    this.members.push(newMember);

    return newMember;
  }

  replace(id: number, dto: ReplaceMemberDto): Member {
    const index = this.findIndex(id);

    this.members[index] = {
      id,
      username: dto.username,
      age: dto.age,
    };

    return this.members[index];
  }

  update(id: number, dto: UpdateMemberDto): Member {
    if (Object.keys(dto).length === 0) {
      throw new UnprocessableEntityException(
        "수정할 필드를 하나 이상 전송해야 합니다.",
      );
    }

    const index = this.findIndex(id);

    this.members[index] = {
      ...this.members[index],
      ...dto,
    };

    return this.members[index];
  }

  remove(id: number): void {
    const index = this.findIndex(id);

    this.members.splice(index, 1);
  }

  private findIndex(id: number): number {
    const index = this.members.findIndex((member) => member.id === id);

    if (index === -1) {
      throw new NotFoundException(`${id}번 회원을 찾을 수 없습니다.`);
    }

    return index;
  }
}
```

Service는 HTTP 요청 객체에 직접 의존하지 않고 회원과 관련된 비즈니스 로직을 담당한다.

### Controller 작성

```ts
// src/members/members.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { CreateMemberDto } from "./dto/create-member.dto";
import { FindMembersQueryDto } from "./dto/find-members-query.dto";
import { ReplaceMemberDto } from "./dto/replace-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MembersService } from "./members.service";

@Controller("members")
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // GET /members
  // GET /members?minAge=20
  @Get()
  findAll(@Query() query: FindMembersQueryDto) {
    return this.membersService.findAll(query.minAge);
  }

  // GET /members/:id
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  // POST /members
  // NestJS의 @Post 기본 성공 상태 코드는 201이다.
  @Post()
  @Header("Location", "/members")
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  // PUT /members/:id
  @Put(":id")
  replace(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReplaceMemberDto,
  ) {
    return this.membersService.replace(id, dto);
  }

  // PATCH /members/:id
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  // DELETE /members/:id
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number): void {
    this.membersService.remove(id);
  }
}
```

경로 파라미터는 `ParseIntPipe`를 이용하여 숫자 변환과 검증을 처리한다.

쿼리 파라미터는 다음 DTO를 사용한다.

```ts
// src/members/dto/find-members-query.dto.ts

import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class FindMembersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge?: number;
}
```

### Module 작성

```ts
// src/members/members.module.ts

import { Module } from "@nestjs/common";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";

@Module({
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
```

```ts
// src/app.module.ts

import { Module } from "@nestjs/common";
import { MembersModule } from "./members/members.module";

@Module({
  imports: [MembersModule],
})
export class AppModule {}
```

### 전역 ValidationPipe 설정

```ts
// src/main.ts

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
```

| 옵션                   | 역할                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `transform`            | 쿼리와 경로 값을 DTO 타입에 맞게 변환할 수 있게 한다.        |
| `whitelist`            | DTO에 선언되지 않은 속성을 제거한다.                         |
| `forbidNonWhitelisted` | 선언되지 않은 속성이 들어오면 제거하는 대신 오류를 반환한다. |

`whitelist`와 `forbidNonWhitelisted`를 함께 설정하면 DTO에 정의되지 않은 필드가 들어왔을 때 `400 Bad Request`를 반환한다.

### 요청 테스트

Node.js 예제에서 사용한 `curl` 요청을 동일하게 사용할 수 있다.

Postman에서도 동일한 메서드, URL, 헤더, JSON 본문을 설정하여 테스트할 수 있다.

> 서버를 재시작하면 메모리에 저장된 회원 데이터가 초기화된다. 실제 서비스에서는 Repository 계층과 데이터베이스를 연결한다.

---

## Node.js, NestJS, Postman의 차이

Node.js는 JavaScript 실행 환경이고, NestJS는 Node.js에서 동작하는 서버 프레임워크이다.

Postman은 서버를 만드는 도구가 아니라 완성된 서버에 요청을 보내고 응답을 확인하는 API 테스트 도구이다.

| 비교 항목   | Node.js 기본 HTTP 모듈       | NestJS                            | Postman                        |
| ----------- | ---------------------------- | --------------------------------- | ------------------------------ |
| 역할        | HTTP 서버 구현               | 구조화된 HTTP 서버 구현           | HTTP 요청 전송 및 응답 확인    |
| 라우팅      | 메서드와 경로를 직접 비교    | `@Get`, `@Post`, `@Patch` 등 사용 | 요청할 URL과 메서드 선택       |
| 본문 처리   | 스트림을 읽고 직접 파싱      | `@Body()`로 추출                  | JSON, Form Data 등을 직접 입력 |
| 값 검증     | 직접 구현                    | DTO와 ValidationPipe 활용         | 서버의 검증 결과 확인          |
| 오류 응답   | 상태 코드와 본문을 직접 작성 | HTTP Exception과 예외 필터 활용   | 반환된 상태 코드와 본문 확인   |
| 적합한 학습 | HTTP 내부 흐름 이해          | 실무적인 서버 구조 이해           | HTTP 요청과 응답 테스트        |

### 각각의 의미

```text
Node.js 또는 NestJS
→ 요청을 받아 처리하고 응답하는 서버를 만든다.

Postman
→ 만든 서버에 GET, POST, PUT, PATCH, DELETE 요청을 보낸다.
→ 서버가 반환한 상태 코드, 헤더, 본문을 확인한다.
```

따라서 실습의 목적은 단순히 Postman에서 버튼을 눌러보는 것만이 아니다.

다음 두 가지를 함께 확인하는 것이 목적이다.

1. 서버가 HTTP 요청을 어떻게 받아 처리하는가?
2. Postman이나 `curl` 같은 클라이언트가 서버에 어떤 요청을 보내고 어떤 응답을 받는가?

---

## 요청 처리 흐름

```text
Node.js 기본 HTTP 모듈

요청
→ URL 직접 분석
→ 메서드와 경로 분기
→ 본문 직접 파싱
→ 비즈니스 로직 실행
→ 상태 코드와 헤더 직접 작성
→ 응답
```

```text
NestJS

요청
→ Router
→ Pipe와 DTO 검증
→ Controller
→ Service
→ 응답 변환
→ 응답
```

NestJS도 내부적으로 Node.js HTTP 서버 어댑터를 사용한다.

기본적으로 Express를 사용하며, 설정에 따라 Fastify 어댑터를 사용할 수도 있다.

---

## HTTP 메서드 선택

```text
리소스를 조회한다
→ GET

새 리소스를 생성한다
→ POST

특정 URI의 리소스를 전체 교체한다
→ PUT

리소스의 일부만 변경한다
→ PATCH

리소스를 삭제한다
→ DELETE

CRUD로 표현하기 어려운 작업을 실행한다
→ POST 사용을 우선 검토
```

---

## 학습 체크리스트

1. HTTP는 클라이언트의 요청과 서버의 응답으로 동작한다.
2. HTTP의 Stateless와 네트워크 연결 유지 여부는 서로 다른 개념이다.
3. HTTP/1.1은 지속 연결이 기본이다.
4. HTTP/2와 HTTP/3은 멀티플렉싱을 지원한다.
5. URI는 리소스를 중심으로 설계하고 HTTP 메서드로 행위를 표현한다.
6. PUT은 전체 교체, PATCH는 부분 변경 의미로 구분한다.
7. 멱등성은 응답이 항상 같다는 뜻이 아니라 요청 후 의도된 최종 상태가 같다는 뜻이다.
8. GET, PUT, DELETE는 표준 의미상 멱등하지만 POST는 기본적으로 멱등하지 않다.
9. PATCH는 구현 방식에 따라 멱등할 수도 있고 멱등하지 않을 수도 있다.
10. 상태 코드는 성공 여부뿐 아니라 실패 원인의 범주도 전달한다.
11. NestJS DTO의 TypeScript 타입만으로는 런타임 검증이 되지 않는다.
12. 런타임 검증을 적용하려면 `ValidationPipe` 등을 설정해야 한다.
13. Node.js와 NestJS는 서버를 구현하는 기술이다.
14. Postman과 `curl`은 구현한 서버에 HTTP 요청을 보내 테스트하는 도구이다.

---

## 예상 질문

### PUT과 PATCH의 차이는 무엇인가?

PUT은 대상 리소스의 전체 표현을 교체할 때 사용한다.

PATCH는 리소스의 일부만 변경할 때 사용한다.

```http
PUT /members/1
Content-Type: application/json

{
  "username": "alice",
  "age": 30
}
```

```http
PATCH /members/1
Content-Type: application/json

{
  "age": 30
}
```

### POST와 PUT의 차이는 무엇인가?

POST는 일반적으로 데이터를 제출하거나, 서버가 새로운 리소스의 URI를 결정하도록 요청할 때 사용한다.

```http
POST /members
Content-Type: application/json

{
  "username": "alice",
  "age": 25
}
```

서버가 생성된 회원의 주소를 결정한다.

```http
HTTP/1.1 201 Created
Location: /members/100
```

PUT은 클라이언트가 지정한 URI의 리소스를 생성하거나 전체 교체할 때 사용한다.

```http
PUT /files/profile.jpg
Content-Type: image/jpeg

[이미지 데이터]
```

### DELETE를 두 번 호출하면 멱등한가?

DELETE 요청을 여러 번 수행해도 의도된 최종 리소스 상태는 동일하다.

```text
첫 번째 DELETE
→ 리소스 삭제
→ 204 No Content

두 번째 DELETE
→ 이미 리소스가 없음
→ 404 Not Found
```

응답 상태 코드는 달라질 수 있지만, 대상 리소스가 존재하지 않는다는 최종 상태는 같다.

### HTTP가 Stateless인데 로그인은 어떻게 유지하는가?

HTTP가 이전 요청의 문맥을 자동으로 기억하지 않기 때문에 애플리케이션이 필요한 인증 정보를 매 요청에 전달하도록 설계한다.

세션 방식에서는 쿠키에 세션 ID를 저장하고 서버나 Redis에서 세션 정보를 조회한다.

```http
Cookie: sessionId=abc123
```

토큰 방식에서는 요청마다 액세스 토큰을 전달한다.

```http
Authorization: Bearer access-token
```

### Node.js와 NestJS의 차이는 무엇인가?

Node.js는 JavaScript를 서버 환경에서 실행할 수 있게 해주는 런타임이다.

NestJS는 Node.js 위에서 모듈, 컨트롤러, 서비스, 의존성 주입과 같은 애플리케이션 구조를 제공하는 프레임워크이다.

### Postman만으로 실습할 수 있는가?

Postman만으로도 이미 만들어진 API에 요청을 보내고 응답을 확인하는 HTTP 클라이언트 실습은 할 수 있다.

하지만 Postman만으로는 요청을 받아 처리하는 서버 로직을 구현할 수 없다.

따라서 학습 목적을 다음과 같이 구분할 수 있다.

```text
HTTP 요청과 응답 형식만 확인
→ 공개 API 또는 이미 실행 중인 서버 + Postman

서버가 요청을 처리하는 과정까지 학습
→ Node.js 또는 NestJS로 서버 구현 + Postman으로 테스트
```

---

## 참고 자료

- [RFC 9110 - HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9111 - HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [RFC 9112 - HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113 - HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 - HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [Node.js HTTP 공식 문서](https://nodejs.org/api/http.html)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

---
