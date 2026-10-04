"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end("저장할 수 있지만 사용할 때마다 재검증한다");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
