"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("node:http");
const server = http.createServer((req, res) => {
    // no-store는 캐시에 이 요청과 응답을 저장하지 않음, 원본 JS의 Set-Cookie 헤더는 캐시 설정이 아님.
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end("이 응답은 캐시에 저장하지 않는다.");
});
server.listen(8080, () => {
    console.log("http://localhost:8080에서 대기 중...");
});
