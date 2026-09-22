"use strict";

const http = require("node:http");

// 400 Bad Request 응답을 확인하기 위한 학습용 서버다.
// 모든 요청에 의도적으로 400 상태 코드를 반환한다. 클라이언트 요청에 문제가 있을 때만 400을 반환해야 한다.
const server = http.createServer((req, res) => {
  res.writeHead(400, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  // JavaScript 객체를 HTTP 본문으로 바로 전송할 수 없으므로 JSON.stringify()를 사용해 JSON 문자열로 변환한다.
  res.end(JSON.stringify({ message: "잘못된 요청입니다." }));
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
