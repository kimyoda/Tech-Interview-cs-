# 🌐 NestJS — Guards

> 인증과 인가의 핵심 컴포넌트, Guard를 처음부터 제대로 이해

---

## 1. Guards

Guard는 요청이 컨트롤러 핸들러까지 도달할 수 있는지 **통과 여부를 판단** 하는 컴포넌트다.

- `@Injectable()` 데코레이터가 붙은 클래스
- `CanActivate` 인터페이스를 구현
- `canActive()`가 `true`를 반환하면 요청 통과, `false`면 차단
- 미들웨어 이후, 인터셉터/파이프 이전에 실행

> 💡 Guard는 단순히 요청을 가공하는 게 아니라, **요청을 허용할지 말지 결정**하는 역할이다.

---

## 2. 인증 vs 인가

| 구분                  | 설명                                       | 예시                            |
| --------------------- | ------------------------------------------ | ------------------------------- |
| 인증 (Authentication) | 사용자가 누구인지 확인                     | JWT 토큰 검증, 로그인 여부 확인 |
| 인가 (Authorization)  | 사용자가 해당 기능을 쓸 권한이 있는지 확인 | 관리자만 접근 가능한 API        |

---

## 3. Middleware vs Guard

| 구분        | Middleware                        | Guard                                          |
| ----------- | --------------------------------- | ---------------------------------------------- |
| 실행 시점   | Guard보다 먼저 실행               | Middleware 이후 실행                           |
| 라우트 정보 | 어떤 핸들러가 실행될 지 모른다    | `ExecutionContext` 로 핸들러 정보를 알 수 있다 |
| 주요 역할   | 공통 전처리, 로깅, 요청 객체 가공 | 인증 / 인가 판단                               |
| 반환값      | 없음 (`next()` 호출)              | `boolean` 또는 `Promise<boolean>`              |

---

## 4. CanActivate 인터페이스

```ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return Boolean(request.user); // user가 있으면 통과
  }
}
```

---

## 7. JWT 인증 Guard 예시

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException("토큰이 없다");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload; // 이후 요청에서 user 사용 가능
      return true;
    } catch {
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }
  }
}
```

---

## 8. 역할 기반 인가 Guard - Roles

```ts
// roles.decorator.ts
import { SetMetadata } from "@nestjs/common";
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

```ts
// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get("roles", context.getHandler());

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
```
