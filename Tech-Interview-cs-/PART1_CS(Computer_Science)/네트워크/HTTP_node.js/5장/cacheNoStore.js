"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Set-Cookie": "max-age=6, must-revalidate",
  });
  res.end("6초 동안 신선하고, 만료 후에는 반드시 재검증한다.");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
