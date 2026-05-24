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

`nest-cli.json`의 `compilerOptions.plugins`에 플러그인을 추가한다.

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

### 5-2. 플러그인 옵션 전체 목록

| 옵션                       | 기본값                      | 설명                                                                              |
| -------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `dtoFileNameSuffix`        | `['.dto.ts', '.entity.ts']` | 플러그인이 분석할 DTO 파일 접미사                                                 |
| `controllerFileNameSuffix` | `.controller.ts`            | 플러그인이 분석할 컨트롤러 파일 접미사                                            |
| `classValidatorShim`       | `true`                      | `class-validator` 데코레이터를 Swagger 스키마에 반영 (예: `@Max(10)` → `max: 10`) |
| `dtoKeyOfComment`          | `'description'`             | 주석을 `ApiProperty`의 어느 키에 매핑할지 지정                                    |
| `controllerKeyOfComment`   | `'summary'`                 | 주석을 `ApiOperation`의 어느 키에 매핑할지 지정                                   |
| `introspectComments`       | `false`                     | JSDoc 주석에서 설명과 예시값 자동 추출 여부                                       |
| `skipAutoHttpCode`         | `false`                     | 컨트롤러에 `@HttpCode()` 자동 추가 비활성화 여부                                  |
| `esmCompatible`            | `false`                     | ESM(`"type": "module"`) 환경 구문 오류 해결 여부                                  |

> ⚠️ 플러그인 옵션을 변경한 뒤에는 반드시 `/dist` 폴더를 삭제하고 다시 빌드해야 새 설정이 반영된다.

```bash
rm -rf dist && npm run build
```

---

## 6. 플러그인 적용 후 DTO 작성

플러그인을 활성화하면 `@ApiProperty()` 없어도 타입 정의만으로 Swagger 문서가 자동 생성된다

```ts
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

플러그인이 TypeScript 타입을 분석해 아래 항목을 자동으로 처리한다

- `email: string` -> `@ApiProperty({ type: String })`
- `isEnabled?: boolean` -> `@ApiProperty({ required: false})`
- `roles: RoleEnum[] = []` -> `@ApiProperty({ enum: RoleEnum, isArray: true, default: [] })`

> 💡 `PartialType` 같은 mapped type 유틸리티를 DTO에서 사용할 경우, `@nestjs/mapped-types`가 아닌 반드시 `@nestjs/swagger`에서 import 해야 플러그인이 스키마를 올바르게 인식한다.

```ts
// 잘못된 예
import { PartialType } from "@nestjs/mapped-types";

// 올바른 예
import { PartialType } from "@nestjs/swagger";
```

---

## 7. class-validator 함께 사용

플러그인은 Swagger 문서 생성만 담당한다. 런타임 유효성 검증은 여전히 `class-validator` 데코레이터가 처리하여 함께 작성한다

```ts
import { IsEmail, IsOptional, IsEnum } from "class-validator";

export enum RoleEnum {
  ADMIN = "admin",
  USER = "user",
}

export class CreateUserDto {
  /**
   * 사용자 이메일
   * @example 'user@example.com'
   */
  @IsEmail()
  email: string;

  /**
   * 사용자 비밀번호
   * @example 'password123'
   */
  password: string;

  /**
   * 사용자 역할 목록
   * @example ['admin']
   */
  @IsEnum(RoleEnum, { each: true })
  roles: RoleEnum[] = [];

  /**
   * 활성화 여부
   * @example true
   */
  @IsOptional()
  isEnabled?: boolean = true;
}
```

`classValidatorShim: true` 옵션이 켜져 있으면 `@IsEmail()`, `@IsEnum()` 같은 class-validator 데코레이터도 Swagger 스키마에 자동 반영된다.

---

## 8. 주석 기반 자동 설명 생성 (introspectComments)

`introspectComments: true` 옵션을 활성화하면 JSDoc 주석에서 설명과 예시값을 자동으로 추출한다.

### 적용 전 - 설명과 예시를 중복 작성

```ts
/**
 * 사용자의 역할 목록
 * @example ['admin']
*/
@ApiProperty({
    description: '사용자의 역할 목록',
    example: ['admin'],
})
roles: RoleEnum[] = [];
```

### 적용 후 - 주석만으로 가능

```ts
/**
 * 사용자의 역할 목록
 * @example ['admin']
 */
roles: RoleEnum[] = [];
```

### 컨트롤러에도 동일하게 적용

```ts
@Controller("users")
export class UserController {
  /**
   * 사용자 생성
   *
   * @remarks 새로운 사용자를 생성합니다.
   * @deprecated
   * @throws {500} 서버 내부 오류
   * @throws {400} 잘못된 요청
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

  /**
   * 사용자 목록 조회
   */
  @Get()
  findAll() {
    return [];
  }
}
```

위 주석은 플러그인에 의해 아래처럼 자동 변환된다.

```typescript
@ApiOperation({
  summary: '사용자 생성',
  description: '새로운 사용자를 생성합니다.',
  deprecated: true,
})
```

---

## 9. SWC 빌더 사용 시 추가 설정

SWC 빌더를 사용하면 메타데이터를 별도로 생성, 로드해야 한다

### 일반 프로젝트

```bash
nest start -b swc --type-check
```

### 모노레포 프로젝트

```bash
npx ts-node src/generate-metadata.ts

# 또는
npx ts-node apps/{앱이름}/src/generate-metadata.ts
```

### main.ts에 메타데이터 로드 추가

```typescript
import metadata from "./metadata"; // PluginMetadataGenerator가 자동 생성한 파일

await SwaggerModule.loadPluginMetadata(metadata);
const document = SwaggerModule.createDocument(app, config);
```

---

## 10. ts-jest (e2e 테스트) 연동

`ts-jest`는 소스 파일을 메모리에서 바로 컴파일하기 때문에 Nest CLI 컴파일러를 사용하지 않아 플러그인이 적용되지 않는다. e2e 테스트 디렉토리에 아래 파일을 생성해 해결한다.

### 트랜스포머 파일 생성

```js
const transformer = require("@nestjs/swagger/plugin");

module.exports.name = "nestjs-swagger-transformer";
// 설정을 변경할 때마다 version 값을 올려야 jest가 변경을 감지한다
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/swagger/plugin 옵션 (비워도 됨)
    },
    cs.program, // Jest v27 이하에서는 cs.tsCompiler.program
  );
};
```

### jest 설정 파일에 트랜스포머 추가

**jest@29 이상**

```json
{
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": [""]
        }
      }
    ]
  }
}
```

**jest@29 미만**

```json
{
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": [""]
      }
    }
  }
}
```

---

## 11. jest 캐시 초기화

설정을 변경했는데 jest가 반영하지 않는 경우, 캐시를 초기화한다.

```bash
# 자동 캐시 초기화
npx jest --clearCache
```

자동 초기화가 안 되는 경우 수동으로 삭제한다.

```bash
# 캐시 디렉토리 위치 확인
npx jest --showConfig | grep cache

# 캐시 디렉토리 삭제
rm -rf
# 예시
rm -rf /tmp/jest_rs
```

---

## 12. 주의사항 정리

- 플러그인은 **Swagger 문서 생성 전용**이다. 런타임 유효성 검증은 `class-validator` 데코레이터(`@IsEmail()`, `@IsNumber()` 등)를 반드시 함께 사용해야 한다.
- DTO 파일명은 반드시 `.dto.ts` 또는 `.entity.ts` 접미사를 가져야 플러그인이 인식한다. 다른 접미사를 쓴다면 `dtoFileNameSuffix` 옵션으로 별도 지정해야 한다.
- 플러그인 설정 변경 후에는 반드시 `/dist` 폴더 삭제 후 재빌드해야 한다.
- `PartialType`은 반드시 `@nestjs/swagger`에서 import 해야 한다.
- 이 모든 설정은 **로컬 개발 및 테스트 환경** 기준이다. 운영 환경 적용 시 별도 검토가 필요하다.

---

## 13. 정리

NestJS Swagger CLI 플러그인을 도입하면 반복적인 `@ApiProperty()` 작성에서 벗어나 타입 정의와 주석만으로 API 문서를 자동 생성할 수 있다. 특히 팀 규모가 클수록, 프로젝트가 커질수록 그 효과가 크다.

코드와 문서가 항상 동기화되고, 주석을 충실히 작성하는 습관만으로 Swagger 문서 품질이 올라간다는 점에서 도입을 적극 권장한다.

| 구분            | 내용                                                   |
| --------------- | ------------------------------------------------------ |
| 설치            | `npm install @nestjs/swagger swagger-ui-express`       |
| 플러그인 활성화 | `nest-cli.json`의 `plugins`에 `@nestjs/swagger` 추가   |
| 핵심 옵션       | `classValidatorShim: true`, `introspectComments: true` |
| 주의사항        | 옵션 변경 시 `/dist` 삭제 후 재빌드 필수               |
| 런타임 검증     | `class-validator` 데코레이터 별도 유지 필수            |
