# 2장 HTTP 리다이렉션

## 1. 리다이렉션이란

서버가 `3xx` 상태 코드와 `Location` 헤더를 보내면 클라이언트는 새 위치로 이동할 수 있다

```http
HTTP/1.1 301 Moved Permanetly
Location: /redirect
```

브라우저는 대개 자동으로 다음 요청을 보내 개발자 도구의 Network 탭이나 `curl -i`로 중간 응답을 확인

## 2. 주요 리다이렉션 코드

| 코드                     | 의미                          | 메서드 처리                                       |
| ------------------------ | ----------------------------- | ------------------------------------------------- |
| `301 Moved Permanetly`   | 리소스가 영구 이동            | 일부 클라이언트가 `POST`를 `GET`으로 바꿀 수 있다 |
| `302 Found`              | 임시 이동                     | 일부 클라이언트가 `POST`를 `GET`으로 바꿀 수 있다 |
| `303 See Other`          | 처리 결과를 다른 URI에서 조회 | 명시적으로 `GET`으로 사용                         |
| `307 Temporary Redirect` | 임시 이동                     | 기존 메서드와 본문 유지                           |
| `308 Permanent Redirect` | 영구 이동                     | 기존 메서드와 본문 유지                           |

폼 제출 뒤 새로고침에 의한 중복 요청을 막을 때 `POST -> 303 -> GET` 패턴을 사용할 수 있다. API에서 메서드와 본문을 반드시 유지해야 하면 `307` 또는 `308`이 더 분명하다

## 실습

[redirect.js](redirect.js)는 `/` 요청에 `301`과 `Location: /redirect`를 반환, 이동한 경로에서 `200 OK`를 반환

```bash
node redirect.js
curl -i http://localhost:8080/
curl -iL http://localhost:8080/
```

`-L`은 리다이렉션을 따라간다

```bash
curl -iL http://localhost:8080/
HTTP/1.1 301 Moved Permanently
Location: /redirect
Date: Wed, 23 Sep 2026 12:40:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Date: Wed, 23 Sep 2026 12:40:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

리다이렉션 완료
```

## 면접 체크

- `301`, `302`, `307`, `308`의 차이는

- `303`이 Post, Redirect, Get 패턴에 알맞은 이유는?

- 상대 경로와 절대 URL을 `Location`에 쓸 때 차이는?
