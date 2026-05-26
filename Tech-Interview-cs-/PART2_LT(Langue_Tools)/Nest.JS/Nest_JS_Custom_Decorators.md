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
