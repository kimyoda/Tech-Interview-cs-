# 🌐 PHP*Laravel*프롬프트 예시

## 1. 프로젝트 개요

해당 프로젝트는 **Unity 3D 모바일 게임 클라이언트**와 통신하는 **NesjJS 기반 모바일 게임 백엔드 서버**이다.

주요 역할은 다음과 같다.

- 게임 API 요청 처리
- 유저 데이터 조회 및 갱신
- 랭킹 데이터 관리
- 마스터 데이터 캐싱
- 세션 및 공통 캐시 관리
- 운영툴과 연동되는 게임 콘텐츠 처리
- Swagger 기반 API문서 자동화(클라이언트 개발자, 기획 공유용)

---

## 2. 기술 스택

| 구분                      | 기술                             |
| ------------------------- | -------------------------------- |
| Framework                 | NestJS(최신 안정 버전)           |
| Runtime                   | Node.js 20 LTS                   |
| Language                  | TypeScript 5.x(strict mode)      |
| Database                  | MySQL 8.0 InnoDB                 |
| ORM                       | TypeORM                          |
| Cache / Session / Ranking | Redis                            |
| Infrastructure            | AWS EKS Production               |
| Local Developement        | Docker, docker-compose, OrbStack |
| Client                    | Unity3D Mobile Game              |

---

## 3. 핵심 실행 규칙

모든 명령어는 프로젝트 루트에서 실행한다.
Docker 환경을 사용하는 경우 `docker-compose exec app`을 접두어로 붙인다.

### 명령어 예시

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 전체 테스트 실행
npm run test

# 특정 테스트 실행
npm run test -- --testPathPattern={path}

# e2e 테스트 실행
npm run test:e2e

# 커버리지 확인
npm run test:cov
```

Docker 환경에서 실행하는 경우:

```bash
docker-compose exec app npm run start:dev
docker-compose exec app npm run test
```

---

## 4. 로컬 개발 명령어

로컬 환경 빌드 및 실행

```bash
docker-compose up -d --build
```

전체 테스트 실행

```bash
npm run test
```

특정 테스트 실행

```bash
npm run test -- --testPathPattern={path}
```

테스트용 최신 마스터 데이터 가져오기

```bash
./sync_master_fixtures.sh
```

---

## 5. Module-Controller-Service 패턴

프로젝트는 NestJS의 모듈 시스템을 기반으로 URI 규칙에 따라 Controller와 Service 클래스를 매핑한다.

```text
POST /api/cheering-ranking/get-data
```

컨트롤러 클래스는 다음 위치에 있어야 한다.

```text
src/cheering-ranking/cheering-ranking.controller.ts
```

모듈 구조는 다음과 같다.

```text
src/
└── cheering-ranking/
    ├── cheering-ranking.module.ts
    ├── cheering-ranking.controller.ts
    ├── cheering-ranking.service.ts
    ├── dto/
    │   ├── get-data.request.dto.ts
    │   └── get-data.response.dto.ts
    └── cheering-ranking.service.spec.ts
```

---

## 6. Controller 작성 규칙

모든 Controller 클래스는 NestJS의 `@Controller()` 데코레이터를 사용한다.

**Controller의 주요 이슈**
Controller는 API 요청의 진입점 역할을 한다.

- 요청 데이터 수신 및 DTO 유효성 검사
- 공통 요청 객체 확인
- ServiceLayer 호출
- 응답 객체 반환
- 비지니스 오류 처리
- 유저 액션 로그 기록

단, 복잡한 비지니스 로직은 Controller에 직접 작성하지 않고 ServiceLayer로 분리한다.

Controller 예시

```ts
@ApiTags("cheering-ranking")
@Controller("cheering-ranking")
export class CheeringRankingController {
  constructor(
    private readonly cheeringRankingService: CheeringRankingService,
    private readonly userLogger: UserLogger,
  ) {}

  @Post("get-data")
  @ApiOperation({ summary: "응원 랭킹 데이터 조회" })
  @ApiResponse({ status: 200, type: GetDataResponseDto })
  async getData(
    @CommonReq() commonRequest: CommonRequest,
    @Body() dto: GetDataRequestDto,
  ): Promise<GetDataResponseDto> {
    const result = await this.cheeringRankingService.getData(
      commonRequest,
      dto,
    );
    this.userLogger.log(commonRequest, UserAction.CHEERING_RANKING_GET_DATA);
    return result;
  }
}
```

---

## 7. ServiceLayer 규칙

비지니스 로직은 각 도메인 모듈의 Service 클래스에 작성한다.
도메인 별로 디렉터리를 나누어 관리한다.

```text
src/
├── mini/
│   ├── mini.module.ts
│   ├── mini.controller.ts
│   └── mini.service.ts
├── ranking/
│   ├── ranking.module.ts
│   ├── ranking.controller.ts
│   └── ranking.service.ts
├── cheering-ranking/
│   ├── cheering-ranking.module.ts
│   ├── cheering-ranking.controller.ts
│   └── cheering-ranking.service.ts
└── master/
    ├── master.module.ts
    └── master.service.ts
```

### ServiceLayer의 역할

Service는 실제 비즈니스 로직을 담당한다
다음과 같은 처리를 Service에서 수행한다.

- 유저데이터 조회
- 점수 계산
- 랭킹 등록
- 보상 지급
- 구매 가능 여부 검증
- 마스터 데이터 조회
- Redis 캐시 조회
- DB 저장 및 갱신

---

## 8. 의존성 주입 DI 규칙

NestJS의 DI 컨테이너를 적극 활용한다.
이를 통해 테스트하기 쉬운 구조를 만든다.
Controller가 직접 Repository나 Redis를 다루기 보다, Serivce를 주입받아 처리 흐름을 위임한다.

구조 예시

```text
Controller
  ↓
Service
  ↓
Repository / TypeORM Entity / Redis / MasterService
```

이 구조를 사용하면 다음 장점이 있다.

- Controller가 얇아진다
- 비지니스 로직 재사용이 가능하다
- 테스트 코드 작성이 쉬워진다(Jest Mock 처리 가능)
- 책임 분리가 명확해진다

---

## 9. Strict Typing & Modern TypeScript 규칙

TypeScript strict mode를 기준으로 엄격한 타입 사용을 권장한다.
tsconfig 핵심 설정

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictPropertyInitialization": true
  }
}
```

기본 규칙

- 파라미터 타입 명시(`any` 사용 금지)
- 리턴 타입 명시
- `interface`또는 `class`로 구조 명확하
- 가능하면 `readonly` 프로퍼티 사용
- 불필요한 동적 프로퍼티 사용 지양
- 배열 구조가 복잡한 경우 별도 타입 정의 사용

권장 방향

```text
명확한 타입
명확한 책임
명확한 응답 구조
테스트 가능한 설계
```

---

## 10. DTO & Response 규칙

요청 데이터는 `class-validator`를 사용한 DTO 클래스로 검증한다
응답 데이터는 Response DTO 클래스로 명확한게 정의한다.
모든 DTO에 반드시 `@ApiProperty()` 데코레이터를 함께 적용한다

Response 규칙

```text
src/{domain}/dto/{name}.response.dto.ts
```

응답 DTO는 API 응답의 최상위 구조를 담당한다.

Request 규칙

```text
src/{domain}/dto/{name}.request.dto.ts
```

DTO 작성 예시

```ts
// 요청 DTO
export class GetDataRequestDto {
  @ApiProperty({ description: "유저 ID", example: 12345 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: "시즌 코드", required: false })
  @IsString()
  @IsOptional()
  season?: string;
}

// 응답 DTO
export class GetDataResponseDto {
  @ApiProperty({ description: "유저 ID", example: 12345 })
  userId: number;

  @ApiProperty({ description: "랭킹 데이터", type: RankingDataDto })
  rankingData: RankingDataDto;
}
```

---

## 11. Camel Case / Snake Case 변환 규칙

TypeScript 클래스 내부에서 camelCase를 사용한다
클라이언트로 응답할 때 snake_case로 변환하여 내려보낸다.
변환은 `class-transformer`의 `@Expose()`, `@Transform()` 또는 글로벌 `ClassSerializerInterceptor`를 활용한다.

클래스 내부

```ts
buyPlayCountData: BuyPlayCountDto;
```

실제 API 응답

```json
{
  "buy_play_count_data": { ... }
}
```

개발자는 TypeScript 코드에서 camelCase를 유지하고, 응답에서 snake_case로 내려가는 구조다.

---

## 12. Exception Handing 규칙

비지니스 로직 오류는 기본 `Error`를 직접 사용하지 않고 프로젝트 공통 예외 클래스를 사용한다.

사용 클래스

```text
src/common/exceptions/custom.exception.ts
src/common/enums/error-code.enum.ts
```

사용 예시

```ts
throw new CustomException(ErrorCode.INSUFFICIENT_PLAY_COUNT);
```

사용 목적

- 에러 코드 일관성 유지
- 클라이언트 응답 코드 통일
- 운영 및 QA 단계에서 오류 추적 용이
- Swagger 문서와 에러 동기화

---

## 13 Logging 규칙

유저 액션 로그는 다음 Provider를 사용한다.

```text
src/common/helpers/user-logger.service.ts
```

로그 기록 대상 예시

- 미니게임 플레이 시작
- 미니게임 결과 저장
- 보상 지급
- 아이템 구매
- 교환소 사용
- 랭킹 등록
- 주요 콘텐츠 진입

로그는 추후 CS, 운영툴, 분석, 유저 이슈 확인에 활용 될 수 있으므로 중요한 유저 액션에 반드시 기록 여부를 검토한다.

---

## 14. 데이터베이스 규칙

여러 TypeORM DataSoruce(Connection)을 사용한다
연결은 다음과 같다.

| DataSource        | 용도          |
| ----------------- | ------------- |
| userDataSource    | 유저 데이터   |
| rankingDataSource | 랭킹 데이터   |
| manageDataSource  | 운영툴 데이터 |
| masterDataSource  | 마스터 데이터 |

Entity를 작성할 때 반드시 어떤 DataSource에 등록되는지 확인한다

---

## 15. Entity / DataSource 연결 규칙

Multi-DataSource 구조에서 Entity가 어떤 DB에 연결되는 지 매우 중요하다
예를 들어 유저 데이터 Entity는 `useDataSource`에 등록하고, 랭킹 데이터 Entity는 `rankingDataSource`에 등록해야한다.
잘못된 DataSource를 사용할 경우 다음 문제가 발생할수 있다.

- 테이블을 찾지 못함
- 다른 DB에 데이터가 저장된다
- 테스트 환경에서 Transaction이 적용되지 않는다
- 운영 데이터와 테스트 데이터가 섞인다
- 조회 결과가 예상과 다르게 나온다

DataSource 예시

```ts
export const userDataSource = new DataSource({
  name: "user",
  type: "mysql",
  entities: [UserEntity, UserItemEntity],
});
```

---

## 16. Migration 규칙

마이그레이션은 mgmt에서 관리한다

스키마 수정이 푤요한 경우 직접 마이그레이션을 추가하기 전 관리자 프로젝트와 관계를 확인해야 한다.

- API 서버 프로젝트에 임의로 스키마를 수정하지 않는다
- 운영툴과 공유되는 테이블인지 확인한다
- 마이그레이션 위치가 올바른지 확인한다
- 테스트 코드에서 필요한 테이블이 있는지 확인한다
- 운영 반영 순서를 확인한다

---
