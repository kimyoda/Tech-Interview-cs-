"use strict";

// Node.js에 기본으로 포함된 HTTP 모듈을 불러온다.
import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // Set-Cookie는 브라우저에 쿠키를 저장하도록 지시하는 응답 헤더다. Path=/: 이 서버의 모든 경로에서 쿠키를 보낼 수 있다.
    // HttpOnly: 브라우저 JavaScript에서 document.cookie로 읽을 수 없다. SameSite=Lax: 교차 사이트 요청에서 쿠키 전송을 제한한다.
    // Max-Age와 Expires가 없으므로 세션 쿠키다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Set-Cookie": "hello=world; Path=/; HttpOnly; SameSite=Lax",
    });

    res.end("HttpOnly 세션 쿠키를 설정했습니다.");
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
