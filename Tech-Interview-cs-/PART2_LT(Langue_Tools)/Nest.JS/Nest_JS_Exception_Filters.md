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
