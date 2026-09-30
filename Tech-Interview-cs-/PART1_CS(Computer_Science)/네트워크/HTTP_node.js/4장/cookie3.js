"use strict";

const http = require("node:http");

const server = http.createServer((res, req) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Set-Cookie":
      "crossSite=enabled; Max-Age=10; Path=/; HttpOnly; SameSite=None; Secure",
  });
  res.end("SameSite=None 쿠키는 Secure가 필요하며 HTTPS 환경에서 실습.");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
