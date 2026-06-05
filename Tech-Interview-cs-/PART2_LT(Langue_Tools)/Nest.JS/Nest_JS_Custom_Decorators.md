# 🌐 NestJS — Custom Decorators

> 반복되는 요청 데이터 추출을 줄이고 재사용 가능한 데코레이터 만들기

---

## 1. Custom Decorator란?

Custom Decorator는 반복되는 요청 데이터 추출 로직을 데코레이터로 캡슐화 해 재사용할 수 있게 만드는 기능이다

컨트롤러마다 아래처럼 `req.user`를 꺼내는 코드가 반복되면

```ts
@Get('profile')
getProfile(@Req() req: Request) {
  const user = req.user; //
  return user;
}
```

Custom Decorator를 사용하면 아래처럼 간결하게 쓸 수 있다

```ts
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}
```

---

## 2. createParamDecorator

파라미터 데코레이터를 만드는 Nest 내장 함수다

```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 파라미터 설명

| 파라미터 | 설명                                                        |
| -------- | ----------------------------------------------------------- |
| `data`   | 데코레이터 호출 시 전달한 인자 (예: `@User('id')`의 `'id'`) |
| `ctx`    | ExecutionContext — 현재 요청 컨텍스트                       |

---

## 3. @User() 데코레이터 - 전체 user 반환

```ts
// user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: unknown, ctx: ExceutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

```ts
// 컨트롤러에서 사용
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}
```

---

## 4. @User('id') 데코레이터 - 특정 필드만 반환

```ts
// user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: keyof UserEntity, ctx: ExceutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // data가 있으면 해당 필드만 반환, 없으면 전체 반환
    return data ? user?.[data] : user;
  },
);
```

```ts
// 전체 user 반환
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}

// id만 반환
@Get('me')
getMe(@User('id') userId: number) {
  return userId;
}

// email만 반환
@Get('email')
getEmgail(@User('email') email: string) {
  return email;
}
```

## 5. @Token() 데코레이터 - 헤더에서 토큰

```ts
// token.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Token = createParamDecorator(
  (data: unknown, ctx: ExeuctionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headres["authorization"];
    return authHeader?.replace("Bearer ", "") ?? null;
  },
);
```

```ts
// 컨트롤러에서 사용
@Get('token-info')
getTokenInfo(@Token() token: string) {
  return token;
}
```

---

## 6. @Ip() 데코레이터 - 클라이언트 IP 추출

```ts
// clinet-ip.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-forwarded-for"] || request.socket.remoteAddress;
  },
);
```

```ts
@Get('log')
logAccess(@ClientIp() ip: string) {
  console.log('접속 IP:', ip);
}
```

---

## 7. Guard, Custom Decorator

Custom Decorator는 Guard와 함께 사용하면 메타데이터 기반 권한 처리로 확장한다.

```ts
// roles.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```ts
// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
```

```ts
// 컨트롤러에서 사용
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
remove(@Param('id') id: string, @User () user: UserEntity) {
  return `${user.name}이 ${id}번 데이터를 삭제했습니다.`;
}
```

---

## 9. ValidationPipe와 사용 시 주의

Custom Decorator로 추출한 값이 `ValidationPipe`를 적용하려면 `@UsePipes()`를 함꼐 사용

```ts
@Get('profile')
getProfile(
  @User () user: UserEntity,
  // ValidationPipe는 Body, Query, Param에 주로 적용
) {
  return user;
}
```

---

## 9. 정리

| 항목            | 내용                                                 |
| --------------- | ---------------------------------------------------- |
| 역할            | 반복되는 요청 데이터 추출 로직을 데코레이터로 캡슐화 |
| 핵심 함수       | `createParamDecorator`                               |
| `data` 파라미터 | 데코레이터 호출 시 전달한 인자                       |
| `ctx` 파라미터  | `ExecutionContext` — 요청 컨텍스트                   |
| 확장성          | Guard + `SetMetadata`와 결합해 권한 처리로 확장 가능 |
| 주요 활용       | `@User()`, `@Token()`, `@ClientIp()`, `@Roles()` 등  |

> 💡 Custom Decorator는 컨트롤러 코드를 간결하게 만들고, 요청 데이터 추출 로직을 한 곳에 모아 유지보수를 쉽게 만든다
