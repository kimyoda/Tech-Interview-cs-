# macOS에서 OpenVPN, OTP로 사내 VPN 접속

> 회사 디비 인프라 접근을 위해 OpenVPN + OTP 이중 인증 방식으로 VPN을 연결, 배스천 서버(Bastion Server)를 통해 내부망에 접근하는 과정을 정리한 내용

---

## 환경

| 항목           | 내용                               |
| -------------- | ---------------------------------- | --------------- |
| OS             | macOS (Apple Silicon)              |
| VPN 클라이언트 | OpenVPN                            |
| OTP 방식       | TOTP(Time-based One-Time Password) |
| OTP 도구       | `oathtool`                         |
| 프로토콜       |                                    | UDP / 1194 포트 |

---

### 준비

### 필수 도구 설치

```bash
# Homebrew가 없다면 먼저 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# OpenVPN 설치
brew install openvpn

# OTP 생성 도구 설치
brew install oath-toolkit
```

### 파일 확인

VPN 접속에 필요한 파일들을 안전한 경로에 준비해둔다

```
~/Documents/vpn/
├── *.ovpn          # VPN 설정 파일 (인프라 담당자에게 전달받음)
└── auth.txt        # 인증 정보 파일 (스크립트에서 자동 생성)
```

---

## VPN 접속 스크립트 작성

수동으로 OTP를 생성하고 입력하는 과정이 번거로워, 스크립트로 자동화하였다.

1. **OTP 생성** - `oathtool`을 이용해 TOTP 방식으로 일회용 비밀번호를 생성한다

```bash
OTP=$(oathtool --totp -b [BASE32_SECRET_KEY])
```

2. **인증 파일 생성** - 사용자명과 비밀번호(고정값 + OTP 조합)을 파일로 저장한다(`auth.txt`는 매 실행마다, 새로 생성되어, OTP만료 걱정 없이 사용 가능하다)
3. **VPN 실행** - `openvpn` 명령으로 설정 파일과 인증 파일을 참조해 VPN을 연결한다

> 인증 파일은 실행 시마다 새로 생성되어 OTP 만료 문제가 없다
> 인증 파일에는 민감 정보가 포함되어 접근 권한 관리에 주의해야 한다.

```bash
chmod +x ~/Documents/vpn/run_vpn.sh
./run_vpn.sh
```

---

## VPN 연결 확인

아래 로그가 출력되면 정상 연결이다.

```
add net xxx.xxx.xxx.x: gateway xx.x.x.1
Initialization Sequence Completed
```

**`Initialization Sequence Completed`가 나왔다면 연결 성공이다.**

### 라우팅 확인

```bash
# 내부망 대역 라우팅 확인
netstat -rn | grep 172.21
# -> 172.21.xxx.x/xx xx.x.x.x UGSc utun4

# VPN 인터페이스 IP 확인
ifconfig utun4
# -> inet xx.x.x.x --> xx.x.x.x netmask 0xxxxxxx00
```

내부망 대역이 `utun4`를 게이트웨이로 잡고 있으면 라우팅은 정상이다.

---

## 배스천 서버 SSH 접속 시 문제 상황

VPN 연결까지 성공, 배스천 서버로 SSH 접속에서 막혔다.

```bash
ssh username@[BASTION_IP]
# → ssh: connect to host xxx port 22: Operation timed out
```

ping도 100% 패킷 로스였다.

```bash
ping -c 3 [BASTION_IP]
# → 3 packets transmitted, 0 packets received, 100.0% packet loss
```

## 원인

라우팅도 올바르게 잡혔기에, **서버 또는 네트워크 문제**라고 생각했다.

1. 배스천 서버 자체가 꺼져 있거나 SSH 데몬이 미실행 상태
2. AWS Security Group에서 VPN 대역 IP에 대한 22번 포트 인바운드가 열려있지 않음
3. SSH 포트가 22번이 아닌 다른 포트로 설정되어 있음
4. 접속에 pem 키 파일이 필요한 경우

-> 위의 방법을 다 확인하고 인프라 쪽에 문의하였을 때, 계정 권한을 주어지지 않았기에 생겼던 이슈였다.
해당 이슈를 해결하고 배스천 서버로부터 인가를 받아,

```
** The server may need to be upgraded. See https://openssh.xxx/xx.html
#--------------------------------> Warning!!!! <------------------------------#
  |                                                                             |
  | We prohibit unauthorized access to the system and those who are illegally   |
  | accessing the network or trying deleting, modifying, or leaking the         |
  | information will be punished for violation of the laws and ordinances.      |
  |                                                                             |
```

위의 같은 화면이 나와 접속이 가능했다.
