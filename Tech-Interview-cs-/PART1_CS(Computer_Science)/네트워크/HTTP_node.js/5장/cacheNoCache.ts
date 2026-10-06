"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // no-cache는 저장 금지가 아님, 저장한 응답을 다시 사용하기 전에 서버에 재검증해야 한다는 뜻이다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    });

    res.end("저장할 수 있지만 사용할 때마다 재검증한다");
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
