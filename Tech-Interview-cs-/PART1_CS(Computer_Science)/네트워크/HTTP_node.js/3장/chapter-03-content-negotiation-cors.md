# 3장 콘텐츠 협상과 CORS

## 콘텐츠 협상

하나의 리소스를 여러 표현으로 제공할 때 서버와 클라이언트는 요청 헤더를 기준으로 적절한 표현을 사용

| 요청헤더          | 대상        | 예시                            |
| ----------------- | ----------- | ------------------------------- |
| `Accept`          | 미디어 타입 | `application/json`, `text/html` |
| `Accpet-Language` | 자언어      | `ko-KR`, `en-US`                |
| `Aceept-Encoding` | 압축 방식   | `gzip`, `br`                    |

서버는 실제 응답 형식을 `Content-Type` 을 알린다. 캐시는 협상에 사용한 요청 헤더를 구분해야 하므로 서버가 `Vary: Accept` 같은 헤더를 함께 보낼 수 있다

`q` 값은 선호도를 나타낸다

```http
Accept: text/html, application/json;q=0.9, */*;q=0.1
```

서버가 허용 가능한 표현을 만들 수 없고 `406 Not Acceptable`, 지원하지 않는 요청 본문 형식이면 `415 Unsupported Media Type`을 고려한다

## CORS

동일 출처 정책(Same-Origin Policy)은 브라우저 스크립트가 다른 출처의 응답을 임의로 읽지 못하게 제한된다.

```text
http://localhost:3000 ≠ http://localhost:8080
```

CORS(Cross-Origin Resource Sharing)은 서버가 응답 헤더로 허용할 출처와 메서드 등을 알리는 브라우저 보안 메커니즘이다
CORS는 인증이나 서버 간 통신을 막는 방화벽이 아니다

단순 요청 조건을 벗어나면 브라우저는 실제 요청 전 `OPTIONS` 프리플라이트 요청을 보낸다

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
