"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // Max-Age=200은 쿠키를 설정한 시점부터  200초 동안 유지하라는 뜻이다.
    // 만료 시간이 지나면 브라우저는 이후 요청에 이 쿠키를 보내지 않는다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Set-Cookie": "study=active; Max-Age=200; Path=/; HttpOnly; SameSite=Lax",
    });

    res.end("200초 뒤 만료되는 쿠키를 설정했습니다.");
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
