"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Set-Cookie": "study=active; Max-Age=200; Path=/; HttpOnly; SameSite=Lax",
  });
  res.end("200초 뒤 만료되는 쿠키를 설정했습니다.");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
