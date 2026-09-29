"use strict";

const http = require("node:http");

const allowedOrigin = "http://localhost:3000";

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const corsHeaders = {
    Vary: "Origin",
  };

  if (origin === allowedOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    corsHeaders["Access-Control-Allow-Headers"] = "Content-Type";
  }

  if (req.method === "OPTIONS") {
    res.writeHead(origin === allowedOrigin ? 204 : 403, corsHeaders);
    res.end();
    return;
  }

  res.writeHead(200, {
    ...corsHeaders,
    "content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ message: "CORS response" }));
});

server.listen(8080, () => {
  console.log("http://localhost:8080에서 대기 중...");
});
