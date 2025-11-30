# 🌐 PHP Laravel Blade

### 📚 목차

1. [Blade란?](#)
2. [Laravel 운영툴](#)
3. [Blade 문법](#)
4. [TailwindCSS와 Blade](#)
5. [예시](#)

---

## 1.Blade 템플릿이란?

### 1-1. 기본개념

- Blade는 Laravel의 간결한 템플릿 엔진이다.
- PHP 기반 웹 애플리케이션에서 HTML을 동적으로 생성하기 위해 설계되었다.
- Blade 전용 지시어(@if, @foreach 등)을 통해 로직을 표현한다.
- 실제로 컴파일 기반 시스템이다.
- storage/framework/views 디렉토리에 저장되고, 프로덕션 환경에서 변경되지 않아 속도가 빠르다.
- React나 Vue같은 프론트엔드 프레임워크와도 함께 사용할 수 있다.
- 서버 사이드에 데이터를 동적으로 삽입, HTML을 생성한다. 파일은 resources/views 디렉토리에 저장, 컨트롤러에서 view()를 통해 반환된다.

### 💻 웹 개발:

---

**Controller(데이터) + Blade(템플릿) + Components(UI) = 완성된 페이지(HTML)**

### 1-2. Blade, 일반 PHP

- 일반 PHP방식:

```php
<!-- 복잡하고 읽기 어려움 -->
<?php if($user->isAdmin()): ?>
    <div class="admin-panel">
        <h1><?php echo htmlspecialchars($user->name); ?></h1>
        <?php foreach($users as $user): ?>
            <p><?php echo $user->email; ?></p>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
```

- Blade 방식:

```php
<!-- 깔끔하고 읽기 쉬움 -->
@if($user->isAdmin())
    <div class="admin-panel">
        <h1>{{ $user->name }}</h1>
        @foreach($users as $user)
            <p>{{ $user->email }}</p>
        @endforeach
    </div>
@endif
```

**주요 차이점:**

```
✅ Blade의 장점:
- 짧고 직관적인 문법 (@if, @foreach 등)
- 간결성: PHP 복잡한 구문을 피하고 ({{ }} 사용 시)를 하여 변수를 출력, HTML 이스케이프를 처리하여 자동 XSS 보호한다.
- 컴포넌트 재사용 가능: 컴포넌트와 슬롯을 통해 UI요소를 모듈화한다. DRY원칙을 따르고, 유지보수를 쉽게한다.
- 레이아웃 상속 지원: @extends, @yield를 통해 부모 템플릿을 상속받아 중복코드를 최소화한다.
- 통합: PHP 코드 컴파일되어 빠르고 Tailwind CSS, Alpine.js같은 현대적 도구와도 잘 어울린다.
```

- Laravel과 같이 사용된다.

### 1-3. .blade.php 파일 구조

```
📁 프로젝트 구조
────────────────────────────────────────

resources/views/
├── layouts/
│   └── app.blade.php              (전체 레이아웃)
├── components/
│   ├── button.blade.php           (재사용 버튼)
│   └── form-input.blade.php       (재사용 입력폼)
└── example/
    ├── index.blade.php            (목록 페이지)
    ├── create.blade.php           (생성 페이지)
    ├── show.blade.php             (상세 페이지)
    ├── edit.blade.php             (수정 페이지)
    └── form.blade.php             (공통 폼)
```

- HTML에 Blade 지시어를 섞어 작성한다. 디렉토리 구조는 모델 이름으로 구성한다.

---

## 2. Laravel 운영 툴 개발 워크플로우

### 2-1. 전체 개발 프로세스

```
🔄 운영 툴 만들기 4단계
────────────────────────────────────────

1️⃣ Migration 작성 (DB 테이블 설계)
   ↓
2️⃣ Migrate 명령 실행 (테이블 생성)
   ↓
3️⃣ CRUD 생성 명령 (MVC 자동 생성)
   ↓
4️⃣ 메뉴에 추가 (운영 툴에서 접근 가능)
```

### 2-2. 실제 명령어

```bash
# 1단계: Migration 파일 생성
sail artisan make:migration create_example_table

# 2단계: DB에 테이블 생성
sail artisan migrate

# 3단계: CRUD 전체 생성 (Controller, Model, View 한 번에)
sail artisan make:crud Example tailwind

# 결과:
# ✅ CardLevelExpController.php 생성
# ✅ CardLevelExp.php (Model) 생성
# ✅ index.blade.php, create.blade.php 등 View 생성
```

### 2-3. 왜 이런 구조인가?

```
🎯 운영 툴의 목적
────────────────────────────────────────

기획자/운영자가 직접 데이터를 관리할 수 있게한다!

예시:
❌ 개발자에게 요청: "레벨 3의 경험치를 200으로 바꿔주세요"
✅ 운영자가 직접: 클릭 몇 번으로 수정 완료!

필요한 기능:
- 목록 보기 (index)
- 추가하기 (create)
- 상세 보기 (show)
- 수정하기 (edit)
- 삭제하기 (delete)
```

---

## 3.Blade 문법

### 3-1. 데이터 출력

```php
<!-- 기본 출력 (XSS 보호) -->
<h1>{{ $user->name }}</h1>
<!-- 결과: <h1>홍길동</h1> -->

<!-- HTML 그대로 출력 (위험!) -->
<div>{!! $htmlContent !!}</div>

<!-- 변수가 없을 때 기본값 -->
<p>{{ $description ?? '설명이 없습니다' }}</p>
```

예시:

```php
<!-- 카드 레벨 표시 -->
<div>
    <span>레벨: {{ $cardLevelExp->level }}</span>
    <span>경험치: {{ $cardLevelExp->exp }}</span>
</div>
```

### 3-2. 조건문

```php
@if($user->isAdmin())
    <button>관리자 메뉴</button>
@elseif($user->isPremium())
    <button>프리미엄 기능</button>
@else
    <button>기본 기능</button>
@endif

<!-- 간단한 조건 -->
@auth
    <p>로그인됨</p>
@endauth

@guest
    <a href="/login">로그인하세요</a>
@endguest
```

### 3-3. 반복문

```php
<!-- foreach 반복 -->
@foreach($products as $product)
    <div>{{ $product->name }}</div>
@endforeach

<!-- 비어있을 때 처리 -->
@forelse($items as $item)
    <li>{{ $item->name }}</li>
@empty
    <li>아이템이 없습니다</li>
@endforelse

<!-- 루프 변수 활용 -->
@foreach($users as $user)
    <div class="{{ $loop->even ? 'bg-gray-100' : 'bg-white' }}">
        {{ $loop->iteration }}. {{ $user->name }}
    </div>
@endforeach
```

### 3-4.컴포넌트와 슬롯

```php
<!-- 레이아웃 사용 -->
<x-app-layout>
    <x-slot name="header">
        <h2>페이지 제목</h2>
    </x-slot>

    <div>페이지 내용</div>
</x-app-layout>

<!-- 버튼 컴포넌트 사용 -->
<x-default-button href="/back">
    {{ __('Back') }}
</x-default-button>
```

- 컴포넌트 작동원리:

```text
📦 x-app-layout 컴포넌트
────────────────────────────────────────

resources/views/components/app-layout.blade.php:

<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <nav>네비게이션</nav>

    <header>
        {{ $header }} <!-- slot 내용 들어감 -->
    </header>

    <main>
        {{ $slot }} <!-- 기본 내용 들어감 -->
    </main>
</body>
</html>
```

### 3-5. 폼 처리

```php
<form method="POST" action="{{ route('card-level-exps.store') }}">
    @csrf <!-- CSRF 토큰 (보안) -->

    <input type="text" name="level" value="{{ old('level') }}">

    <!-- 유효성 검사 에러 표시 -->
    @error('level')
        <span class="text-red-500">{{ $message }}</span>
    @enderror

    <button type="submit">저장</button>
</form>
```

---

## 4. Tailwind CSS와 Blade 조합

### 4-1. Tailwind CSS는?

- 유틸리티 우선(Utility-First) CSS 프레임워크다.

```text
❌ 전통적 방식:
<style>
.my-button {
    background-color: blue;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
}
</style>
<button class="my-button">클릭</button>

✅ Tailwind 방식:
<button class="bg-blue-500 text-white px-4 py-2 rounded">
    클릭
</button>

장점:
- CSS 파일 작성 불필요
- 클래스만으로 스타일 완성
- 일관된 디자인 시스템
```

### 4-2. 자주 쓰는 Tailwind 클래스

```php
<!-- 레이아웃 -->
<div class="flex justify-between items-center">
    <!-- flex: flexbox 사용 -->
    <!-- justify-between: 양 끝 정렬 -->
    <!-- items-center: 세로 중앙 정렬 -->
</div>

<!-- 간격 -->
<div class="mt-4 p-8 space-y-6">
    <!-- mt-4: margin-top: 1rem -->
    <!-- p-8: padding: 2rem -->
    <!-- space-y-6: 자식들 사이 간격 -->
</div>

<!-- 색상 -->
<div class="bg-white text-gray-900 border border-gray-200">
    <!-- bg-white: 흰색 배경 -->
    <!-- text-gray-900: 진한 회색 텍스트 -->
    <!-- border: 테두리 -->
</div>

<!-- 크기 -->
<div class="w-full max-w-xl h-screen">
    <!-- w-full: width: 100% -->
    <!-- max-w-xl: 최대 너비 제한 -->
    <!-- h-screen: height: 100vh -->
</div>

<!-- 반응형 -->
<div class="block sm:flex lg:grid">
    <!-- block: 기본은 block -->
    <!-- sm:flex: 작은 화면부터 flex -->
    <!-- lg:grid: 큰 화면에서 grid -->
</div>
```

### 4-3. 헤더부분

```php
<div class="sm:flex sm:items-center justify-between">
    <!--
    sm:flex: 작은 화면 이상에서 flexbox
    sm:items-center: 세로 중앙 정렬
    justify-between: 좌우 끝 정렬

    결과: [제목    버튼] 형태로 배치
    -->

    <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">
            <!--
            text-base: 기본 폰트 크기
            font-semibold: 약간 굵게
            leading-6: 줄 간격
            text-gray-900: 진한 회색
            -->
            Create Card Level Exp
        </h1>

        <p class="mt-2 text-sm text-gray-700">
            <!--
            mt-2: 위 여백 0.5rem
            text-sm: 작은 글씨
            text-gray-700: 중간 회색
            -->
            Add a new Card Level Exp.
        </p>
    </div>

    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <!--
        mt-4: 모바일에서 위 여백
        sm:ml-16: 작은 화면 이상에서 왼쪽 여백
        sm:mt-0: 작은 화면 이상에서 위 여백 제거
        -->
        <x-default-button href="{{ route('card-level-exps.index') }}">
            Back
        </x-default-button>
    </div>
</div>
```

- 테이블 부분:

```php
<div class="flow-root">
    <!-- flow-root: float 요소 포함 -->

    <div class="mt-8 overflow-x-auto">
        <!--
        mt-8: 위 여백 2rem
        overflow-x-auto: 가로 스크롤 가능
        모바일에서 테이블 넘칠 때 대응
        -->

        <div class="inline-block min-w-full py-2 align-middle">
            <!--
            inline-block: 인라인 블록
            min-w-full: 최소 너비 100%
            py-2: 위아래 패딩
            align-middle: 세로 중앙 정렬
            -->

            <table class="min-w-full divide-y divide-gray-300">
                <!--
                min-w-full: 최소 너비 100%
                divide-y: 가로 구분선
                divide-gray-300: 구분선 색상
                -->
                <thead>...</thead>
                <tbody>...</tbody>
            </table>
        </div>
    </div>
</div>
```

---

5. 실전:CRUD 운영툴 구축
