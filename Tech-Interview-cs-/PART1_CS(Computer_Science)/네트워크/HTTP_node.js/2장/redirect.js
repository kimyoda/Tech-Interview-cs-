"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.url === "/redirect") {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("redirect complete");
    return;
  }

  res.writeHead(301, {
    Location: "/redirect",
  });
  res.end();
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
