"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // max-age=604800: 7일 동안 신선하다. stale-while-revalidate=86400: 신선도가 끝난 뒤 최대 1일 동안 캐시가 오래된 응답을 제공
    // 백그라운드에서 재검증할 수 있도록 허용한다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    });

    res.end(
      "7일 뒤 만료되어도 1일 동안 재검증과 함께 오래된 응답을 사용할 수 있다",
    );
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
