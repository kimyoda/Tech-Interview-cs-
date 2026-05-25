# 🌐 NestJS — Exception Filters

> Nest의 예외 처리 ㄹ레이어를 이해하고 커스텀 에러 응답을 만드는 법

---

## 1. Exception Filter

Exception Filter는 애플리케이션에서 **처리되지 않은 예외를 잡아 클라이언트에 적절한 응답으로 반환**하는 컴포넌트다

> Nest는 기본 예외 레이어(Global Exception Filter)를 내장하고 있다
> 처리되지 않은 예외는 자동으로 잡혀 JSON 형태의 에러 응답으로 변환된다
> 커스텀 필터를 만들어 에러 응답 형태를 원하는 대로 바꿀 수 있다

> 💡 Filter는 **예외가 발생했을 때만** 동작한다.

---

## 2. Next 기본 예외 레이어

Nest는 별도 처리 없이 아래처럼 기본 에러 응답을 만들어준다.

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 3. HttpException

Nest에서 HTTP 에러를 던질 때는 `HttpException`을 사용한다

```ts
import { HttpException, HttpStatus } from "@nestjs/common";

throw new HttpException("권한이 없습니다.", HttpStatus.FORBIDDEN);
```

응답(예시):

```json
{
  "statusCode": 403,
  "message": "권한이 없습니다."
}
```

객체로도 전달할 수 있다

```ts
throw new HttpException(
  {
    statusCode: 403,
    message: "권한이 없다",
    error: "Forbidden",
  },
  HttpStatus.FORBIDDEN,
);
```

---

## 4. Built-in HTTP Exceptions

Nest는 자주 쓰는 에외 클래스를 미리 제공한다

| 클래스                         | 상태 코드 | 설명             |
| ------------------------------ | --------- | ---------------- |
| `BadRequestException`          | 400       | 잘못된 요청      |
| `UnauthorizedException`        | 401       | 인증 실패        |
| `ForbiddenException`           | 403       | 권한 없음        |
| `NotFoundException`            | 404       | 리소스 없음      |
| `ConflictException`            | 409       | 충돌 (중복 등)   |
| `UnprocessableEntityException` | 422       | 처리 불가 엔티티 |
| `InternalServerErrorException` | 500       | 서버 내부 오류   |
| `ServiceUnavailableException`  | 503       | 서비스 불가      |

```ts
import { NotFoundException } from "@nestjs/common";

throw new NotFoundException("유저를 찾을 수 없습니다.");
```

---

## 5. 커스텀 Exception Filter

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

응답 예시:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "유저를 찾을 수 없습니다.",
  "path": "/users/999",
  "timestamp": "2026-05-25T00:00:00.000Z"
}
```

---

## 6. 모든 예외를 잡는 커스텀 Filter

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch() // 인자 없이 사용하면 모든 예외를 잡음
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : "서버 내부 오류가 발생했습니다.";

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 7. Exception Fitler 적용

```ts
// 핸들러 단위
@UseFilters(HttpExceptionFilter)
@Get(':id')
findOne(@Param('id') id: string) {}

// 컨트롤러 단위
@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UserController {}

// 전역 적용 — main.ts
app.useGlobalFilters(new HttpExceptionFilter());

// 전역 적용 — 모듈에서 DI 포함
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

## 8. 커스텀 Exception 클래스

```ts
// business.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class BusinessException extends HttpException {
  constructor(message: string) {
    super(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message,
      }.HttpStatus.BAD_REQUEST,
    );
  }
}
```

```ts
throw new BusinessException("포인트가 부족합니다.");
```

---

## 9. 정리

| 항목            | 내용                                            |
| --------------- | ----------------------------------------------- |
| 역할            | 예외를 잡아 클라이언트에 적절한 응답으로 변환   |
| 실행 시점       | 예외가 발생했을 때만 동작                       |
| 핵심 인터페이스 | `ExceptionFilter`                               |
| 핵심 데코레이터 | `@Catch()`                                      |
| 기본 제공 예외  | `NotFoundException`, `UnauthorizedException` 등 |
| 적용 방법       | 핸들러 / 컨트롤러 / 전역                        |

> ⚠️ `@Catch()` 에 아무것도 넣지 않으면 모든 예외를 잡는다. 특정 예외만 처리하려면 `@Catch(HttpException)` 처럼 명시한다.
