"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // max-age=6: 응답을 6초 동안 신선한 것으로 취급한다. must-revalidate: 신선도가 끝난 뒤에는 검증 없이 재사용하지 않는다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "max-age=6, must-revalidate",
    });

    res.end("6초 동안 신선하고, 만료 후에는 반드시 재검증한다.");
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
