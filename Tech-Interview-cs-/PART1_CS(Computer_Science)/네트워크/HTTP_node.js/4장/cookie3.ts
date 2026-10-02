"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // SameSite=None은 교차 사이트 요청에도 쿠키를 보낼 수 있도록 허용한다.
    // SameSite=None 쿠키에는 Secure가 함께 필요하다.
    // Secure 쿠키의 실제 저장·재전송 동작은 HTTPS 환경에서 확인한다.  현재 서버는 일반 HTTP 서버이므로 여기서는
    // Set-Cookie 응답 헤더가 생성되는지만 확인할 수 있다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Set-Cookie":
        "crossSite=enabled; Max-Age=10; Path=/; HttpOnly; SameSite=None; Secure",
    });

    res.end(
      "SameSite=None 쿠키는 Secure가 필요하며 HTTPS 환경에서 실습하세요.",
    );
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
