"use strict";

// Node.js에 기본으로 포함된 HTTP 모듈을 불러온다.
import * as http from "node:http";

// req: 클라이언트가 보낸 요청 정보가 들어 있다.
// res: 클라이언트에게 보낼 HTTP 응답을 만드는 객체다.
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // 루트 경로로 요청하면 /redirect로 이동하라는
    // 301 Moved Permanently 응답을 반환한다.
    if (req.url === "/") {
      res.writeHead(301, {
        Location: "/redirect",
      });

      res.end();
      return;
    }

    // 리다이렉션된 /redirect 경로에서는
    // 200 OK와 응답 본문을 반환한다.
    if (req.url === "/redirect") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
      });

      res.end("리다이렉션 완료");
      return;
    }

    // 정의하지 않은 경로는 404 Not Found를 반환한다.
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });

    res.end("페이지를 찾을 수 없습니다.");
  },
);

// 서버가 8080 포트에서 요청을 기다린다.
server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
