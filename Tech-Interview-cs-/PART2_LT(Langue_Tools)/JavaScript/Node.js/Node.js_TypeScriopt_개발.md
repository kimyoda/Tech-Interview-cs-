# TypeScript로 Node.js 개발하기

---

## TypeSciprt를 쓰는 이유

JavaScript 한계

```js
// JavaScript — 에러를 런타임에 발견
function calculateDiscount(price, rate) {
  return price * rate; // rate가 undefined면?
}

calculateDiscount(10000);
// → NaN ... 화면엔 아무것도 안 보임
// 배포 후에야 발견. 고객이 먼저 경험함
```

```ts
// TypeScript — 에러를 코드 작성 시점에 발견
function calculateDiscount(price: number, rate: number): number {
  return price * rate;
}

calculateDiscount(10000);
// TS 컴파일 에러: Expected 2 arguments, but got 1.
// → IDE에서 바로 빨간 줄로 표시됨. 배포 전에 차단!
```

### 설계와 타입 안전성

TypeScript는 자바스크립트의 도적 특성으로 인해 발생할 수 있는 타입 고나련 오류를 코드 작성 단계 및 컴파일 단계에서 잡아낼 수 있다.
함수와 매개변수와 반환 타입을 명확히 지정하면, 잘못된 타입을 전달하는 경우 컴파일러가 즉시 오류를 알려준다
타입 체크는 라이브러리 사용 시에도 안전성을 높여주고, API 호출 방식이나 객체 구조를 문서 없이도 파악을 용이하게 해준다.

### 협업과 개발 생산성

TypeScript의 타입 시스템은 코드가 곧 문서가 되어, 함수의 입력과 출력이 명확하게 드러난다.
IDE의 자동 완성 기능은 타입 정보에 기반하여 정확한 속성과 메서드를 제안하여 생산성을 높인다. 타입 정보는 리팩토링 시 잠재적 오류를 알려 주며, 큰 규모의 코드베이스에도 안전하게 구조를 변경할 수 있다.

---

## TypeScript가 주는 이점

런타임 에러 -> 컴파일 타임 에러로 이동(배포 후 발견 -> 코딩 중 발견)
자동완성 향상 -> IDE가 속성/메서드를 정확히 제안(`.`을 찍으면 사용 가능한 것들이 나온다)
리팩토링 안전성 -> 변경 사항의 영향 범위를 즉시 파악 (함수 파라미터 타입이 바꾸면 영향받는 곳이 전부 드러난다)
문서 역할 -> 타입 자체가 코드의 명세서
팀 협업 -> 해당 함수에 대한 인식이 빨라진다.

---

## 17.1 타입스크립트 기본 문법

### 환경 세팅

```bash
# 프로젝트 초기화
mkdir my-ts-api && cd my-ts-api
npm init -y

# TypeScript 관련 패키지 설치
npm install --save-dev typescript ts-node ts-node-dev @types/node

# tsconfig.json 생성
npx tsc --init

# 개발 실행 (파일 변경 시 자동 재시작)
npx ts-node-dev --respawn --transpile-only src/index.ts

# 빌드 (배포용 JS로 컴파일)
npx tsc
```

```
실행 흐름
────────────────────────────────────────────
개발 중: .ts 파일 → ts-node-dev → 메모리에서 직접 실행
배포 시: .ts 파일 → tsc → .js 파일 → node로 실행
```

---

## 타입 선언 기초

### 기본 타입

```ts
// ────────────────────────────────────────
// 원시 타입 (Primitive Types)
// ────────────────────────────────────────
const username: string = "Kim";
const age: number = 25;
const isAdmin: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// TypeScript는 대부분 타입을 추론할 수 있다
const city = "Seoul"; // string으로 자동 추출
const score = 100; // number로 자동 추론
const active = true; // boolean으로 자동 추론

// ────────────────────────────────────────
// 배열 (Array)
// ────────────────────────────────────────
const scores: number[] = [100, 90, 85, 70];
const names: string[] = ["Kim", "Lee", "Park"];
const flags: boolean[] = [true, false, true];

// 제네릭 방식도 동일
const scores2: Array<number> = [100, 90, 85];

// ────────────────────────────────────────
// 튜플 (Tuple) — 길이와 각 위치 타입이 고정
// ────────────────────────────────────────
const point: [number, number] = [37.655, 126.978]; // 위도, 경도
const entry: [string, number] = ["score", 100]; // [키, 값]

// ────────────────────────────────────────
// 객체
// ────────────────────────────────────────
// 인라인 타입 (간단한 경우)
const user: { name: string; age: number; email?: string } = {
  name: "Kim",
  age: 25,
  // email은 선택적이라 없어도 됨
};
```

### 함수 타입

```ts
// ────────────────────────────────────────
// 기본 함수 타입 선언
// ────────────────────────────────────────

// 일반 함수
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 반환 타입은 대부분 추론 가능 - 간단한 경우 생략 가능
const subtract = (a: number, b: number) => a - b; // number로 추론

// ────────────────────────────────────────
// 선택적 매개변수 (?)
// ────────────────────────────────────────
function greate(name: string, greeting?: string): string {
  return `${greeting ?? 'Hello'}, ${name}!`;
  // ?? (Nullish Coalescing): null이나 undefined면 오른쪽 값 사용
}

greet('Kim'); // 'Hello, Kim!'
greet('Kim', 'Hi'); // 'Hi, Kim!'

// ────────────────────────────────────────
// 기본값 매개변수
// ────────────────────────────────────────
function createUser(name: string, role: string = 'user', age: number = 0) {
  return {name, role, age };
}

createUser('Kim');                    // { name: 'Kim', role: 'user', age: 0 }
createUser('Lee', 'admin');           // { name: 'Lee', role: 'admin', age: 0 }
createUser('Park', 'user', 30);      // { name: 'Park', role: 'user', age: 30 }

// ────────────────────────────────────────
// 나머지 매개변수 (Rest Parameters)
// ────────────────────────────────────────
function sunAll(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}

sumAll(1, 2, 3); // 6
sumAll(1, 2, 3, 4, 5); // 15

// ────────────────────────────────────────
// void — 반환값이 없는 함수
// ────────────────────────────────────────
function logMessage(msg: string): void {
  console.log(`[LOG] ${msg}`);
  // return 생략
}

// ────────────────────────────────────────
// never — 절대 정상 반환하지 않는 함수
// ────────────────────────────────────────
function throwError(message: string): never {
  throw new Error(message); // 예외 발생
}

function infiniteLoop(): never {
  whiel (true) {
    // 무한 루프s
  }
}
```

### any, unknown, never

```ts
// ────────────────────────────────────────
// any — TypeScript를 끄는 스위치 (
// ────────────────────────────────────────
let anything: any = "hello";
anything = 42; // ok
anything = { foo: "bar" }; // ok
anything.foo.bar.baz; // OK

// any는 타입 검사를 완전히 무력화
// 레거시 JS를 TS로 점진 마이그레이션할 때 임시로만 사용

// ────────────────────────────────────────
// unknown — any의 안전한 대안
// ────────────────────────────────────────
let value: unknown = "hello";
// value.toUpperCase(); // 컴파일 에러, 타입을 먼저 확인

// 타입 가드로 좁힌 후 사용
if (typeof value === "string") {
  value.toUpperCase(); // string이 확정된 후 사용 가능
}

// API 응답, JSON.parse 결과 등 타입을 모를 때 unknown 사용
async function fetchData(url: string): Promise<unknown> {
  const response = await fetch(url);
  return response.json(); // 타입을 몰라 unknown
}

const data = await fetchData("/api/users");
if (Array.isArray(data)) {
  console.log(data.length);
}

// ────────────────────────────────────────
// never — "이 코드는 절대 실행되지 않아야 해"
// ────────────────────────────────────────

// 활용 1: 완전성 검사 (Exhaustive Check)
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 5 * 5;
    case "square":
      return 5 * 5;
    case "triangle":
      return (5 * 5) / 2;
    default:
      // Shape에 새 타입이 추가됐는데 여기 처리 안 하면 컴파일 에러!
      const _exhaustive: never = shape;
      throw new Error(`처리되지 않은 도형: ${_exhaustive}`);
  }
}
// → 나중에 'pentagon'을 추가하면 자동으로 에러 표시
```

### 인터페이스, 타입 별칭

```ts
// ────────────────────────────────────────
// Interface — 객체 구조 정의에 최적화
// ────────────────────────────────────────

interface User {
  id: number;
  name: string;
  emial: string;
  createdAt: Date;
}

// 선택적 속성 (?)
interface CreateUserDto {
  name: string;
  emial: string;
  age?: number;
  bio: string;
}

// 읽기 전용
interface AppConfig {
  readonly apiKey: string; // 한 번 설정 후 변경불가
  readonly baseUrl: string;
}

// 확잗 (extends)
interface AdminUser extends User {
  role: 'admin' | 'superadmin';
  permissions: string[];
  lastLoginAt?: Date;
}

// 인터페이스 다중 확장
interface SuperAdmin extends AdminUser {
  canDeleteSystem: boolean;
}

// 인덱스 시그니쳐 - 동적 키
interface StringMap {
  [key: string]: string;
}
const headers: StringMap = {
  'Content-Type': 'application/json';
  'Authorization': 'Bearer token',
  // 어떤 string 키든 추가 가능
}

// 함수 인터페이스
interface Validator {
  (value: string): boolean;
}
const isEmail: Validator = (value) => value.includes('@');

// ────────────────────────────────────────
// Type Alias — 더 유연한 타입 정의
// ────────────────────────────────────────

// 원시 타입에 이름 붙이기
type UserId = number;
type Email = string;
type Username = string;

// 유니온 타입
type Status = 'active' | 'inactive' | 'banned' | 'pending';
type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;
type Direction = 'up' | 'down' | 'left' | 'right';

// 튜플 타입
type Point = [number, number];
type RGB = [number, number, number];

// 함수 타입
type RequestHandelr = (req: Request, res: Response, next: NextFunction) => void;
type AsyncHandler = (req: Request, res: Response) => Promise<void>;

// 교차 타입 (여러 타입 합치기)
type Timestamped = { createdAt: Date; updatedAt: Date};
type SoftDeletable = { deletedAt: Date | null};
type BaseEntity = Timestamped & SoftDeletable;

// 조건부 타입
type InString<T> = T extends string ? 'yes' : 'no';
type Result1 = IsString<string>; // 'yes'
type Result2 = IsString<number>; // 'no'
```

#### Interface, Type 차이

| 상황                    | 권장        | 이유                           |
| ----------------------- | ----------- | ------------------------------ |
| 객체/클래스 구조 정의   | `interface` | `extends`로 확장하기 쉽다      |
| 라이브러리 타입 확장    | `interface` | Declaration Merging을 지원한다 |
| 유니언, 튜플, 원시 타입 | `type`      | `interface`로 표현할 수 없다   |
| 조건부/맵드 타입        | `type`      | `type`에서만 지원한다          |
| 일반적인 경우           | 팀 컨벤션   | 코드 통일성이 중요하다         |

```ts
// Interface 좋은 점: Declaration Merging (선언 합치기)
// 같은 이름으로 여러 번 선언하면 자동으로 병합
interface Animal {
  name: string;
}
interface Animal {
  age: number;
}
// -> Animal = { name: string; age: number} 로 합쳐진다

// Type은 중복 선언 불가
type Animal = { name: string };
type Animal = { age: number }; // Error
```

---

## 제네릭

> 제네릭(Generic) = 타입을 나중에 결정하는 문법 (타입의 변수)

```ts
// ────────────────────────────────────────
// 제네릭 없이 — 타입마다 함수를 따로 만들어야 함
// ────────────────────────────────────────
function getFirstNumber(arr: number[]): number {
  return arr[0];
}

function getFirstString(arr: string[]): string {
  return arr[0];
}

function getFristBoolean(arr: boolean[]): boolan {
  return arr[0];
}
// -> 같은 로직인데 타입만 다른 함수가 늘어난다

// ────────────────────────────────────────
// 제네릭 없이 — 타입마다 함수를 따로 만들어야 함
// ────────────────────────────────────────
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

// T는 나중에 결정될 타입을 나타내는 변수, 호출 시 T가 무엇인지 결정된다
getFirst<number>([1, 2, 3]); // 반환: number
getFirst<string>(['a', 'b']); // 반환: string
getFirst([true, false]); // 타입 추론 boolean

자주 쓰는 제네릭 패턴
// ────────────────────────────────────────
// 패턴 1: API 응답 래퍼
// ────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// 단건 응답
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, name: 'Kim', email: 'kim@example.com'},
  timestamp: new Date().toISOString(),
};

// 목록 응답
const usersResponse: ApiResponse<User []> = {
  success: true,
  data: [{ id: 1, name: 'Kim', email: 'kim@example.com'}],
  timestamp: new Date().toISOString(),
};

// 페이지네이션 응답
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ────────────────────────────────────────
// 패턴 2: 제네릭 제약 (extends)
// ────────────────────────────────────────
interface HasId {
  id: number;
}

// T는 반드시 id 속성을 가져야 한다
function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

const users = [
  { id: 1, name: 'Kim', age: 25},
  { id: 2, name: 'Lee', age: 30},
];

const found = findById(users, 1); // User 타입으로 반환
// findById([1, 2, 3], 1); // 에러, number는 id 속성이 없다

// ────────────────────────────────────────
// 패턴 3: 제네릭 기본값
// ────────────────────────────────────────
interface Pagination<t = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// T 지정 안 하면 unknown이 기본값
const unknownPage: Pagination = { items: [], total: 0, page: 1, limit: 10};

// T 지정 시
const userPage: Pagination<User> = { items: [], total: 0, page: 1, limit: 10};

// ────────────────────────────────────────
// 패턴 4: Repository 패턴
// ────────────────────────────────────────
interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: { page?: number; lmit?: number}): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  count(): Promise<number>;
}

interface UserEntity {
  id: number;
  name: string;
  email: string;
  createdAt: Date,
  updatedAt: Date;
}

class UserRepository implements Repository<UserEntity> {
  async findById(id: number): Promise<UserEntity | null> {
    // DB 조회 로직
    return null;
  }
async findAll() {
  return [];
}
async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updated'>) {
  return {
    ...data, id: 1, createdAt: new Date(), updatedAt: new Date()
  };
}
async update(id: number, data: Partial<UserEntity>) {
  return {

  } as UserEntity;
}
async delete(id: number) {

}
async count() {
  return 0;
}
}
```

---

## 유니언 & 인터 섹션

```ts
// ────────────────────────────────────────
// 유니언 (|) — "A 또는 B"
// ────────────────────────────────────────
type StringOrNumber = string | number;
type Status = "success" | "error" | "loading" | "idle";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// 실용적인 예시
function formatValue(value: string | number): string {
  if (typeof value === "number") {
    return value.toLocalString(); // 1000 -> '1,000'
  }
  return value.trim(); // ' hello ' -> 'hello'
}

// 판별 유니온
interface LoadingState {
  status: "loading";
}
interface SuccessState {
  status: "success";
  data: User[];
}

interface ErrorState {
  status: "error";
  error: string;
}

type FetchState = LoadingState | SuccessState | ErrorState;

function renderState(state: FetchState) {
  switch (state.status) {
    case "loading":
      return "로딩 중...";
    case "success":
      return `${state.data.length}명의 유저`; // data 접근
    case "error":
      return `에러: ${state.error}`; // error
  }
}

// ────────────────────────────────────────
// 인터섹션 (&) — "A이면서 B"
// ────────────────────────────────────────
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeleteable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

// 두 인터페이스를 합침
type BaseEntity = Timestamped & SoftDeletable;

// 모든 DB dpsxlxldp wjrdyd
interface UserEntity extends BaseEntity {
  id: number;
  name: string;
  email: string;
}

// UserEntity = {id, name, email, createAt, updatedAt, deletedAt, isDeleted }
```

---

## 타입 가드

런타임에 타입을 좁혀나가는 방법이다. 코드 흐름을 분석해 타입을 좁힌다.

```ts
// ────────────────────────────────────────
// 1. typeof — 원시 타입 검사
// ────────────────────────────────────────
function processInput(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  } else if (typeof value === "number") {
    return value.toFixed(2); // number
  } else {
    return value ? "YES" : "NO"; // boolean
  }
}

// ────────────────────────────────────────
// 2. instanceof — 클래스/생성자 검사
// ────────────────────────────────────────
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function handleError(err: Error) {
  if (err instanceof ApiError) {
    // ApiError 확정
    console.error(`[API ${err.statusCode}] ${err.message}`);
  } else if (err instanceof ValidationError) {
    // ValidationError 확정
    console.error(`[Validation] ${err.filed}: ${err.message}`);
  } else {
    console.error(`[Unknown] ${err.message}`);
  }
}

// ────────────────────────────────────────
// 3. in 연산자 — 속성 존재 확인
// ────────────────────────────────────────
interface Cat {
  meow(): void;
  purr(): void;
}

interface Dog {
  bark(): void;
  fetch(): void;
}

function makeSound(animal: Cat | Dog) {
  if ("meow" in animal) {
    animal.meow(); // Cat 확정
    animal.purr();
  } else {
    animal.bark(); // Dog 확정
    animal.fetch();
  }
}

// ────────────────────────────────────────
// 4. 사용자 정의 타입 가드 (is)
// ────────────────────────────────────────
interface SuccessResponse {
  success: true;
  data: User;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: number;
}

type ApiResult = SuccessResponse | ErrorResponse;

// 반환 타입 'result is SuccessResponse' → 이 함수가 true를 반환하면 타입 좁힘
function isSuccessResponse(result: ApiResult): result is SuccessResponse {
  return result.success === true;
}

async function fetchUser(id: number): Promise<void> {
  const result: ApiResult = await api.get(`/users/${id}`);

  if (isSuccessResponse(result)) {
    console.log(result.data.name); // SuccessResponse
  } else {
    console.error(`[${result.code}] ${result.error}`); // ErrorResponse
  }
}

// ────────────────────────────────────────
// 5. Truthiness 좁히기
// ────────────────────────────────────────
function printLength(value: string | null | undefined) {
  if (value) {
    // value가 truthy → null, undefined, '' 제외
    console.log(value.length); // ✅ string 확정
  } else {
    console.log("값이 없습니다");
  }
}
```

---

## 유틸리티 타입

TypeScript 내장 유틸리티 타입들이다. 실무에서 자주 사용한다

```ts
// 기준 인터페이스
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
  age: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────
// Partial<T> — 모든 속성을 선택적으로
// ────────────────────────────────────────
type UpdateUserDto = Partial<User>;
// = {id?: number; name?: string; emial?: string; ...}

app.patch(
  "/users/id",
  async (req: Request<{ id: string }, {}, UpdateUserDto>, res) => {
    const updated = await UserService.update(req.params.id, req.body);
    res.json(updated);
  },
);

// ────────────────────────────────────────
// Required<T> — 모든 속성을 필수로
// ────────────────────────────────────────
type StrictUser = Required<User>;
// bio?: string -> bio: string

// ────────────────────────────────────────
// Pick<T, K> — 특정 속성만 선택
// ────────────────────────────────────────
// API 응답에서 민감한 정보 제외
type UserProfile = Pick<User, "id" | "name" | "email" | "role">;
// password, createdAt 제외

type UserSummary = Pick<User, "id" | "name">;
// 목록 조회 시 최소한의 정보

// ────────────────────────────────────────
// Omit<T, K> — 특정 속성 제외
// ────────────────────────────────────────
// DB에 저장 시 id와 시간 필드는 자동 생성
type CreateUserDto = Omit<User, "id" | "createdAAt" | "updatedAt">;

// 비밀번호 필드 제외 응답 타입
type UserResponse = Omit<User, "password">;

// ────────────────────────────────────────
// Readonly<T> — 모든 속성을 읽기 전용으로
// ────────────────────────────────────────
type ImutableUser = Readonly<User>;

const frozenUser: ImutableUser = { ...someUser };
// frozenUser.name = 'Lee'; // 읽기 전용

// ────────────────────────────────────────
// Record<K, V> — 키-값 맵 타입
// ────────────────────────────────────────

// 권한 테이블
type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
const permissions: RolePermissions = {
  admin: ["read", "write", "delete", "manage"],
  user: ["read", "write"],
  guset: ["read"],
};

// 에러 코드 맵
type ErrorMessages = Record<number, string>;
const HTTP_ERRORS: ErrorMessages = {
  400: "잘못된 요청",
  401: "인증이 필요하다",
  403: "권한이 없다",
  404: "리소스를 찾을 수 없다",
  500: "서버 내부 오류",
};

// ────────────────────────────────────────
// Exclude<T, U> — 유니언에서 타입 제거
// Extract<T, U> — 유니언에서 타입만 추출
// NonNullable<T> — null/undefined 제거
// ────────────────────────────────────────
type AllStatus =
  | "active"
  | "inactive"
  | "banned"
  | "pending"
  | null
  | undefined;

type ActiveStatus = Exclude<AllStauts, null | undefined | "banned">;

typeBanStatus = Extract<AllStatus, "banned" | "inactive">;

type SafeStatu = NonNullable<AllStatus>;

// ────────────────────────────────────────
// ReturnType<T> — 함수 반환 타입 추출
// Parameters<T> — 함수 매개변수 타입 추출
// ────────────────────────────────────────
async function getUserById(id: number) {
  return { id, name: "Kim", emial: "kim@example.com", createdAt: new Date() };
}

// 함수 반환 타입을 자동으로 추출 (타입 중복 안해도 됨)
type GetUserResult = Awaited<ReturnType<typeof getUserById>>;

function createUserHandler(name: string, email: string, role: string) {}
type CreateUserArgs = Parameters<typeof createUserHandler>;
```

Pick, Omit, Partial은 DTO를 설계할 때 중요하다.
DB Entity로 Create/Update/Response DTO를 만들 수 있어 타입 중복 없이 코드를 유지할 수 있다.

## 열거형 (Enum)

```ts
// ────────────────────────────────────────
// 숫자 열거형 (자동 증가)
// ────────────────────────────────────────
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

console.log(Direction.Up);
console.log(Direction[0]);

// ────────────────────────────────────────
// 문자열 열거형 (실무에서 더 권장)
// 값이 명확해서 디버깅 시 유리
// ────────────────────────────────────────
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST',
  Moderator = 'MODERATOR',
}

// DB에 저장할 때도 'ADMIN' 같은 문자열로 저장, 가독성이 좋다
interface UserEntitiy {
  id: number;
  role: UserRole;
}

const user: UserEntity = { id: 1, role: UserRole.Admin};
console.log(user.role); // 'ADMIN'


// ────────────────────────────────────────
// const enum — 성능 최적화
// 컴파일 시 enum 참조가 값으로 인라인됨
// ────────────────────────────────────────
const enum HttpStatus {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerError = 500,
}

res.status(HttpStatus.OK).json(data);
// 컴파일 후 : res.status(200).json(data);
// 런타임에 enum 객체가 남지 않아 번들 크기 감소

// ────────────────────────────────────────
// Enum 대신 as const 패턴 (최근 트렌드)
// ────────────────────────────────────────
// Enum은 JS로 컴파일 시 IIFE 코드가 생성됨
// as const 패턴은 더 가볍고 JS와의 호환성이 좋음
const UserRole2 = {
  Admin: 'ADMIN',
  User: 'USER',
  Guest: 'GUEST',
  Moderator: 'MODERATOR',
} as const;

// 타입을 사용
type UserRole2 = typeof UserRole2(keyof typeof UserRole2);

// 갑 사용
const role = UserRole2.Admin;
tsconfig.json 설정
{
  "compilerOptions": {
    // ────────────────────────────────
    // 타겟 환경
    // ────────────────────────────────
    "target": "ES2020",
    // 출력되는 JS 버전 (ES2020이면 async/await 그대로 출력)
    // Node.js 14+ 사용 시 ES2020 권장

    "module": "commonjs",
    // Node.js 환경 = commonjs
    // ESM 사용 시 "esnext" + "type": "module" in package.json

    "lib": ["ES2020"],
    // 사용 가능한 내장 타입 라이브러리 (Array, Promise, Map 등)

    // ────────────────────────────────
    // 경로 설정
    // ────────────────────────────────
    "rootDir": "./src",
    // TypeScript 소스 파일 루트 폴더

    "outDir": "./dist",
    // 컴파일된 JS 파일 출력 폴더

    // ────────────────────────────────
    // 타입 안전성
    // ────────────────────────────────
    "strict": true,
    // 아래 옵션들을 한 번에 활성화 (강력 추천!)
    // - noImplicitAny: true    → any 자동 부여 금지
    // - strictNullChecks: true → null/undefined 엄격 처리
    // - strictFunctionTypes    → 함수 타입 엄격 검사
    // - strictPropertyInitialization → 클래스 속성 초기화 필수

    "noImplicitReturns": true,
    // 모든 코드 경로에서 반환값이 있어야 함

    "noUnusedLocals": true,
    // 선언했지만 사용하지 않는 변수 에러

    "noUnusedParameters": true,
    // 사용하지 않는 함수 매개변수 에러

    // ────────────────────────────────
    // 모듈 해석
    // ────────────────────────────────
    "moduleResolution": "node",
    // Node.js 방식으로 모듈 경로 해석 (node_modules 탐색)

    "esModuleInterop": true,
    // CommonJS 모듈을 ES 모듈처럼 default import 가능
    // import express from 'express' (없으면 import * as express from 'express' 해야함)

    "allowSyntheticDefaultImports": true,
    // esModuleInterop과 함께 사용

    // ────────────────────────────────
    // 경로 별칭 (선택)
    // ────────────────────────────────
    "baseUrl": ".",
    "paths": {
      "@/*":          ["src/*"],           // import X from '@/utils/X'
      "@types/*":     ["src/types/*"],     // import X from '@types/X'
      "@controllers/*": ["src/controllers/*"]
    },

    // ────────────────────────────────
    // 기타 유용한 옵션
    // ────────────────────────────────
    "sourceMap": true,
    // .map 파일 생성 → 디버깅 시 TS 소스 코드 직접 확인 가능

    "declaration": true,
    // .d.ts 파일 생성 (라이브러리를 npm에 배포할 때 필요)

    "skipLibCheck": true,
    // node_modules의 타입 검사 생략 → 빌드 속도 향상

    "resolveJsonModule": true,
    // JSON 파일 import 가능
    // import config from './config.json' → 타입도 자동 추론!

    "experimentalDecorators": true,
    // 데코레이터 문법 활성화 (NestJS, TypeORM 필수)

    "emitDecoratorMetadata": true
    // 데코레이터 메타데이터 (NestJS DI 시스템에 필요)
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

## 커뮤니티 타입 정의
