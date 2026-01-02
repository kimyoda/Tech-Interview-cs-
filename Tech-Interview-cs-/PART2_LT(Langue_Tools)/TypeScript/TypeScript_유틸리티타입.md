# 🌐 TypeScrpt 유틸리티 타입

- 유틸리티 타입을 맵드 타입 기반, 조건부 타입 기반으로 분류하고 기존 타입을 유연하게 변형해 타입 안전성을 높여준다.
- Partial, Require 등 외에 추가 타입을 포함하여 포괄적으로 다룰 예정이다.

---

## 1 맵드 타입 기반 유틸리티 타입

- 맵드 타입은 객체의 속성을 순회, 변환하는 방식으로 작동한다.

### 1-1. Partial<T> - 선택적 속성으로 만들기

#### 기본동작

- `Partial<Type>`은 주어진 타입의 모든 속성을 선택적(optional)로 만든다. 상태 업데이트나 부분 데이터 전달 시 필수 필드를 강제하지 않을 때 사용한다.
- 맵드 타입을 활용해 각 키를 순회하여 `?`를 붙여 optional로 변환한다.

```ts
type Partial<T> = {
  [key in keyof T]?: T[key]; // keyof T로 키를 순회, ?로 optional처리
};
```

- 예시

```ts
interface User {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

function useUpdateTodo() {
  const updateTodo = (id: number, filedsToUpdate: Partial<Todo>) => {
    // 기존 Todo에 filedsToUpdate 병합
    console.log(`Updating todo ${id} with:`, fieldsToUpdate);
  };
  return { updateTodo };
}

updateTodo(1, { description: "새 설명" });
```

- Partial이 모든 속성을 optional로 만든다고 나온다.

```ts
const draft: Pratial<Post> = { title: "제목", content: "초안!" };
```

### 1-2. Required<T> - 모든 속성을 필수로 만들기

#### 기본동작

- `Required<Type>` 모든 속성을 필수(required)로 변환한다.
- 데이터가 완전해야하는 함수 사용 권장

```ts
type Required<T> = {
  [key in keyof T]-?: T[key]; // -?로 optional을 필수로 강제
};
```

- 데이터가 완전해야 하는 함수에서 사용을 권장한다.
- 예시

```ts
inferface User {
  id: string;
  name?: string;
  emial?: string;
};

function UserCard(props: Required<User>) {
  return (
    <div>
      <strong>{props.name}</strong> - {props.email}
    </div>
  );
};

// 에러 name과 eamil이 필수
const user: User = { id: '1'};
// 컴파일오류
```

- 다른예시

```ts
const withThumbnailPost: Required<Post> = {
  title: "...",
  tags: ["ts"],
  content: "",
  thumbnailURL: "https://...",
};
```

### 1-3. Readonly<T> - 변경 불가능한 타입

#### 기본동작

- `Readonly<Type>` 은 타입의 모든 속성을 **읽기 전용(readonly)**로 만들어 수정할 수 없게 한다.
- 예시

```ts
interface Config {
  apiUrl: string;
  timeout: number;
}

const config: Readonly<Config> = {
  apiUrl: "/api",
  timeout: 3000,
};

// config.timeout = 5000; 오류
```

- typescriptlang.org/docs/handbook/utility-types.html#readonlytype.

### 1-4. Record<K, V> - 키/값 매핑 타입 만들기

#### 기본동작

- `Record<Keys, Type>`은 키 집합과 값 타입으로 객체를 만든다.
- 예시

```ts
const roleDescriptions: Record<'ADMIN' | 'USER' | 'GUEST', string> = {
  ADMIN: '모든 권한',
  USER: '일반 권한',
  GUEST: '읽기 전용,
};
```

- 상수 맵이나 다국어 지원에서 키-값 쌍을 타입 안전하게 관리한다.
- 참고: typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type.

### 1-4. Pick<T, K> - 필요한 필드만 선택

#### 기본동작

- `Pick<Type, Keys>` 는 지정한 속성만 추출한다.
- 예시

```ts
interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

type TodoListItem = Pick<Todo, "id" | "title" | "completed" | "createdAt">;

function TodoListItemRow(props: TodoListItem) {
  return <li>{props.title}</li>;
}
```

- 참고문서: typescriptlang.org/docs/handbook/utility-types.html#picktype-keys.

### 1-5. Omit<T, K> - 특정 필드 제거하기

#### 기본동작

- `Omit<Type, Keys>`는 지정한 속성을 제외한다.
- 예시

```ts
type CreateTodoInput = Omit<Todo, "id" | "createdAt">;

const form: CreateTodoInput = { title: "", description: "" };
```

---

## 2. 조건부 타입 기반 유틸리티 타입

- 조건부 타입은 타입 조건에 따라 분기, 유니언이나 함수 타입을 다룰때 좋다.
- NonNullable, Parameters, Awaited 등을 추가로 얘기한다.

### 2-1. Exclude<T, U> - 제외하고 싶은 필터링

#### 기본동작

- `Exclude<UnionType, ExcludedMembers>` 유니온에서 특정 타입을 제거한다.
- 예시

```ts
type NonString = Exclude<string | number | boolean, string>;
```
