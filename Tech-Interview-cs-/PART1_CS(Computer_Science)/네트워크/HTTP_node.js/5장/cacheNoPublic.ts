"use strict";

import * as http from "node:http";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // 실제 파일명은 cacheNoPublic이지만 헤더의 동작은 public이다. public: 브라우저뿐 아니라 공유 캐시에도 저장할 수 있다.
    // 604800초는 7일이다.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=604800",
    });

    res.end("공유 캐시에서 7일 동안 신선하게 사용할 수 있다");
  },
);

server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
