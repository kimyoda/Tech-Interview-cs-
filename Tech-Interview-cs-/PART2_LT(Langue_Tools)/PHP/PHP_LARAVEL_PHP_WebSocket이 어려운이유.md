# PHP, WebSocket가 어려운 이유

> PHP로 웹소켓으로 구현하는게 힘들어, 왜 쉽지 않은지 알아봤다.

---

## PHP란

PHP는 "PHP: Hypertext Preprocessor"다. **HTTP 요청을 받아서, 처리하고, 응답을 내려주고, 끝나는 것**.
이것이 PHP가 설계된 실행 모델이다.

```
일반적인 PHP 실행 흐름
Client                Web Server (Nginx/Apache)         PHP-FPM
  |                           |                              |
  |------ HTTP Request ------>|                              |
  |                           |------ FastCGI Request ------>|
  |                           |                              |--- 새 프로세스/스레드 ---
  |                           |                              |    요청 처리
  |                           |                              |    DB 조회, 로직 실행
  |                           |<----- FastCGI Response ------|--- 프로세스 종료 ---
  |<----- HTTP Response ------|                              |
  |                           |                              |

  매 요청마다 메모리 초기화 -> 처리 -> 메모리 해제 (Shared-Nothing 아키텍처)
```

해당 모델은 **Shared-Nothing**이다. 요청 A와 B는 서로 존재를 모른다. 요청은 독립적인 프로세스(스레드)에서 실행, 응답이 나가는 순간 꺠끗하게 정리된다

PHP가 상태를 안가져서 수평 확장이 쉽고, 요청에서 에러가 나도 다른 요청에 영향이 없고, 메모리 누수 걱정도 거의 없다.
게시판, 쇼핑몰, REST API - 대부분의 웹 서비스는 본질적으로 "요청-응답"의 반복, PHP는 해당 패턴에 최적화되어 있다.

WebSocket이 해당 전제 자체가 맞지 않다는 것이다.

---

## 싱글 스레드, Request - Response 모델의 한계

WebSocket은 한 번 관계를 맺으면 **연결을 계속 유지**해야 한다. 클라이언트가 언제 메시지를 보낼지 모르고, 서버도 언제든 클라이언트에 푸시할 수 있어야 한다.
본질적으로 **상태를 가지는(Stateful) 장기 연결(Long-lived connection)**이 필요하다.

일반적인 PHP 실행 환경은:
| 구분 | PHP-FPM (전통 모델) | WebSocket이 요구하는 것 |
|---|---|---|
