# NestJS Swagger CLI 플러그인 — 한글 번역 및 구현 가이드

> TypeScript AST 기반 자동 문서화로 반복 코드를 줄이는 법

---

## 들어가며

NestJS로 API를 개발하다 보면 Swagger 문서화를 위해 DTO마다 `@ApiProperty()`를 일일이 작성해야 하는 번거로움이 생긴다. 프로젝트 규모가 커질수록 이 작업은 점점 더 장황해지고, 타입 정의와 데코레이터가 중복되어 유지보수도 어려워진다.

NestJS Swagger CLI 플러그인은 이 문제를 컴파일 타임에 해결해준다. TypeScript AST를 분석해 필요한 데코레이터를 자동으로 삽입하기 때문에, 개발자는 타입 정의와 주석만 충실히 작성하면 된다.

이 글에서는 Swagger의 기본 개념부터 시작해 CLI 플러그인 설치, 세팅, 실제 활용 팁까지 단계별로 정리한다.

---

## 1. Swagger란?

Swagger(공식 명칭) REST API를 문서화 하는 표준 스펙이다. API의 엔드포인트, 요청/응답 형식, 인증 방식 등을 JSON 또는 YAML 형식으로 정의하며, Swagger UI를 통해 브라우저에서 직접 API를 테스트할 수 있는 인터랙티브한 문서를 제공한다.

### Swagger를 사용 하는 이유

- 프론트 엔드, QA팀 혹은 기획팀과 API 스펙에 관한 내용을 명확하게 공유할 수 있다
- 별도의 API 문서를 따로 작성하지 않아도 코드에서 자동으로 문서가 생성된다
- Swagger UI의 Try it out 기능을 통해 문서 화면에서 바로 API 요청과 응답을 확인할 수 있으므로, 간단한 API 동작 확인은 Postman 없이도 가능하다
- 코드와 문서가 항상 동기화되어 문서 최신화 문제를 줄일 수 있다

---

## 2. @nestjs/swagger 패키지 설치

```bash
npm install @nestjs/swagger swagger-ui-express
```

---

## 3. main.ts 기본 설정

설치 후 `main.ts`에 Swagger 모듈을 초기화한다

```ts
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("API 문서")
    .setDescription("API에 대한 설명을 작성합니다.")
    .setVersion("1.0")
    .addTag("users")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

서버 실행 후 `http://localhost:3000/api-docs`에 접속하면 Swagger UI를 확인할 수 있다

---

## 4. 플러그인 없이 DTO를 작성한다면?

플러그인 없이 Swagger 문서를 제대로 만들려면 DTO마다 아래처럼 데코레이터를 직접 작성해야 한다

```ts
export class CreateUserDto {
    @ApiProperty()
    eamil: string;

    @ApiProperty()
    password: string;

    @ApiProperty({ enum: RoleEnum, default: [], isArray: true})
    roles: RoleEnum[] : [];

    @ApiProperty( {required: false, default: true})
    isEnabled?: boolean = true;
}
```

프로퍼티가 늘어날수록 `@ApiProperty()` 반복 자성이 늘어나고, 타입과 데코레이터 간 불일치가 생기기도 쉽다.

---

## 5. CLI 플러그인 활성화

### 5-1. nest-cli.json 설정
