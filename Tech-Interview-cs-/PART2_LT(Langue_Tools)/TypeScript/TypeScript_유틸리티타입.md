# 🌐 TypeScrpt 유틸리티 타입

- 유틸리티 타입을 맵드 타입 기반, 조건부 타입 기반으로 분류하고 기존 타입을 유연하게 변형해 타입 안전성을 높여준다.
- Partial, Require 등 외에 추가 타입을 포함하여 포괄적으로 다룰 예정이다.

---

## 1 맵드 타입 기반 유틸리티 타입

- 맵드 타입은 객체의 속성을 순회, 변환하는 방식으로 작동한다.

### 1-1. Partial<T> - 선택적 속성으로 만들기

#### 기본동작

- `Partial<Type>`은 주어진 타입의 모든 속성을 선택적(optional)로 만든다. 상태 업데이트나 부분 데이터 전달 시 필수 필드를 강제하지 않을 때 사용한다.

- 예시\

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
