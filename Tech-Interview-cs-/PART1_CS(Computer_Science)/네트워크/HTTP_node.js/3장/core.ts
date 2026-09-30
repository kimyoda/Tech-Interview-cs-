"use strict";

// Node.js에 기본으로 포함된 HTTP 모듈을 불러온다.
import * as http from "node:http";

// CORS 요청을 허용할 출처다. 마크다운 링크 형식이 아니라 일반 URL 문자열로 작성해야 한다.
const allowedOrigin = "http://localhost:3000";

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // 브라우저가 보낸 Origin 요청 헤더를 가져온다.
    const origin = req.headers.origin;

    // 응답 헤더를 저장할 객체다. OutgoingHttpHeaders 타입을 사용하면 HTTP 응답 헤더를 동적으로 추가할 수 있다.
    const corsHeaders: http.OutgoingHttpHeaders = {
      Vary: "Origin",
    };

    // 요청을 보낸 출처가 서버에서 허용한 출처와 같은 경우에만 CORS 허용 응답 헤더를 추가한다.
    if (origin === allowedOrigin) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
      corsHeaders["Access-Control-Allow-Headers"] = "Content-Type";
    }

    // OPTIONS 메서드는 실제 요청 전에 브라우저가 보내는 CORS 프리플라이트 요청에 사용된다.
    if (req.method === "OPTIONS") {
      // 허용된 출처이면 204 No Content를 반환한다. 허용되지 않은 출처이면 403 Forbidden을 반환한다.
      res.writeHead(origin === allowedOrigin ? 204 : 403, corsHeaders);

      res.end();
      return;
    }

    // OPTIONS가 아닌 실제 요청에 대한 응답이다.
    res.writeHead(200, {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    });

    res.end(
      JSON.stringify({
        message: "CORS response",
      }),
    );
  },
);

// 서버가 8080 포트에서 요청을 기다린다.
server.listen(8080, (): void => {
  console.log("http://localhost:8080에서 대기 중...");
});
