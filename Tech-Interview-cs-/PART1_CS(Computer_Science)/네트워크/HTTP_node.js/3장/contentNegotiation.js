"use strict";

const http = require("node:http");

const server = http.createServer((req, res) => {
  const accept = req.headers.accpet ?? "*/*";

  if (accept.includes("application/json")) {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      Vary: "Accept",
    });
    res.end(JSON.stringify({ message: "hello" }));
    return;
  }

  if (accept.includes("text/plain") || accept.includes("*/*")) {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "Accept",
    });
    res.end("hello");
    return;
  }

  res.writeHead(406, {
    "Conetent-Type": "text/plain; charset=utf-8",
    Vary: "Accept",
  });
  res.end("Not Acceptable");
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
