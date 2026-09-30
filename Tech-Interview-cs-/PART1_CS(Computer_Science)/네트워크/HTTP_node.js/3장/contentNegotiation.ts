"use strict";

// Node.js에 기본으로 포함된 HTTP 모듈을 불러온다.
import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // 클라이언트가 Accept 헤더를 보내지 않았다면 모든 형식을 허용한다는 의미의 */*를 기본값으로 사용한다.
    const accept = req.headers.accept ?? "*/*";

    // 클라이언트가 JSON 응답을 요청한 경우다.
    if (accept.includes("application/json")) {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",

        // 응답이 Accept 헤더에 따라 달라진다는 것을 브라우저나 캐시 서버에 알려 준다.
        Vary: "Accept",
      });

      res.end(
        JSON.stringify({
          message: "hello",
        }),
      );

      return;
    }

    // 클라이언트가 일반 텍스트 또는 모든 형식을 허용한 경우다.
    if (accept.includes("text/plain") || accept.includes("*/*")) {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        Vary: "Accept",
      });

      res.end("hello");
      return;
    }

    // 서버가 클라이언트가 요청한 응답 형식을 제공할 수 없는 경우다.
    res.writeHead(406, {
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "Accept",
    });

    res.end("Not Acceptable");
  },
);

// 서버가 8080 포트에서 요청을 기다린다.
server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
