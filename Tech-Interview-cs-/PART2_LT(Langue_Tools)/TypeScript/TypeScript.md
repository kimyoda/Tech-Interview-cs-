# 🌐 TypeScrpt 기초개념

## 1.TypeScript란?

### 1-1. TypeScript란?

- **TypeScript**는 Microsoft에서 개발한 JavaScript의 상위집합 언어이다.
- JavaScript에 정적 타입 시스템을 추가해서 컴파일 타임에 오류를 미리 발견할 수 있고, 코드의 가독성과 유지보수성을 크게 향상시킨다.
- JavaScript로 컴파일이 된다.

---

## 2. TypeScript와 JavaScript의 차이점은??

- **JavaScript**: 동적 타입 언어, 런타임에서 타입 오류가 발생한다.
- **TypeScript**: 정적 타입 언어, 컴파일 시점에 타입 오류가 발생한다.
- **타입 안전성**: TypeScript는 변수, 함수, 객체의 타입을 명시적으로 정의한다.
- **편의성**: 자동 완성 기능, 타입 추론이 가능해 개발 생산성을 높이고 유지 보수성을 개선한다.

---

## 3. 기본 타입 시스템

### 2-1. TypeScript 기본 타입들은?

- **원시 타입** : `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`,
- **배열** : `number[]` 또는 `Array<number>`
- **튜플** : `[string, number]` - 고정된 길이와 타입의 배열
- **객체** : `{ name: string; age: number}`
- **함수** : `(x: number, y: number) => number`
- **any** : 모든 타입을 허용(타입 검사 비활성화)
- **unknown** : 타입 안전한 any, 사용 전 타입 검사 필요
- **void** : 반환값이 없는 함수의 반환 타입
- **never** : 절대 발생하지 않는 타입

---

### 2-2 프로바이더(Provider)란?

- 프로바이더는 의존성 주입이 가능한 클래스이다. `@Injectable()`데코레이터가 붙은 서비스, 레포지토리, 팩토리, 헬퍼 등이 될 수 있다. NestJSIoC 컨테이너에 의해 관리하고, 생성자를 통해 다른 클래스에 주입된다.

---

## 3. 데코레이터

### 3-1. 주요 데코레이터와 역할을 설명해라.

- `@Module()`: 모듈을 정의하고 imports, controllers, providers 등을 설정한다.
- `@Controller()` : HTTP 엔드포인트를 처리하는 클래스를 정의한다.
- `@Injectable()`:의존성 주입 가능한 프로바이더로 마킹한다.
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`: HTTP 메서드를 매핑한다.

### 3-2. `@Injectable()` 데코레이터의 역할?

- `@Injectable()` 데코레이터는 클래스가 의존성 주입 시스템에 참여할 수 있도록 메타데이터를 추가한다.
- 데코레이터가 있어야 NestJS IoC 컨테이너가 해당 클래스의 인스턴스를 생성하고 다른 클래스에 주입할 수 있다.

---

## 4. 모듈 시스템

### 4-1. 모듈이란?

- 모듈은 `@Module()` 데코레이터로 장식된 클래스, 애플리케이션 구조를 조직화한다. imports(다른 모듈 가져오기), controllers(컨트롤러 등록), providers(프로바이더 등록), exports(다른 모듈에 사용할 수 있도록 내보내기)속성을 가진다.

### 4-2. 전역모듈과 기능 모듈의 차이

- **기능 모듈**: 특정 기능에 관련된 컨트롤러와 서비스들을 그룹화
- **전역 모듈**: `@Global()` 데코레이터가 붙은 모듈, 한번 import 하면 애플리케이션 전체에서 사용이 가능하다.
- **공유 모듈**: exports 배열을 통해 다른 모듈에서 재사용할 수 있는 모듈

## 6. 요청 처리 흐름

### 6-1. HTTP 요청이 NestJS 처리

1. 미들웨어: 요청 전처리(로깅, CORS 등)
2. 가드(Guards): 인증 / 인가 검사
3. 인터셉터(Before)L 요처 데이터 변형
4. 파이프(Pipes): 데이터 검증 및 변환
5. 컨트롤러 핸들러: 실제 비즈니스 로직을 실행
6. 인터셉터(After): 응답 데이터 변형함
7. 필터(Exception Filters): 예외처리
8. 응답 반환

---

## 7. 파이프(Pipes)

### 파이프란?

- 파이프는 데이터 검증과 변환을 담당하는 컴포넌트다.
- 컨트롤러 핸들러가 실행되기 전 입력 데이터를 처리한다.
- 내장 파이프로 `ValidationPipe`, `ParseIntPipe` 등이 있다.
- DTO와 class-validator를 함께 사용해 자동 검증이 가능하다.

---

## 8. DTO(Data Transfer Object)란?

- **DTO**는 계층 간 데이터 전송을 위한 객체이다.
- TypeScript 타입 안정성을 제공, class-validator 데코레이터와 함께 사용해 입력 데이터 검증을 자동화할 수 있다.
- API 문서화와 런타임 검증을 동시에 제공한다.

## 9. 기본 설정 및 환경변수

### 9.1 NestJS에서 환경변수를 어떻게 처리하나

- `@nestjs/config` 패키지를 사용해 환경변수를 관리한다.
- ConfigModule을 루트 모듈에 import하고, ConfigService를 주입받아 환경변수에 접근할 수 있다.
- .envㅠㅏ일과 validate 함수를 통해 환경변수 검증도 가능하다.
