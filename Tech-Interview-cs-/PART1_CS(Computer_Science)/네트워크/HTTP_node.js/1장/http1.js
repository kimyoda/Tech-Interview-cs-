"use strict";

// Node.js기본으로 포함된 HTTP 모듈을 불러온다
const http = require("node:http");

// 서버가 사용할 포트 번호
// req: 클라이언트가 보낸 요청 정보가 들어 있다 요청 메서드, URL, 헤더
// res: 클라이언트에게 보낼 HTTP 응답읆 만드는 객체
const server = http.createServer((req, res) => {
  // 응답 상태 코드를 200 OK로 지정한다. Content-Type은 응답 본문의 형식을 설명한다.
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end("ok");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
