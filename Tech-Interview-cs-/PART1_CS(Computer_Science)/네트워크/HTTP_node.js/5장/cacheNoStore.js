"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end("이 응답은 저장하지 않는다");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
