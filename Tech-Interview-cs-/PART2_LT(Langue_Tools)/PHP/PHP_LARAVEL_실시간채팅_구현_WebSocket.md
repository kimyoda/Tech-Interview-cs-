# 🌐 PHP 실시간 채팅 구현 (WebSocket부터 실무 채팅)

---

## PHP로 WebSocket 가능

### PHP 전통적인 한계

```
전통적인 PHP 실행

HTTP 요청 -> PHP 스크립트 실행 -> 응답 반환 -> 프로세스 종료

-> 요청이 끝나면 프로세스도 종료
-> 상태(State)를 메모리에 유지할 수 없다
-> WebSocket처럼 연결을 유지하는 구조가 불가능

PHP로 WebSocket 구현은?
```

### PHP WebSocket 구현 방법

```
방법 1: Ratchet (PHP WebSocket 라이브러리)
────────────────────────────────────────────
-> PHP로 작성된 순수 WebSocket 라이브러리
-> ReactPHP 이벤트 루프 기반
-> PHP CLI로 장시간 실행 가능 (daemon 방식)
-> Laravel, Symfony 없이 단독 사용 가능
-> 성능 중간

방법 2: Swoole (PHP 확장 모듈)
────────────────────────────────────────────
-> C로 작성된 PHP 확장 모듈
-> Node.js와 유사한 비동기/이벤트 기반
-> 성능 높음 (Node.js와 비슷)
-> PHP 코루틴, 비동기 I/O 지원
-> 별도 PHP 확장 설치

방법 3: Laravel + Reverb / Laravel WebSockets
────────────────────────────────────────────
-> Laravel 시스템 내에서 WebSocket 사용
-> Laravel Reverb: 공식 WebSocket 서버
-> Beyondcode Laravel WebSockets
-> Pusher 프로토콜 호환 -> 기존 Pusher 클라이언트 재사용
-> Laravel 방법
```

| 방법               | 성능      | 난이도 | Laravel 연동   | 추천 상황         |
| ------------------ | --------- | ------ | -------------- | ----------------- |
| Ratchet            | 중간      | 낮음   | 별도 설정 필요 | 단순 채팅, 학습용 |
| Swoole             | 높음      | 높음   | 가능 (Octane)  | 서비스            |
| Laravel Reverb     | 중간-높음 | 낮음   | 통합           | Laravel 프로젝트  |
| Laravel WebSockets | 중간      | 낮음   | 통합           | Laravel 구버저    |

---

## Retchet - PHP WebSocket 서버

### ReachPHP 이벤트 루프

```
Ratchet 동작 방식
────────────────────────────────────────────
PHP CLI 명령으로 서버 실행
    │
    ▼
ReactPHP 이벤트 루프 시작 (Node.js 이벤트 루프와 유사)
    │
    ├── WebSocket 연결 요청 → onOpen() 호출
    ├── 메시지 수신         → onMessage() 호출
    ├── 연결 종료          → onClose() 호출
    └── 에러 발생          → onError() 호출

-> PHP 프로세스가 종료되지 않고 계속 실행
-> 여러 클라이언트 연결을 처리
```

### 설치

```bash
# Composer로 Ratchet 설치
composer require cboden/ratchet

# 프로젝트 구조
chat-server/
├── composer.json
├── bin/
│   └── server.php      ← 서버 실행 파일
├── src/
│   ├── Chat.php        ← 채팅 메시지 핸들러
│   ├── ChatRoom.php    ← 채팅방 관리
│   └── AuthHandler.php ← 인증 처리
└── public/
    └── index.html      ← 클라이언트
```

### 기본 Message ComponentInterface 구현

```php
<?php
// src/Chat.php

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface
{
    // 연결된 모든 클라이언트를 저장하는 SplObjectStorage
    protected \SplObjectStorage $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage();
        echo "채팅 서버 시작\n";
    }

    // ────────────────────────────────────────
    // 클라이언트 접속 시
    // ────────────────────────────────────────
    public function onOpen(ConnectionInterface $conn): void
    {
        $this->clients->attach($conn);

        echo "새 연결: {$conn->resourceId}\n";
        echo "현재 접속자 수: " . count($this->clients) . "\n";

        // 환영 메시지 전송
        $conn->send(json_encode([
            'type'      => 'welcome',
            'message'   => '채팅 서버에 접속했습니다',
            'clientId'  => $conn->resourceId,
            'timestamp' => date('c'),
        ]));

        // 접속자 수 전체 브로드캐스트
        $this->broadcast([
            'type'    => 'system',
            'message' => "새 사용자가 접속했습니다 (총 " . count($this->clients) . "명)",
        ], $conn);
    }

    // ────────────────────────────────────────
    // 메시지 수신 시
    // ────────────────────────────────────────
    public function onMessage(ConnectionInterface $from, $msg): void
    {
        $data = json_decode($msg, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $from->send(json_encode([
                'type'    => 'error',
                'message' => '잘못된 JSON 형식입니다',
            ]));
            return;
        }

        echo "메시지 수신 [{$from->resourceId}]: {$msg}\n";

        // 메시지 타입별 처리
        match ($data['type'] ?? 'chat') {
            'chat'  => $this->handleChatMessage($from, $data),
            'ping'  => $from->send(json_encode(['type' => 'pong'])),
            default => $from->send(json_encode(['type' => 'error', 'message' => '알 수 없는 메시지 타입'])),
        };
    }

    // ────────────────────────────────────────
    // 연결 종료 시
    // ────────────────────────────────────────
    public function onClose(ConnectionInterface $conn): void
    {
        $this->clients->detach($conn);

        echo "연결 종료: {$conn->resourceId}\n";
        echo "남은 접속자: " . count($this->clients) . "\n";

        $this->broadcast([
            'type'    => 'system',
            'message' => "사용자가 퇴장했습니다 (총 " . count($this->clients) . "명)",
        ]);
    }

    // ────────────────────────────────────────
    // 에러 발생 시
    // ────────────────────────────────────────
    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        echo "에러 [{$conn->resourceId}]: {$e->getMessage()}\n";
        $conn->close();
    }

    // ────────────────────────────────────────
    // 채팅 메시지 처리
    // ────────────────────────────────────────
    private function handleChatMessage(ConnectionInterface $from, array $data): void
    {
        if (empty($data['text'])) {
            $from->send(json_encode(['type' => 'error', 'message' => '메시지를 입력하세요']));
            return;
        }

        $payload = [
            'type'      => 'chat',
            'clientId'  => $from->resourceId,
            'username'  => htmlspecialchars($data['username'] ?? '익명'),
            'text'      => htmlspecialchars($data['text']),
            'timestamp' => date('c'),
        ];

        // 전체 브로드캐스트 (본인 포함)
        foreach ($this->clients as $client) {
            $client->send(json_encode($payload));
        }
    }

    // ────────────────────────────────────────
    // 전체 브로드캐스트 헬퍼
    // ────────────────────────────────────────
    private function broadcast(array $data, ?ConnectionInterface $except = null): void
    {
        foreach ($this->clients as $client) {
            if ($except === null || $client !== $except) {
                $client->send(json_encode($data));
            }
        }
    }
}
```

### 서버 실행파일

```php
<?php
// bin/server.php

require dirname(__DIR__) . '/vendor/autoload.php';
require dirname(__DIR__) . '/src/Chat.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$port = (int) ($argv[1] ?? 8080);

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Chat()
        )
    ),
    $port
);

$server->run();
```

```bash
# 서버 실행
php bin/server.php 8080

# 백그라운드 실행 (Linux)
nohup php bin/server.php 8080 &

# Supervisor로 프로세스 관리 (권장)
# /etc/supervisor/conf.d/chat.conf
[program:chat-server]
command=php /var/www/chat/bin/server.php 8080
autostart=true
autorestart=true
stderr_logfile=/var/log/chat-server.err.log
stdout_logfile=/var/log/chat-server.out.log
```

---

## Ratchet - 룸 기반 채팅 ㅅ허버

### 채팅방 관리 클래스

```php
class ChatRoom
{
    private string $id;
    private string $title;
    private int $maxUsers;
    private array $members = [];

    public function __construct(string $id, string $title, int $maxUsers = 50)
    {
        $this->id = $id;
        $this->title = $title;
        $this->maxUsers = $maxUsers;
    }

    public function canJoin(): bool
    {
        return count($this->members) < $this->maxUsers;
    }
}
```

> 참고: Ratchet 공식 문서 | Swoole 공식 문서 | PHP 공식 문서 | Laravel WebSocket
