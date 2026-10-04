"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=604800, stale-while-revlidate=86400",
  });
  res.end(
    "7일 뒤 만료되어도 1일 동안 재검증과 함꼐 오래된 응답을 사용할 수 있다",
  );
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
