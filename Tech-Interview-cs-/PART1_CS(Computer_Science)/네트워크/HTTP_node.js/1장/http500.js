"use strict";

const http = require("node:http");

// 500 Internal Server Error 응답을 확인하기 위한 학습용 서버다. 데이터베이스 오류, 외부 서비스 오류 등에 500을 사용할 수 있다.
const server = http.createServer((req, res) => {
  res.writeHead(500, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(JSON.stringify({ message: "서버 내부 오류입니다." }));
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
