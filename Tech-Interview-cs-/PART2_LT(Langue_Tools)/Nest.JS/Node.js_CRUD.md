# 🌐 Node.js -> NestJS CRUD 기존 정리

> Board Model + DTO + Controller, Service, 예외처리
> 면접 대비 정리

---

## 1. NestJS 기본 요청 흐름

NestJS는 **Controller -> Servsice** 구조로 역할을 분리한다

```
Client 요청
    ↓
Controller - HTTP 요청 수신, 데이터 추출, Service 호출
    ↓
Service - 비지니스 로직 처리, 데이터 반환
    ↓
Controller - 결과를 Client에 응답
    ↓
Client 응답
```

### 역할 분리 이유

| 레이어         | 역할                       | 하면 안 되는 것            |
| -------------- | -------------------------- | -------------------------- |
| **Controller** | 요청/응답 처리, 라우팅     | 비지니스 로직 직접 처리    |
| **Service**    | 비지니스 로직, 데이터 처리 | HTTP 요청/응답 직접 다루기 |

---

## 2. Board Model 정의

### Model이 필요한 이유

게시물 데이터 Service, Controller 등 여러 곳에서 사용한다
타입을 미리 정의해 두지 않으면 잘못된 데이터 구조를 사용해도 컴파일 시점에 알 수 없다.

### Interface, Class

| 구분            | Interface                 | Class               |
| --------------- | ------------------------- | ------------------- |
| 런타임 존재여부 | 컴파일 시 제거된다        | 런타임에도 존재한다 |
| 유효성 검사     | 불가하다                  | 가능(Pipe 활용)     |
| 인스턴스 생성   | 불가하다                  | 가능하다            |
| Model 정의      | 적합하다 (단순 구조 정의) | 적합 (DTO에 권장)   |

> Model(데이터 구조 정의)에는 Interface, DTO에는 Class를 쓰는것이 NestJS 권장 방식이다.

### Board Interface

```ts
// board.model.ts

// 게시물 상태 - PUBLIC/PRIVATE 두 가지
// Enum을 쓰는 이유: 오타 방지 및 허용 값 제한
export enum BoardStatus {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// 게시물 데이터 구조 정의
export interface Board {
  id: string; // 게시물 식별자
  title: string;
  description: string;
  status: BoardStatus; // 공개여부
}
```

### 타입 정의의 장점

```
타입 정의
    ↓
잘못된 타입 사용 시 컴파일 에러로 즉시 감지
    ↓
IDE 자동 완성  + 타입 체크로 개발 생산성 향상
    ↓
코드 구조가 명확해져 유지보수 용이
```

---

## 3. 전체 게시물 조회
