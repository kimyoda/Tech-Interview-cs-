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

<details>
<summary>301, 302, 307, 308의 차이는 무엇인가?</summary>

**이동이 영구적인지 기존 요청의 메서드, 본문을 유지하는지 다르다**

`POST` 요청의 메서드와 본문을 유지하며 임시 이동시키면 `307`을 사용
`301`, `302`는 `POST`, `GET`으로 변경될 수 있어 메서드 유지가 필요한 API에 사용할 때 주의해야 한다.

</details>

<details>
<summary>303이 Post, Redirect, Get 패턴에 알맞은 이유는</summary>

**POST 처리 결과를 별도의 GET 요청으로 조회하도록 안내하기 때문**

1. 클라이언트가 `POST`로 데이터를 제출
2. 서버가 처리 후 `303 See Other`와 `Location`을 반환
3. 클라이언트가 해당 위치에 `GET` 요청을 보내 결과를 조회

최종 화면이 `GET` 응답이므로 새로고침할 때 원래의 `POST`가 다시 제출되는 문제를 줄일 수 있음

</details>

<details>
<summary>상대 경로와 절대 URL을 Location에 쓸 때 차이는</summary>

**상대 경로는 원래 요청 URL을 기준으로 해석, 절대 URL은 이동할 주소 전체를 지정한다**

원래 요청 주소가 `https://example.com/members/1`이면 아래와 같음

| Location                         | 주소                               |
| -------------------------------- | ---------------------------------- |
| `/redirect`                      | `https://example.com/redirect`     |
| `next`                           | `https://example.com/members/next` |
| `https://other.example/redirect` | `https://other.example/redirect`   |

`/`로 시작하는 경로는 같은 출처의 루트 경로를 기준으로 해석. 원래 요청 경로를 기준으로 해석

절대 URL은 스킴, 호스트, 포트까지 지정할 수 있어 다른 출처로 이동할 때도 사용할 수 있다.

</details>
