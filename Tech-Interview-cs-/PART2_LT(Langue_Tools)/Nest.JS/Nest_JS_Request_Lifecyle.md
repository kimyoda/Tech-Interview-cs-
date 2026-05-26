# 🌐 NestJS — Request Lifecycle

> 요청이 들어와서 응답이 나가기전까지의 흐름을 정리

---

## 1. Request Lifecycle

NestJS에서 HTTP 요청이 들어오면 여러 컴포넌트를 순서대로 거쳐 응답이 만들어진다.
이 흐름을 **Request Lifecycle**이라고 한다.

공식 문서 기준 순서 :

```
Incoming Request
      ↓
  Middleware
      ↓
    Guards
      ↓
  Interceptors (요청 전)
      ↓
  Controller
      ↓
   Service
      ↓
  Interceptors (응답 후)
      ↓
Exception Filters (에외 발생 시)
      ↓
  Response
```

---

## 2. 각 컴포넌트 역할 한눈에 보기

| 순서 | 컴포넌트         | 역할                              | 실행 조건            |
| ---- | ---------------- | --------------------------------- | -------------------- |
| 1    | Middleware       | 요청 전처리, 로깅, 공통 헤더 처리 | 항상 실행            |
| 2    | Guard            | 인증 / 인가 판단                  | 항상 실행            |
| 3    | Interceptor (전) | 요청 전 로직 (타이머 시작, 로깅)  | 항상 실행            |
| 4    | Pipe             | 입력값 반환 \ 유효성 검사         | 항상 실행            |
| 5    | Controller       | 라우팅, 요청 처리                 | 앞 단계 통과 시      |
| 6    | Service          | 비지니스 로직                     | 컨트롤러에서 호출 시 |
| 7    | Interceptor (후) | 응답 변환, 캐싱, 로깅             | 핸들러 실행 후       |
| 8    | Exception Filter | 예외를 응답으로 변환              | 예외 발생 시만       |

---

## 3. 단계별 상세 설명

### 3-1. Middleware

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${req.method}] ${req.url}`);
    next(); // 반드시 호출해야 다음 단계로 진행
  }
}
```

- Express 미들웨어와 동일한 개념
- `next()`를 호출하지 않으면 요청이 거기서 멈춘다
- 어떤 핸들러가 실행될 지 알 수 없다(라우트 정보 없음)

---

### 3-2. Guard

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return Boolean(request.user);
  }
}
```

- `false` 반환 또는 예외 발생 시 요청 차단
- `ExecutionContext`로 핸들러 정보를 알 수 있다
- 인증 / 인가에 특화

---

### 3-3. Interceptor (요청 전)

```ts
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable {
    const start = Date.now();
    console.log('핸들러 실행 전');

    return next.handle().pipe(
      top(() => console.log('핸들러 실행 후 - ${Date.now() - start}ms`)),
    );
  }
}
```

- `next.handle()` 호출 전이 요청 전 처리
- `next.handle()` 이후 pipe 안이 응답 후 처리

---

### 3-4. Pipe

```ts
@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string) {
    const result = parseInt(value, 10);
    if (isNaN(result)) {
      throw new BadRequestException('숫자여야 한다.');
    }
    return result;
  }
```

- 입력값을 원하는 타입으로 변환
- 유효성 검사 실패 시 예외를 던져 요청 차단
- `class-validator` + `ValidationPipe`가 가장 많이 쓰인다

---

### 3-5. Controller -> Service

```ts
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id); // Service에 위임
  }
}
```

- Controller는 라우팅과 요청 처리
- 비즈니스 로직은 Service에 위임

---

### 3-6. Interceptor (응답 후)

```ts
return next.handle().pipe(
  map((data) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  })),
);
```

- 핸들러가 반환한 값을 가공한다
- 클라이언트에 전달되기 전 최종 응답 변환

---

### 3-7. Exception Filter

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception.message,
    });
  }
}
```

- 예외가 발생했을 때 동작
- 예외를 잡아 클라이언트에 적절한 응답으로 변환

---

## 4. 전역 / 컨트롤러 / 라우트 레벨 순서

NestJS에서 동일한 컴포넌트가 여러 레벨에 적용되어 실행 순서는 아래와 같다

### Guard 실행 순서

```
전역 Guard -> 컨트롤러 Guard -> 라우트 Guard
```

### Interceptor 실행 순서 (요청 전)

```
전역 Interceptor -> 컨트롤러 Interceptor -> 라우트 Interceptor
```

### Interceptor 실행 순서 (응답 후)

```
라우트 Interceptor -> 컨트롤러 Interceptor -> 전역 Interceptor
```

응답 후 처리는 요청 전 처리의 **역순**으로 실행된다

### Pipe 실행

```
전역 Pipe -> 컨트롤러 Pipe -> 라우트 Pipe -> 파라미터 Pipe
```

### Exception Filter 실행 순서

```
라우트 Filter -> 컨트롤러 Filter -> 전역 Filter
```

예외 필터는 **가장 가까운 레벨**부터 처리한다

---

## 5. 저체 흐름 예시 - 회원 조회 API

```
GET /user/1 요청 -> Authorization: Bearer {token}

1. Middleware - 요청 로깅: [GET] / users/1
2. Guard - JwtAuthGuard: 토큰 검증 -> request.user 세팅
3. Interceptor 전 - 타이머 시작, 요청 로깅
4. Pipe           — ParseIntPipe: '1' → 1 (숫자 변환)
5. Controller     — findOne(1) 호출
6. Service        — DB에서 id=1 유저 조회
7. Interceptor 후 — 응답을 { success: true, data: {...} } 형태로 변환
8. Response       — 200 OK 응답 전송
```

예외 발생 시:

```
4. Pipe    — 'abc' 입력 → ParseIntPipe가 BadRequestException 던짐
8. Filter  — HttpExceptionFilter가 잡아 { success: false, statusCode: 400 } 응답 반환
```

---
