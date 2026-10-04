"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=604800",
  });
  res.end("공유 캐시에서 7일 동안 신선하게 사용할 수 있다");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
