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
- 자동 XSS 보호 ({{ }} 사용 시)
- 컴포넌트 재사용 가능
- 레이아웃 상속 지원
- PHP 코드 컴파일되어 빠름
```

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
