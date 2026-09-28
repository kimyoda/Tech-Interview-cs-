"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Node.js기본으로 포함된 HTTP 모듈을 불러온다
const http = require("node:http");
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charst=utf-8",
    });
    res.end("ok");
});
server.listen(8080, () => {
    console.log("http://localhost:8080에서 대기 중...");
});
