# CHAPTER 2. 네트워크

> 『면접을 위한 CS 전공지식 노트』의 네트워크 내용을 바탕으로 정리했다.  
> 기본 개념뿐만 아니라 Node.js와 NestJS 실무에서 활용할 수 있는 내용도 함께 다룬다.

---

## 2.1 네트워크의 기초

### 2.1.1 처리량과 지연 시간

#### 대역폭

**대역폭(Bandwidth)**은 네트워크가 이론적으로 단위 시간 동안 전송할 수 있는 최대 데이터양이다.

일반적으로 `bps(bits per second)` 단위를 사용한다.

```text
1 Kbps = 1,000 bps
1 Mbps = 1,000 Kbps
1 Gbps = 1,000 Mbps
```

대역폭이 넓다고 해서 항상 실제 전송 속도가 빠른 것은 아니다. 실제 성능은 네트워크 혼잡, 패킷 손실, 장비 성능, 프로토콜 오버헤드 등의 영향을 받는다.

---

#### 처리량

**처리량(Throughput)**은 단위 시간 동안 실제로 전송하거나 처리한 데이터의 양이다.

```text
처리량 = 실제로 전송한 데이터양 / 소요 시간
```

처리량은 일반적으로 경로상 가장 느린 구간인 **병목 구간의 대역폭**보다 클 수 없다.

예를 들어 서버의 네트워크 대역폭이 충분해도 데이터베이스 처리 속도가 느리다면 전체 API 처리량은 데이터베이스 성능에 의해 제한될 수 있다.

---

#### 굿풋

**굿풋(Goodput)**은 재전송 데이터와 프로토콜 헤더를 제외하고 애플리케이션이 실제로 전달받은 유효 데이터의 양이다.

```text
처리량: 네트워크에서 실제로 전송된 전체 데이터
굿풋: 애플리케이션이 전달받은 유효 데이터
```

---

#### 지연 시간

**지연 시간(Latency)**은 데이터가 출발지에서 목적지까지 전달되는 데 걸리는 시간이다.

지연 시간에는 다음 요소가 포함될 수 있다.

- 전파 지연
- 전송 지연
- 큐잉 지연
- 라우터 및 서버의 처리 지연
- DNS 조회 시간
- TCP 연결 시간
- TLS 핸드셰이크 시간

---

#### RTT

**RTT(Round Trip Time)**는 요청이 목적지에 도착하고 응답이 다시 출발지로 돌아오기까지 걸리는 왕복 시간이다.

```text
클라이언트 ── 요청 ──> 서버
클라이언트 <─ 응답 ─── 서버
             RTT
```

`ping` 명령어로 측정되는 시간도 일반적으로 ICMP 패킷의 RTT다.

다만 ICMP RTT와 실제 HTTP 요청 시간은 다를 수 있다. HTTP 요청에는 DNS 조회, TCP 연결, TLS 연결, 서버 처리 시간 등이 추가되기 때문이다.

---

#### 처리량과 지연 시간 비교

| 구분      | 처리량                               | 지연 시간                                |
| --------- | ------------------------------------ | ---------------------------------------- |
| 의미      | 단위 시간 동안 처리한 데이터양       | 하나의 요청이나 데이터 전달에 걸린 시간  |
| 대표 단위 | Mbps, Gbps, RPS                      | ms, s                                    |
| 개선 방법 | 서버 확장, 병렬 처리, 커넥션 풀 조정 | 캐싱, 쿼리 최적화, CDN, 가까운 리전 사용 |
| 예시      | 초당 1,000개의 요청 처리             | 요청 하나의 응답 시간이 50ms             |

처리량이 높아도 지연 시간이 크면 사용자가 느끼는 응답 속도는 느릴 수 있다.

반대로 지연 시간이 짧더라도 동시에 처리할 수 있는 요청 수가 적으면 트래픽이 증가했을 때 서비스가 불안정해질 수 있다.

---

#### 면접 답변

> 처리량은 단위 시간 동안 실제로 전송하거나 처리한 데이터의 양이고, 지연 시간은 하나의 요청이나 데이터 전달에 걸리는 시간입니다. 서버 증설과 병렬 처리는 처리량 개선에 도움이 되고, 캐싱과 쿼리 최적화, CDN, 가까운 리전 사용은 지연 시간 개선에 도움이 될 수 있습니다.

---

### 2.1.2 네트워크 토폴로지와 병목 현상

#### 네트워크 토폴로지

**네트워크 토폴로지(Network Topology)**는 네트워크 장치와 노드가 연결된 형태를 의미한다.

| 형태   | 설명                                   | 장점                      | 단점                                 |
| ------ | -------------------------------------- | ------------------------- | ------------------------------------ |
| 버스형 | 하나의 공통 통신 회선에 여러 노드 연결 | 구축 비용이 낮음          | 공통 회선 장애에 취약                |
| 스타형 | 중앙 장비에 모든 노드 연결             | 관리와 장애 파악이 쉬움   | 중앙 장비 장애에 취약                |
| 링형   | 각 노드가 양옆 노드와 연결             | 충돌 관리가 비교적 쉬움   | 일부 장애가 전체에 영향을 줄 수 있음 |
| 트리형 | 계층적인 구조로 연결                   | 확장과 관리가 쉬움        | 상위 장비 장애의 영향이 큼           |
| 메시형 | 노드 사이에 여러 경로 구성             | 장애 대응과 가용성이 높음 | 구축 비용과 관리 복잡도가 높음       |

현대적인 사내 네트워크에서는 일반적으로 스위치를 중심으로 한 스타형 구조가 많이 사용된다.

인터넷과 대규모 분산 시스템은 여러 경로를 가지므로 전체적으로 메시형의 특성도 가진다.

---

#### 병목 현상

**병목 현상(Bottleneck)**은 특정 구간의 처리 능력이 부족해 전체 시스템 성능이 그 구간에 의해 제한되는 현상이다.

웹 서비스에서 발생할 수 있는 대표적인 병목은 다음과 같다.

- 데이터베이스의 느린 쿼리
- 부족한 데이터베이스 커넥션 풀
- 외부 API의 느린 응답
- CPU 사용률 증가
- 메모리 부족과 잦은 GC
- 디스크 I/O 지연
- 네트워크 대역폭 부족
- 특정 마이크로서비스에 요청 집중
- 동기 작업으로 인한 Node.js 이벤트 루프 지연

병목을 찾을 때는 추측만으로 서버를 증설하기보다 메트릭, 로그, 트레이싱을 사용해 실제 원인을 확인해야 한다.

---

### 2.1.3 네트워크 분류

네트워크는 범위에 따라 다음과 같이 분류할 수 있다.

| 분류 | 전체 이름                 | 범위                  | 예시                  |
| ---- | ------------------------- | --------------------- | --------------------- |
| PAN  | Personal Area Network     | 개인 주변의 짧은 거리 | 블루투스 이어폰       |
| LAN  | Local Area Network        | 건물이나 사무실       | 사내 네트워크         |
| MAN  | Metropolitan Area Network | 도시 규모             | 도시 광통신망         |
| WAN  | Wide Area Network         | 국가 또는 대륙 규모   | 인터넷, 통신사 백본망 |

#### PAN

**PAN(Personal Area Network)**은 개인 주변의 짧은 거리에서 사용하는 네트워크다.

```text
스마트폰 ↔ 블루투스 이어폰
```

#### LAN

**LAN(Local Area Network)**은 가정, 사무실, 학교처럼 제한된 지역에서 사용하는 네트워크다.

#### MAN

**MAN(Metropolitan Area Network)**은 여러 LAN을 연결해 도시 규모로 구성한 네트워크다.

#### WAN

**WAN(Wide Area Network)**은 국가나 대륙처럼 넓은 지역을 연결하는 네트워크다.

인터넷은 수많은 LAN과 WAN이 연결된 거대한 네트워크다.

---

### 2.1.4 네트워크 성능 분석 명령어

| 명령어       | 용도                                          |
| ------------ | --------------------------------------------- |
| `ping`       | RTT와 패킷 손실 확인                          |
| `traceroute` | macOS/Linux에서 목적지까지의 홉 확인          |
| `tracert`    | Windows에서 목적지까지의 홉 확인              |
| `ss`         | Linux에서 소켓과 포트 상태 확인               |
| `lsof -i`    | macOS/Linux에서 포트를 사용하는 프로세스 확인 |
| `nslookup`   | DNS 조회                                      |
| `dig`        | DNS 상세 조회                                 |
| `curl`       | HTTP 요청과 단계별 소요 시간 확인             |

---

#### ping

```bash
ping api.example.com
```

`ping`으로 다음 내용을 확인할 수 있다.

- 대상 호스트와 기본적인 네트워크 통신이 가능한지
- RTT가 어느 정도인지
- 패킷 손실이 발생하는지

서버나 방화벽이 ICMP 패킷을 차단할 수도 있다. 따라서 `ping`이 실패한다고 해서 반드시 HTTP 서버가 중단된 것은 아니다.

---

#### traceroute와 tracert

macOS/Linux:

```bash
traceroute api.example.com
```

Windows:

```powershell
tracert api.example.com
```

목적지까지 거치는 라우터의 경로를 확인할 수 있다. 각 라우터를 **홉(Hop)**이라고 한다.

다만 다음 이유로 출력 결과만 보고 정확한 장애 지점을 단정해서는 안 된다.

- 특정 라우터가 ICMP 응답을 차단할 수 있다.
- 요청 경로와 응답 경로가 다를 수 있다.
- 로드밸런싱에 따라 경로가 달라질 수 있다.
- 응답 우선순위 때문에 특정 홉만 느리게 표시될 수 있다.

---

#### 포트 상태 확인

Linux:

```bash
ss -lntp
```

macOS:

```bash
lsof -iTCP -sTCP:LISTEN -n -P
```

특정 포트 확인:

```bash
lsof -i :3000
```

---

#### DNS 조회

```bash
nslookup api.example.com
```

```bash
dig api.example.com
```

IP 주소만 간단하게 출력:

```bash
dig +short api.example.com
```

DNS 캐시가 사용되면 실제 애플리케이션 요청에서 DNS 조회가 생략되거나 매우 짧게 측정될 수 있다.

---

#### HTTP 단계별 시간 확인

```bash
curl -o /dev/null -sS \
  -w 'remote_ip: %{remote_ip}\nDNS: %{time_namelookup}s\nTCP: %{time_connect}s\nTLS: %{time_appconnect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\nHTTP: %{http_code}\n' \
  https://api.example.com
```

| 항목                 | 의미                       |
| -------------------- | -------------------------- |
| `time_namelookup`    | DNS 조회가 끝난 시점       |
| `time_connect`       | TCP 연결이 끝난 시점       |
| `time_appconnect`    | TLS 연결이 끝난 시점       |
| `time_starttransfer` | 첫 응답 바이트를 받은 시점 |
| `time_total`         | 전체 요청이 끝난 시점      |

각 값은 대부분 요청 시작 시점부터 측정한 누적 시간이다.

따라서 순수 TLS 연결 시간은 대략 다음과 같이 계산한다.

```text
TLS 연결 시간 = time_appconnect - time_connect
```

대략적인 서버 처리 및 응답 대기 시간은 다음과 같이 확인할 수 있다.

```text
TLS 이후부터 TTFB까지의 시간
= time_starttransfer - time_appconnect
```

단, 이미 열려 있는 연결을 재사용하면 DNS 조회, TCP 핸드셰이크, TLS 핸드셰이크가 생략될 수 있다.

---

### 2.1.5 네트워크 프로토콜 표준화

서로 다른 제조사와 운영체제의 장치가 통신하려면 데이터 형식과 통신 절차가 표준화되어야 한다.

#### 주요 표준화 기구

| 기구 | 역할                               |
| ---- | ---------------------------------- |
| IETF | 인터넷 프로토콜 표준화 및 RFC 발행 |
| IEEE | Ethernet, Wi-Fi 등의 표준화        |
| ISO  | OSI 7계층 모델 등의 국제 표준화    |
| W3C  | HTML, CSS 등 웹 기술 표준화        |

대표적인 IEEE 표준은 다음과 같다.

- `IEEE 802.3`: Ethernet
- `IEEE 802.11`: Wi-Fi

---

#### OSI 7계층

| 계층                | 역할                                  | 예시                       |
| ------------------- | ------------------------------------- | -------------------------- |
| 7. 응용 계층        | 사용자 애플리케이션의 네트워크 서비스 | HTTP, DNS, SMTP            |
| 6. 표현 계층        | 데이터 표현, 인코딩, 암호화, 압축     | 문자 인코딩, 데이터 직렬화 |
| 5. 세션 계층        | 세션 연결과 관리                      | 세션 관리                  |
| 4. 전송 계층        | 종단 간 통신과 포트 구분              | TCP, UDP                   |
| 3. 네트워크 계층    | IP 주소와 라우팅                      | IPv4, IPv6, ICMP           |
| 2. 데이터 링크 계층 | MAC 주소와 프레임 전송                | Ethernet, Wi-Fi            |
| 1. 물리 계층        | 전기·광학·무선 신호 전달              | 케이블, 광섬유, 전파       |

OSI 7계층은 네트워크 통신을 설명하기 위한 이론적인 참조 모델이다.

실제 인터넷 프로토콜은 일반적으로 TCP/IP 모델을 사용해 설명한다.

---

## 2.2 TCP/IP 4계층 모델

### 2.2.1 계층 구조

| TCP/IP 계층              | 역할                        | 대표 프로토콜        |
| ------------------------ | --------------------------- | -------------------- |
| 애플리케이션 계층        | 사용자 데이터와 서비스 처리 | HTTP, DNS, SMTP, FTP |
| 전송 계층                | 종단 간 통신과 포트 구분    | TCP, UDP             |
| 인터넷 계층              | IP 주소와 라우팅            | IPv4, IPv6, ICMP     |
| 네트워크 인터페이스 계층 | 같은 링크에서 프레임 전송   | Ethernet, Wi-Fi, ARP |

ARP는 분류 방식에 따라 링크 계층 또는 인터넷 계층과 링크 계층 사이의 프로토콜로 설명되기도 한다.

실질적인 역할은 같은 링크 안에서 IPv4 주소에 대응하는 MAC 주소를 알아내는 것이다.

---

#### OSI와 TCP/IP 비교

| OSI 7계층              | TCP/IP 4계층             |
| ---------------------- | ------------------------ |
| 응용, 표현, 세션 계층  | 애플리케이션 계층        |
| 전송 계층              | 전송 계층                |
| 네트워크 계층          | 인터넷 계층              |
| 데이터 링크, 물리 계층 | 네트워크 인터페이스 계층 |

---

#### 계층화의 장점

계층화하면 특정 계층의 구현이 변경되어도 다른 계층에 미치는 영향을 줄일 수 있다.

예를 들어 Wi-Fi를 Ethernet으로 변경해도 HTTP 애플리케이션 코드를 전부 수정할 필요는 없다.

```text
HTTP
 ↓
TCP
 ↓
IP
 ↓
Ethernet 또는 Wi-Fi
```

---

#### 포트

IP 주소는 통신할 장치를 구분하고, **포트 번호**는 해당 장치에서 통신할 프로세스나 서비스를 구분한다.

```text
IP 주소: 어느 장치 또는 서버인가?
포트 번호: 그 장치의 어느 서비스인가?
```

대표적인 포트는 다음과 같다.

| 포트 | 서비스                                             |
| ---- | -------------------------------------------------- |
| 22   | SSH                                                |
| 53   | DNS                                                |
| 80   | HTTP                                               |
| 443  | HTTPS                                              |
| 3306 | MySQL                                              |
| 5432 | PostgreSQL                                         |
| 6379 | Redis                                              |
| 8080 | 애플리케이션 서버에서 자주 사용하는 대체 HTTP 포트 |

---

#### TCP와 UDP 비교

| 구분        | TCP                     | UDP                           |
| ----------- | ----------------------- | ----------------------------- |
| 연결 방식   | 연결 지향               | 비연결 지향                   |
| 신뢰성      | 재전송과 오류 복구 제공 | 기본적으로 보장하지 않음      |
| 순서 보장   | 보장                    | 보장하지 않음                 |
| 흐름 제어   | 제공                    | 제공하지 않음                 |
| 혼잡 제어   | 제공                    | 제공하지 않음                 |
| 데이터 단위 | 바이트 스트림           | 데이터그램                    |
| 오버헤드    | 상대적으로 큼           | 상대적으로 작음               |
| 예시        | HTTP/1.1, HTTP/2, SSH   | DNS, 실시간 통신, QUIC의 기반 |

UDP 자체는 재전송이나 순서 보장을 제공하지 않는다.

하지만 QUIC처럼 UDP 위에서 애플리케이션 또는 상위 프로토콜이 신뢰성, 재전송, 혼잡 제어를 직접 구현할 수 있다.

---

#### TCP 3-way handshake

TCP 연결을 맺을 때 일반적으로 3-way handshake를 수행한다.

```text
클라이언트                              서버
    |                                    |
    | -------- SYN, Seq=x -------------> |
    |                                    |
    | <--- SYN + ACK, Seq=y, Ack=x+1 --- |
    |                                    |
    | -------- ACK, Ack=y+1 ------------> |
    |                                    |
    |          연결 설정 완료              |
```

1. 클라이언트가 `SYN` 패킷을 보낸다.
2. 서버가 `SYN + ACK`로 응답한다.
3. 클라이언트가 `ACK`를 보내 연결을 완료한다.

---

#### TCP 연결 종료

TCP 연결 종료는 일반적으로 양방향 연결을 각각 닫기 때문에 4단계로 설명한다.

```text
클라이언트                              서버
    | -------- FIN --------------------> |
    | <------- ACK --------------------- |
    | <------- FIN --------------------- |
    | -------- ACK --------------------> |
```

실제 환경에서는 ACK와 FIN이 하나의 패킷으로 합쳐질 수도 있다.

---

### 2.2.2 캡슐화와 PDU

송신 측에서는 상위 계층에서 하위 계층으로 내려가면서 각 계층의 헤더가 추가된다. 이를 **캡슐화(Encapsulation)**라고 한다.

수신 측에서는 헤더를 하나씩 제거하면서 원래 데이터를 복원한다. 이를 **역캡슐화(Decapsulation)**라고 한다.

```text
애플리케이션 데이터
        ↓
TCP 헤더 + 데이터
        ↓
IP 헤더 + TCP 세그먼트
        ↓
프레임 헤더 + IP 패킷
        ↓
비트 형태로 전송
```

각 계층에서 사용하는 데이터 단위를 **PDU(Protocol Data Unit)**라고 한다.

| 계층              | PDU                |
| ----------------- | ------------------ |
| 애플리케이션 계층 | 데이터 또는 메시지 |
| TCP 전송 계층     | 세그먼트           |
| UDP 전송 계층     | 데이터그램         |
| 인터넷 계층       | 패킷               |
| 데이터 링크 계층  | 프레임             |
| 물리 계층         | 비트               |

---

## 2.3 네트워크 기기

네트워크 기기는 어느 계층의 헤더까지 해석하고 처리하는지에 따라 구분할 수 있다.

상위 계층의 내용을 자세히 검사할수록 더 복잡한 처리가 가능하지만, 실제 성능은 하드웨어와 구현 방식에 따라 달라진다.

---

### 2.3.1 애플리케이션 계층 장비

#### L7 로드밸런서

L7 로드밸런서는 HTTP 요청의 URL, 헤더, 쿠키, 메서드와 같은 애플리케이션 계층 정보를 사용해 요청을 분산한다.

```text
/api/users  → 사용자 서버
/api/orders → 주문 서버
```

대표적인 기능은 다음과 같다.

- URL 기반 라우팅
- 호스트 기반 라우팅
- TLS 종료
- 인증 확인
- 요청과 응답 헤더 변경
- 웹 애플리케이션 방화벽 연동

---

#### API Gateway

API Gateway는 클라이언트와 백엔드 서비스 사이에서 요청을 중계하고 공통 기능을 처리한다.

- 인증과 인가
- 요청 라우팅
- 요청 제한
- 로깅과 모니터링
- 프로토콜 변환
- 응답 조합
- 버전 관리

API Gateway는 단순한 프록시보다 더 많은 애플리케이션 기능을 담당한다.

---

#### 게이트웨이

**게이트웨이(Gateway)**는 서로 다른 네트워크나 프로토콜 사이를 연결하는 장치 또는 소프트웨어를 의미한다.

게이트웨이는 특정 계층에만 한정되는 용어가 아니다.

예를 들어 다음은 모두 문맥에 따라 게이트웨이라고 부를 수 있다.

- 기본 게이트웨이
- API Gateway
- 이메일 게이트웨이
- 프로토콜 변환 게이트웨이

---

### 2.3.2 전송 계층 장비

#### L4 로드밸런서

L4 로드밸런서는 IP 주소와 TCP/UDP 포트 정보를 사용해 트래픽을 분산한다.

L7 로드밸런서보다 애플리케이션 데이터에 대한 이해는 적지만 비교적 단순하고 빠르게 동작할 수 있다.

---

### 2.3.3 인터넷 계층 장비

#### 라우터

라우터는 IP 주소와 라우팅 테이블을 이용해 서로 다른 네트워크 사이로 패킷을 전달한다.

라우터는 패킷의 목적지 IP 주소를 확인하고 적절한 다음 홉을 결정한다.

---

### 2.3.4 데이터 링크 계층 장비

#### 스위치

스위치는 MAC 주소 테이블을 참고해 프레임을 필요한 포트로 전달한다.

MAC 주소 테이블에 목적지 주소가 없으면 해당 VLAN의 여러 포트로 프레임을 플러딩할 수 있다.

---

#### 브리지

브리지는 두 개 이상의 LAN 세그먼트를 연결하는 장치다.

현대적인 스위치는 여러 포트를 가진 고성능 브리지로 이해할 수 있다.

---

### 2.3.5 물리 계층 장비

#### 허브

허브는 한 포트로 들어온 신호를 다른 모든 포트로 전달한다.

허브에 연결된 장치들은 하나의 충돌 도메인을 공유하므로 현대 네트워크에서는 대부분 스위치로 대체되었다.

---

#### 리피터

리피터는 거리가 멀어지면서 약해진 신호를 복원하거나 재전송한다.

---

### 네트워크 장비 비교

| 장비          | 주요 기준       | 역할                                  |
| ------------- | --------------- | ------------------------------------- |
| 허브          | 전기·물리 신호  | 모든 포트로 신호 전달                 |
| 스위치        | MAC 주소        | 같은 LAN 안에서 프레임 전달           |
| 라우터        | IP 주소         | 서로 다른 네트워크 사이에서 패킷 전달 |
| L4 로드밸런서 | IP와 포트       | TCP/UDP 트래픽 분산                   |
| L7 로드밸런서 | URL, 헤더, 쿠키 | HTTP 요청 내용에 따른 분산            |

---

## 2.4 IP 주소

### 2.4.1 ARP

**ARP(Address Resolution Protocol)**는 같은 IPv4 네트워크 안에서 IP 주소에 대응하는 MAC 주소를 알아내는 프로토콜이다.

```text
호스트 A: 192.168.0.10의 MAC 주소를 아는 장치가 있는가?
호스트 B: 192.168.0.10은 나이며 MAC 주소는 AA:BB:CC:DD:EE:FF다.
```

일반적인 동작 과정은 다음과 같다.

1. 송신자가 ARP Request를 브로드캐스트한다.
2. 해당 IP 주소를 가진 장치가 ARP Reply로 응답한다.
3. 송신자가 IP와 MAC 주소의 관계를 ARP 캐시에 저장한다.
4. 이후 일정 시간 동안 캐시된 값을 사용한다.

ARP 캐시 확인:

```bash
arp -a
```

Linux에서는 다음 명령어도 사용할 수 있다.

```bash
ip neigh
```

목적지 IP가 다른 네트워크에 있다면 송신자는 원격 서버의 MAC 주소를 찾지 않는다. 대신 패킷을 전달할 **기본 게이트웨이의 MAC 주소**를 ARP로 찾는다.

IPv6에서는 ARP 대신 ICMPv6 기반의 **NDP(Neighbor Discovery Protocol)**를 사용한다.

---

### 2.4.2 홉바이홉 통신

패킷은 출발지에서 목적지까지 한 번에 전달되지 않는다. 여러 라우터를 하나씩 거치며 전달되는데, 이를 **홉바이홉(Hop-by-Hop) 통신**이라고 한다.

각 라우터는 라우팅 테이블을 확인해 다음 홉을 결정한다.

```text
클라이언트
    ↓
기본 게이트웨이
    ↓
통신사 라우터
    ↓
인터넷 라우터
    ↓
목적지 서버
```

각 라우터는 전체 경로를 모두 알 필요 없이 목적지로 보내기 위한 다음 경로를 결정한다.

---

#### 라우팅 테이블

라우팅 테이블에는 일반적으로 다음 정보가 포함된다.

- 목적지 네트워크
- 서브넷 마스크 또는 CIDR 접두사
- 다음 홉
- 네트워크 인터페이스
- 경로 우선순위를 나타내는 메트릭

Linux:

```bash
ip route
```

macOS:

```bash
netstat -rn
```

Windows:

```powershell
route print
```

---

#### TTL

IPv4 패킷의 **TTL(Time To Live)**은 라우터를 지날 때마다 1씩 감소한다.

TTL이 0이 되면 라우터가 패킷을 폐기하고 일반적으로 ICMP Time Exceeded 메시지를 전송한다.

TTL은 잘못된 라우팅으로 패킷이 무한히 순환하는 것을 방지한다.

IPv6에서는 같은 역할의 필드를 **Hop Limit**이라고 한다.

---

### 2.4.3 IP 주소 체계

#### IPv4

IPv4 주소는 32비트이며 8비트씩 네 개의 옥텟으로 나누어 표현한다.

```text
192.168.0.1
```

```text
11000000.10101000.00000000.00000001
```

IPv4 주소는 약 43억 개이지만 예약 주소와 네트워크 구성상의 제약이 있고 인터넷 사용자가 증가하면서 주소 부족 문제가 발생했다.

이를 완화하기 위해 사설 IP, NAT, CIDR 등이 사용되었고 IPv6도 도입되었다.

---

#### IPv6

IPv6 주소는 128비트이며 일반적으로 16비트씩 여덟 그룹으로 나누어 16진수로 표현한다.

```text
2001:0db8:0000:0000:0000:0000:0000:0001
```

연속된 0은 한 번에 한해 `::`로 축약할 수 있다.

```text
2001:db8::1
```

IPv6의 주요 특징은 다음과 같다.

- 매우 큰 주소 공간
- 브로드캐스트 대신 멀티캐스트 사용
- ARP 대신 NDP 사용
- 단순화된 기본 헤더
- 자동 주소 설정 지원

---

#### 사설 IPv4 주소

| 대역                              | CIDR             |
| --------------------------------- | ---------------- |
| `10.0.0.0` ~ `10.255.255.255`     | `10.0.0.0/8`     |
| `172.16.0.0` ~ `172.31.255.255`   | `172.16.0.0/12`  |
| `192.168.0.0` ~ `192.168.255.255` | `192.168.0.0/16` |

사설 IP 주소는 인터넷에서 직접 라우팅되지 않는다.

일반적으로 라우터나 클라우드 게이트웨이가 NAT를 사용해 사설 IP와 공인 IP 사이를 변환한다.

---

#### 특수 주소

| 주소              | 의미                                                |
| ----------------- | --------------------------------------------------- |
| `127.0.0.0/8`     | IPv4 루프백 주소                                    |
| `127.0.0.1`       | 현재 장치 자신                                      |
| `0.0.0.0`         | 지정되지 않은 IPv4 주소 또는 모든 인터페이스 바인딩 |
| `255.255.255.255` | 제한된 브로드캐스트                                 |
| `169.254.0.0/16`  | IPv4 링크 로컬 주소                                 |
| `::1`             | IPv6 루프백 주소                                    |
| `::`              | 지정되지 않은 IPv6 주소                             |

서버를 `0.0.0.0`에 바인딩하면 일반적으로 모든 IPv4 네트워크 인터페이스에서 연결을 받을 수 있다는 의미다.

```ts
await app.listen(3000, "0.0.0.0");
```

외부에서 실제로 접근할 수 있는지는 방화벽, 보안 그룹, 라우터, 포트 포워딩 설정에 따라 달라진다.

---

#### CIDR

**CIDR(Classless Inter-Domain Routing)**는 IP 주소와 네트워크 접두사 길이를 함께 표기하는 방식이다.

```text
192.168.0.0/24
```

`/24`는 앞의 24비트가 네트워크 부분이라는 의미다.

```text
네트워크 주소: 192.168.0.0
사용 범위:     192.168.0.0 ~ 192.168.0.255
```

전통적인 IPv4 서브넷에서는 첫 번째 주소를 네트워크 주소, 마지막 주소를 브로드캐스트 주소로 사용하므로 일반 호스트에 할당할 수 있는 주소 수가 줄어든다.

클라우드 서비스는 플랫폼 내부 용도로 주소를 추가 예약할 수도 있다.

---

#### TypeScript로 IPv4 CIDR 확인

```ts
import { isIP } from "node:net";

function ipv4ToBigInt(ip: string): bigint {
  if (isIP(ip) !== 4) {
    throw new Error(`올바르지 않은 IPv4 주소: ${ip}`);
  }

  return ip
    .split(".")
    .reduce((result, octet) => (result << 8n) | BigInt(Number(octet)), 0n);
}

function isInSubnet(ip: string, cidr: string): boolean {
  const parts = cidr.split("/");

  if (parts.length !== 2) {
    throw new Error(`올바르지 않은 CIDR: ${cidr}`);
  }

  const [networkIp, prefixText] = parts;
  const prefix = Number(prefixText);

  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`올바르지 않은 접두사 길이: ${prefixText}`);
  }

  const shift = BigInt(32 - prefix);

  return ipv4ToBigInt(ip) >> shift === ipv4ToBigInt(networkIp) >> shift;
}

console.log(isInSubnet("192.168.0.15", "192.168.0.0/24")); // true
console.log(isInSubnet("192.168.1.15", "192.168.0.0/24")); // false
console.log(isInSubnet("10.10.10.10", "0.0.0.0/0")); // true
```

직접 구현한 코드는 학습 목적으로 사용할 수 있지만, 실무에서는 검증된 IP/CIDR 라이브러리나 클라우드 플랫폼의 네트워크 기능을 사용하는 것이 안전하다.

---

### 2.4.4 IP 주소를 이용한 위치 정보

GeoIP 데이터베이스는 IP 대역을 국가, 도시, 통신사 등의 정보와 연결한다.

하지만 IP 기반 위치 정보는 대략적인 추정값이며 다음 이유로 정확하지 않을 수 있다.

- VPN 사용
- 프록시 사용
- 이동통신망 사용
- 회사 네트워크 사용
- 통신사의 IP 재할당
- CDN 또는 클라우드 네트워크 사용

따라서 GeoIP를 사용자의 정확한 위치로 간주해서는 안 된다.

---

#### 리버스 프록시 환경의 실제 클라이언트 IP

서버가 리버스 프록시나 로드밸런서 뒤에 있으면 서버 소켓에 보이는 원격 주소는 클라이언트가 아니라 프록시의 IP일 수 있다.

```text
클라이언트
    ↓
Nginx 또는 로드밸런서
    ↓
Node.js/NestJS 서버
```

이때 프록시는 다음과 같은 헤더로 원래 클라이언트 정보를 전달할 수 있다.

```http
X-Forwarded-For: 203.0.113.10, 10.0.0.20
```

일반적으로 왼쪽에는 원래 클라이언트와 가까운 주소가, 오른쪽에는 애플리케이션 서버와 가까운 프록시 주소가 추가된다.

하지만 클라이언트가 임의로 `X-Forwarded-For`를 보낼 수 있으므로 헤더를 무조건 신뢰하면 IP 스푸핑 문제가 발생할 수 있다.

---

#### 잘못된 처리 예시

```js
app.get("/whoami", (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress;

  res.json({ ip: clientIp });
});
```

문법적으로는 동작하지만 신뢰할 수 있는 프록시를 거치지 않은 요청에서도 사용자가 직접 보낸 헤더를 신뢰한다는 문제가 있다.

---

#### Express의 안전한 처리 방법

```js
import express from "express";

const app = express();

// 실제 운영 환경에서 사용하는 프록시 IP 또는 서브넷만 등록한다.
app.set("trust proxy", ["loopback", "10.0.0.0/8", "172.16.0.0/12"]);

app.get("/whoami", (req, res) => {
  res.json({
    ip: req.ip,
    proxyChain: req.ips,
  });
});

app.listen(3000);
```

`trust proxy`에는 실제로 신뢰할 수 있는 프록시의 IP나 서브넷만 설정해야 한다.

프록시 구조를 확인하지 않고 무조건 `true`로 설정하면 사용자가 전달한 헤더를 실제 IP로 오인할 수 있다.

---

#### NestJS에서 클라이언트 IP 가져오기

`main.ts`:

```ts
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 실제 운영 프록시 환경에 맞는 주소만 신뢰해야 한다.
  app.set("trust proxy", ["loopback", "10.0.0.0/8", "172.16.0.0/12"]);

  await app.listen(3000);
}

void bootstrap();
```

컨트롤러:

```ts
import { Controller, Get, Ip } from "@nestjs/common";

@Controller("network")
export class NetworkController {
  @Get("whoami")
  getClientIp(@Ip() ip: string): { ip: string } {
    return { ip };
  }
}
```

NestJS가 Fastify 어댑터를 사용하는 경우 프록시 신뢰 설정 방식이 Express와 다르므로 사용하는 어댑터의 설정을 확인해야 한다.

---

#### 브라우저 JavaScript와 공인 IP

브라우저 JavaScript는 일반적인 웹 API만으로 자신의 공인 IP를 직접 확인할 수 없다.

보통 다음 방법을 사용한다.

- 자신의 서버에 요청해 서버가 확인한 IP 반환
- 신뢰할 수 있는 외부 IP 확인 API 사용

보안과 개인정보 보호 관점에서 외부 서비스를 사용할 때는 개인정보 처리 정책도 확인해야 한다.

---

## 2.5 HTTP

**HTTP(Hypertext Transfer Protocol)**는 클라이언트와 서버가 요청과 응답을 주고받기 위한 애플리케이션 계층 프로토콜이다.

HTTP는 기본적으로 **무상태(Stateless)** 프로토콜이다.

서버는 각 요청을 독립적으로 처리한다. 로그인 상태처럼 요청 사이에 상태가 필요하면 쿠키, 세션, 토큰 등을 사용한다.

---

### HTTP 버전 비교

| 구분        | HTTP/1.0                 | HTTP/1.1          | HTTP/2                     | HTTP/3                    |
| ----------- | ------------------------ | ----------------- | -------------------------- | ------------------------- |
| 전송 기반   | TCP                      | TCP               | TCP                        | QUIC/UDP                  |
| 연결 재사용 | 기본적으로 사용하지 않음 | 기본적으로 사용   | 사용                       | 사용                      |
| 요청 다중화 | 지원하지 않음            | 실질적으로 제한됨 | 지원                       | 지원                      |
| 헤더 압축   | 없음                     | 없음              | HPACK                      | QPACK                     |
| 주요 특징   | 요청마다 새 연결         | Keep-Alive        | 바이너리 프레이밍과 스트림 | QUIC과 TLS 1.3            |
| 주요 한계   | 연결 비용                | 애플리케이션 HOL  | TCP HOL                    | 구현과 네트워크 지원 필요 |

---

### 2.5.1 HTTP/1.0

HTTP/1.0은 기본적으로 요청과 응답이 끝나면 TCP 연결을 종료하는 비지속 연결 방식이다.

```text
TCP 연결
  ↓
HTTP 요청
  ↓
HTTP 응답
  ↓
TCP 종료
```

여러 리소스를 요청하면 TCP 연결을 반복해서 만들어야 하므로 연결 설정 비용이 커진다.

일부 HTTP/1.0 구현은 `Connection: keep-alive` 확장을 지원했지만 표준 기본 동작은 아니었다.

---

### 2.5.2 HTTP/1.1

HTTP/1.1에서는 TCP 연결을 기본적으로 유지하고 여러 요청에 재사용할 수 있다.

#### Keep-Alive

```text
TCP 연결
  ├─ 요청 1 → 응답 1
  ├─ 요청 2 → 응답 2
  └─ 요청 3 → 응답 3
```

연결을 재사용하면 다음 비용을 줄일 수 있다.

- TCP 3-way handshake
- TLS 핸드셰이크
- 연결 생성과 종료 비용

---

#### HTTP 파이프라이닝

HTTP/1.1 파이프라이닝은 앞선 응답을 기다리지 않고 여러 요청을 연속으로 보내는 방식이다.

```text
요청 A ──>
요청 B ──>
요청 C ──>

<── 응답 A
<── 응답 B
<── 응답 C
```

응답은 요청 순서대로 전달되어야 한다.

응답 A가 느리면 이미 준비된 응답 B와 C도 대기하게 된다. 이를 애플리케이션 계층의 **HOL(Head-of-Line) Blocking**이라고 한다.

호환성과 성능 문제 때문에 브라우저에서는 HTTP/1.1 파이프라이닝이 널리 사용되지 않았다. 대신 여러 TCP 연결을 동시에 사용하는 방식이 사용되었다.

---

### 2.5.3 HTTP/2

HTTP/2는 하나의 TCP 연결에서 여러 요청과 응답을 동시에 처리할 수 있도록 설계되었다.

#### 바이너리 프레이밍

HTTP/2는 HTTP 메시지를 작은 바이너리 프레임으로 나눈다.

```text
HTTP 메시지
    ↓
HEADERS 프레임
DATA 프레임
DATA 프레임
```

---

#### 스트림과 멀티플렉싱

각 요청과 응답은 독립적인 **스트림(Stream)**에 속한다.

여러 스트림의 프레임을 하나의 TCP 연결에서 섞어 전송할 수 있다.

```text
TCP 연결
  ├─ Stream 1: 요청 A와 응답 A
  ├─ Stream 3: 요청 B와 응답 B
  └─ Stream 5: 요청 C와 응답 C
```

따라서 HTTP/1.1 파이프라이닝의 애플리케이션 계층 HOL Blocking을 개선한다.

---

#### HTTP/2의 TCP HOL Blocking

HTTP/2는 애플리케이션 계층에서는 여러 스트림을 다중화하지만, 전송 계층에서는 하나의 TCP 연결을 사용한다.

TCP는 바이트 순서를 보장하므로 하나의 TCP 패킷이 손실되면 재전송이 완료될 때까지 같은 연결의 뒤쪽 데이터를 애플리케이션에 전달하지 못할 수 있다.

따라서 하나의 패킷 손실이 여러 HTTP/2 스트림에 영향을 줄 수 있다.

```text
HTTP/1.1 HOL: 앞선 HTTP 응답 때문에 뒤 응답이 대기
HTTP/2 TCP HOL: 손실된 TCP 데이터 때문에 여러 스트림이 대기
```

---

#### 헤더 압축

HTTP/2는 **HPACK**을 사용해 반복되는 HTTP 헤더를 압축한다.

쿠키, User-Agent처럼 요청마다 반복되는 헤더의 전송량을 줄일 수 있다.

---

#### Server Push

HTTP/2 Server Push는 클라이언트가 직접 요청하지 않은 리소스를 서버가 미리 전송할 수 있는 기능이다.

다만 캐시 중복과 복잡성 등의 문제로 실제 브라우저 지원과 활용은 제한적이다.

---

### 2.5.4 HTTPS

**HTTPS**는 HTTP 통신을 TLS로 보호하는 방식이다.

HTTP/1.1과 HTTP/2에서는 일반적으로 다음 구조로 동작한다.

```text
HTTP
 ↓
TLS
 ↓
TCP
 ↓
IP
```

HTTPS가 제공하는 주요 기능은 다음과 같다.

- 기밀성: 제3자가 통신 내용을 읽기 어렵게 한다.
- 무결성: 통신 중 데이터가 변경되었는지 확인한다.
- 인증: 인증서를 통해 접속한 서버의 신원을 확인한다.

---

#### 인증서 검증

브라우저나 클라이언트는 일반적으로 다음 내용을 확인한다.

- 인증서의 도메인이 접속한 도메인과 일치하는지
- 인증서의 유효 기간이 지나지 않았는지
- 인증서 서명이 올바른지
- 신뢰할 수 있는 인증 기관으로 연결되는지

인증서가 있다고 해서 해당 서비스 자체가 안전하거나 악성 서비스가 아니라는 뜻은 아니다. 인증서는 주로 접속한 서버의 도메인과 암호화 연결을 검증한다.

---

#### TLS 1.3 핸드셰이크

TLS 1.3의 핵심 흐름을 단순화하면 다음과 같다.

1. 클라이언트가 `ClientHello`를 보낸다.
2. 지원하는 TLS 버전, Cipher Suite, Key Share 등을 전달한다.
3. 서버가 `ServerHello`로 사용할 값을 선택한다.
4. 클라이언트와 서버가 ECDHE 등을 사용해 같은 공유 비밀을 계산한다.
5. 서버가 인증서와 전자서명으로 자신의 신원을 증명한다.
6. 양측이 공유 비밀에서 세션 키를 파생한다.
7. 이후 HTTP 데이터를 대칭키로 암호화한다.

TLS 1.3은 일반적으로 서버 공개키로 대칭키 자체를 암호화해 보내는 방식으로 설명하면 정확하지 않다.

현대적인 TLS에서는 ECDHE와 같은 키 합의 방식으로 양측이 같은 공유 비밀을 계산한다.

---

#### 비대칭키와 대칭키를 함께 사용하는 이유

비대칭키 기술은 다음 작업에 유용하다.

- 상대방 인증
- 전자서명 검증
- 안전한 키 설정

하지만 대용량 데이터를 처리하기에는 계산 비용이 크다.

대칭키 암호화는 빠르기 때문에 TLS 핸드셰이크 이후의 실제 HTTP 데이터 암호화에 사용한다.

---

### 2.5.5 HTTP/3

HTTP/3는 TCP 대신 UDP 기반의 **QUIC**을 사용한다.

```text
HTTP/3
   ↓
QUIC + TLS 1.3
   ↓
UDP
   ↓
IP
```

QUIC은 UDP가 제공하지 않는 다음 기능을 직접 구현한다.

- 신뢰성 있는 데이터 전송
- 패킷 재전송
- 혼잡 제어
- 스트림 다중화
- 암호화
- 연결 이동

---

#### HTTP/3의 HOL Blocking 개선

QUIC은 스트림별로 데이터의 순서와 손실 복구를 관리한다.

한 스트림의 패킷이 손실되어도 다른 스트림의 데이터를 직접 막지 않는다.

```text
Stream A: 패킷 손실 → Stream A만 복구 대기
Stream B: 계속 처리
Stream C: 계속 처리
```

다만 하나의 QUIC 연결이 혼잡 제어 상태를 공유할 수 있으므로 패킷 손실이 다른 스트림의 전송 속도에 간접적인 영향을 줄 수는 있다.

---

#### 빠른 연결 설정

QUIC은 TLS 1.3을 전송 프로토콜에 통합해 TCP 연결과 TLS 연결을 별도로 수행하는 비용을 줄인다.

기존 서버와 연결한 이력이 있으면 연결 재개를 통해 지연 시간을 더 줄일 수 있다.

0-RTT 데이터는 재전송 공격 가능성을 고려해야 하므로 멱등성이 보장되지 않는 요청에 무조건 사용해서는 안 된다.

---

#### 연결 이동

QUIC은 IP 주소와 포트만으로 연결을 식별하지 않고 Connection ID를 사용한다.

따라서 모바일 기기가 Wi-Fi에서 이동통신망으로 변경되더라도 조건이 맞으면 기존 연결을 유지할 수 있다.

---

#### HTTP/2와 HTTP/3 비교

| 구분          | HTTP/2                            | HTTP/3                         |
| ------------- | --------------------------------- | ------------------------------ |
| 전송 기반     | TCP                               | QUIC/UDP                       |
| 멀티플렉싱    | HTTP/2 스트림                     | QUIC 스트림                    |
| 헤더 압축     | HPACK                             | QPACK                          |
| TLS           | 일반적으로 TLS를 별도로 사용      | TLS 1.3 통합                   |
| 패킷 손실     | 여러 스트림이 함께 대기할 수 있음 | 손실된 스트림 중심으로 복구    |
| 네트워크 변경 | 연결이 끊어질 수 있음             | Connection ID로 연결 이동 지원 |

HTTP/3는 네트워크 변경이 잦은 모바일 환경이나 높은 RTT, 패킷 손실이 있는 환경에서 유리할 수 있다.

---

## 2.6 HTTP 요청 실무 예시

### 2.6.1 JavaScript와 Node.js Fetch

Node.js 18 이상에서는 전역 `fetch()`를 사용할 수 있다.

```js
async function getPlayer(id) {
  const response = await fetch(`https://api.example.com/players/${id}`);

  if (!response.ok) {
    throw new Error(`요청 실패: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(`JSON 응답이 아닙니다: ${contentType}`);
  }

  return response.json();
}

getPlayer(1).then(console.log).catch(console.error);
```

`fetch()`는 404나 500 같은 HTTP 오류 상태만으로 Promise를 자동으로 거부하지 않는다.

따라서 `response.ok` 또는 `response.status`를 직접 확인해야 한다.

---

### 2.6.2 TypeScript Fetch와 런타임 검증

TypeScript의 타입과 인터페이스는 컴파일 후 사라진다.

따라서 다음 코드는 서버의 실제 응답 형식을 검증하지 않는다.

```ts
const player = (await response.json()) as Player;
```

외부 API의 응답을 안전하게 사용하려면 런타임 검증이 필요하다.

```ts
interface Player {
  id: number;
  name: string;
  score: number;
}

function isPlayer(value: unknown): value is Player {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const player = value as Record<string, unknown>;

  return (
    typeof player.id === "number" &&
    typeof player.name === "string" &&
    typeof player.score === "number"
  );
}

async function getPlayer(id: number): Promise<Player> {
  const response = await fetch(`https://api.example.com/players/${id}`);

  if (!response.ok) {
    throw new Error(`요청 실패: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isPlayer(data)) {
    throw new Error("올바르지 않은 응답 형식입니다.");
  }

  return data;
}
```

실무에서는 다음과 같은 검증 도구를 사용할 수 있다.

- Zod
- Joi
- Valibot
- class-validator
- JSON Schema

---

### 2.6.3 Node.js HTTPS 모듈

```js
const https = require("node:https");

https
  .get("https://api.example.com/players/1", (response) => {
    let body = "";

    response.setEncoding("utf8");

    response.on("data", (chunk) => {
      body += chunk;
    });

    response.on("end", () => {
      const statusCode = response.statusCode ?? 0;

      if (statusCode < 200 || statusCode >= 300) {
        console.error(`요청 실패: ${statusCode}`);
        return;
      }

      try {
        console.log(JSON.parse(body));
      } catch (error) {
        console.error("JSON 파싱 실패", error);
      }
    });
  })
  .on("error", (error) => {
    console.error("네트워크 오류", error);
  });
```

일반적인 API 호출에서는 `fetch()`가 더 간편하다.

하지만 스트림, 소켓, Agent, 연결 재사용 같은 저수준 동작을 이해하려면 Node.js의 `http`와 `https` 모듈도 알아두는 것이 좋다.

---

### 2.6.4 NestJS HttpModule

패키지 설치:

```bash
npm install @nestjs/axios axios
```

모듈 설정:

```ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PlayerClient } from "./player.client";

@Module({
  imports: [
    HttpModule.register({
      timeout: 3_000,
      maxRedirects: 3,
    }),
  ],
  providers: [PlayerClient],
  exports: [PlayerClient],
})
export class PlayerModule {}
```

클라이언트 서비스:

```ts
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface Player {
  id: number;
  name: string;
  score: number;
}

function isPlayer(value: unknown): value is Player {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const player = value as Record<string, unknown>;

  return (
    typeof player.id === "number" &&
    typeof player.name === "string" &&
    typeof player.score === "number"
  );
}

@Injectable()
export class PlayerClient {
  constructor(private readonly httpService: HttpService) {}

  async getPlayer(id: number): Promise<Player> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`https://api.example.com/players/${id}`),
    );

    if (!isPlayer(response.data)) {
      throw new Error("올바르지 않은 응답 형식입니다.");
    }

    return response.data;
  }
}
```

`HttpService.get<Player>()`처럼 제네릭 타입을 지정해도 컴파일 단계에서만 타입이 적용된다.

외부 API 응답을 신뢰할 수 없다면 반드시 별도의 런타임 검증을 추가해야 한다.

실무에서는 다음 사항도 함께 고려해야 한다.

- 연결 및 응답 타임아웃
- 재시도 횟수
- 지수 백오프
- 서킷 브레이커
- 요청 취소
- 로깅과 트레이싱
- 멱등성
- 외부 API의 요청 제한

POST 요청처럼 멱등성이 보장되지 않는 요청은 무조건 재시도하면 중복 처리 문제가 발생할 수 있다.

---

## 예상 면접 질문과 답변

### 처리량과 지연 시간의 차이는 무엇인가요?

> 처리량은 단위 시간 동안 실제로 전송하거나 처리한 데이터나 요청의 양이고, 지연 시간은 하나의 요청이나 데이터 전달에 걸리는 시간입니다. 서버 증설과 병렬 처리는 처리량 개선에 도움이 되고, 캐싱과 쿼리 최적화, CDN, 가까운 리전 사용은 지연 시간 개선에 도움이 될 수 있습니다.

---

### TCP/IP 4계층과 OSI 7계층의 차이는 무엇인가요?

> OSI 7계층은 통신 과정을 일곱 계층으로 세분화한 이론적인 참조 모델이고, TCP/IP 모델은 실제 인터넷 프로토콜을 중심으로 네 계층으로 설명한 모델입니다. OSI의 응용·표현·세션 계층은 TCP/IP의 애플리케이션 계층에 대응하고, 데이터 링크·물리 계층은 네트워크 인터페이스 계층에 대응합니다.

---

### TCP와 UDP의 차이는 무엇인가요?

> TCP는 연결 지향적이며 재전송, 순서 보장, 흐름 제어, 혼잡 제어를 제공합니다. UDP는 연결 설정 없이 데이터그램을 전송하고 이러한 기능을 기본적으로 제공하지 않아 오버헤드가 작습니다. 다만 QUIC처럼 UDP 위에서 신뢰성과 혼잡 제어를 별도로 구현할 수도 있습니다.

---

### 라우터와 스위치의 차이는 무엇인가요?

> 라우터는 IP 주소와 라우팅 테이블을 이용해 서로 다른 네트워크 사이로 패킷을 전달합니다. 스위치는 MAC 주소 테이블을 이용해 같은 LAN 안에서 프레임을 적절한 포트로 전달합니다.

---

### ARP는 무엇인가요?

> ARP는 같은 IPv4 네트워크에서 IP 주소에 대응하는 MAC 주소를 알아내는 프로토콜입니다. ARP Request를 브로드캐스트하고 해당 IP를 가진 장치가 자신의 MAC 주소로 응답합니다. 목적지가 다른 네트워크라면 원격 서버가 아니라 기본 게이트웨이의 MAC 주소를 찾습니다.

---

### HTTP/1.1의 HOL Blocking을 HTTP/2가 어떻게 개선했나요?

> HTTP/1.1 파이프라이닝에서는 응답 순서를 유지해야 하므로 앞선 응답이 늦으면 뒤의 응답도 대기합니다. HTTP/2는 요청과 응답을 스트림과 프레임으로 나누고 하나의 연결에서 다중화해 애플리케이션 계층의 HOL Blocking을 개선했습니다. 다만 TCP 위에서 동작하기 때문에 TCP 패킷 손실로 인한 전송 계층 HOL Blocking은 남아 있습니다.

---

### HTTP/2에서 하나의 패킷 손실이 다른 스트림에도 영향을 주나요?

> 그렇습니다. HTTP/2는 여러 스트림을 사용하지만 하나의 TCP 연결 위에서 동작합니다. TCP는 바이트 순서를 보장하므로 패킷이 손실되면 재전송이 완료될 때까지 같은 연결의 여러 스트림이 영향을 받을 수 있습니다. 이 문제를 스트림 단위로 개선한 것이 HTTP/3의 QUIC입니다.

---

### TLS 1.3 핸드셰이크 과정을 설명해 주세요.

> 클라이언트가 ClientHello에 지원하는 TLS 버전, Cipher Suite, Key Share 등을 전달하고 서버가 ServerHello로 사용할 값을 선택합니다. 양측은 ECDHE 등을 사용해 같은 공유 비밀을 계산하고, 서버는 인증서와 전자서명으로 자신의 신원을 증명합니다. 이후 공유 비밀에서 대칭키를 파생하고 해당 키로 실제 데이터를 암호화합니다.

---

### 비대칭키와 대칭키를 함께 사용하는 이유는 무엇인가요?

> 비대칭키 기술은 상대방 인증과 전자서명, 안전한 키 설정에 유용하지만 대용량 데이터를 처리하기에는 계산 비용이 큽니다. 대칭키 암호화는 빠르기 때문에 TLS 핸드셰이크 이후 실제 HTTP 데이터 암호화에 사용합니다.

---

### HTTP/3가 QUIC을 사용하는 이유는 무엇인가요?

> HTTP/2는 여러 스트림을 지원하지만 하나의 TCP 연결을 사용하기 때문에 TCP 패킷 손실이 여러 스트림에 영향을 줄 수 있습니다. QUIC은 스트림별로 순서와 손실 복구를 관리해 한 스트림의 손실이 다른 스트림을 직접 막지 않도록 합니다. 또한 TLS 1.3을 통합해 연결 설정 지연을 줄이고 Connection ID를 사용해 네트워크 변경 시 연결 이동도 지원합니다.

---

### 리버스 프록시 뒤에서 실제 클라이언트 IP는 어떻게 구하나요?

> 리버스 프록시가 추가한 X-Forwarded-For 등의 정보를 사용하되, 해당 헤더를 직접 파싱해서 무조건 신뢰하면 안 됩니다. Express나 NestJS에서 실제 프록시의 IP 또는 서브넷만 trust proxy로 설정한 뒤 req.ip나 @Ip()를 사용해야 합니다.

---

## 핵심 정리

- 대역폭은 이론적인 최대 전송 용량이고 처리량은 실제 전송량이다.
- 지연 시간은 데이터 전달에 걸리는 시간이며 RTT는 왕복 시간이다.
- IP 주소는 장치를 구분하고 포트 번호는 장치 안의 서비스를 구분한다.
- TCP는 신뢰성과 순서를 제공하고 UDP는 오버헤드가 작다.
- 스위치는 MAC 주소, 라우터는 IP 주소를 기준으로 데이터를 전달한다.
- ARP는 같은 IPv4 네트워크에서 IP 주소에 대응하는 MAC 주소를 찾는다.
- HTTP/1.1은 Keep-Alive를 지원하지만 파이프라이닝 HOL 문제가 있다.
- HTTP/2는 스트림 다중화로 애플리케이션 HOL을 개선하지만 TCP HOL은 남아 있다.
- HTTP/3는 QUIC을 사용해 스트림 간 HOL 문제와 연결 설정 비용을 개선한다.
- TLS 1.3은 ECDHE 등을 사용해 공유 비밀을 만들고 대칭키를 파생한다.
- `X-Forwarded-For`는 신뢰할 수 있는 프록시가 관리할 때만 신뢰해야 한다.
- TypeScript 타입만으로 외부 API 응답을 검증할 수 없으므로 런타임 검증이 필요하다.

---

## 참고 자료

- [면접을 위한 CS 전공지식 노트 - 네트워크](https://thebook.io/080326/0054/)
- [RFC 9110 - HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9112 - HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113 - HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 8446 - TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 9114 - HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [Express - Behind Proxies](https://expressjs.com/en/guide/behind-proxies.html)
