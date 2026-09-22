"use strict";

// Node.js기본으로 포함된 HTTP 모듈을 불러온다
import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    res.writeHead(400, {
      "Content-Type": "text/plain; charst=utf-8",
    });
    res.end(JSON.stringify({ message: "잘못된 요청입니다." }));
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
