# 🌐 NestJS — Interceptors

> 요청 전후 처리, 응답 변환, 로깅, 캐싱까지 담당하는 Interceptor 완전 정리

---

## 1. Interceptor란?

Interceptor는 컨트롤러 핸들러 **실행 전후**에 추가 로직을 삽입할 수 있는 컴포넌트다

- `@Injectable()` 데코레이터가 붙은 클래스
- `NestInterceptor` 인터페이스를 구현
- AOP(관점 지향 프로그래밍) 패턴을 기반으로 동작
- RxJS의 `Observable`을 활동

> 💡 `handle()`을 호출하지 않으면 컨트롤러가 **실행되지 않는다.**

---

## 2. Interceptor가 할 수 있는 것

| 기능         | 설명                                            |
| ------------ | ----------------------------------------------- |
| 요청 전 처리 | 핸들러 실행 전 로직 삽입 (로깅, 타이머 시작 등) |
| 응답 변환    | 핸들러가 반환한 값을 가공해서 클라이언트에 전달 |
| 예외 변환    | 예외를 잡아 다른 형태로 변환                    |
| 캐싱         | 특정 조건에서 핸들러를 실행하지 않고 캐시 반환  |
| 로깅         | 요청/응답 시간, 데이터 기록                     |

---

## 3. NestInterwceptor 인터페이스

```typescript
export interface NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable;
}
```

### CallHandler

```typescript
export interface CallHandler {
  handle(): Observable; // 컨트롤러 핸들러를 실행
}
```

`next.handle()`을 호출해야 컨트롤러가 실행된다. 호출하지 않으면 요청이 거기서 멈춘다.

---

## 4. 기본 Interceptor 예시 - 로깅

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable {
    const start = Date.now();
    console.log("요청 시작");

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        console.log(`요청 완료 — ${elapsed}ms 소요`);
      }),
    );
  }
}
```

---

## 5. 응답 변환 Interceptor

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

컨트롤러가 `{ id: 1, name: '홍길동' }`을 반환하면 클라이언트에는 아래처럼 전달된다.

```json
{
  "success": true,
  "data": { "id": 1, "name": "홍길동" },
  "timestamp": "2026-05-25T00:00:00.000Z"
}
```

---
