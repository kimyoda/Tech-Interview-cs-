# 🌐 PHP_Laravel 가이드

### 1-1. 기본개념 배경

- PHP는 웹 개발에 사용되ㅐ는 언어, 문제들이 발생한다.(단순 php로만 했을 땐)

#### 1.**Laravel의 철학**

1. Convention over Configuration
   - 개발자가 설정해야할 요소 최소화
   - 일관된 디렉토리 구조, 네이밍 규칙
2. Elegant Syntax
   - Eloquent ORM의 쿼리 문법
   - 쉬운 코드 작성
3. Developer Experience
   - Artisan CLI도구로 반복 작업 자동화
   - 디버깅 도구

#### 2. MVC 아키텍처의 원리

- Laravel은 MVC (Model - View - Controller)패턴을 기반으로 설계했다.

MVC 구조
HTTP Request → Routes → Controller → Model → Database
↓
View ← Controller ← Model Data
↓
HTTP Response

- Model: 데이터와 비즈니스 로직

```php
// app/Models/User.php
class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];

    // 비즈니스 로직
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
}
```

- View: 사용자 인터페이스

```php
<!-- resources/views/users/index.blade.php -->
@extends('layouts.app')

@section('content')
<div class="container">
    @foreach($users as $user)
        <div class="user-card">
            <h3>{{ $user->name }}</h3>
            <p>{{ $user->email }}</p>
        </div>
    @endforeach
</div>
@endsection
```

- Controller: 요청 처리 및 응답관리

```php
// app/Http/Controllers/UserController.php
class UserController extends Controller
{
    public function index()
    {
        $users = User::where('status', 'active')->get();
        return view('users.index', compact('users'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
        ]);

        User::create($request->all());
        return redirect()->route('users.index');
    }
}
```

#### 3. Eloquenet ORM - 데이터베이스 추상화 혁신

- Active Record 패넡
- Eloquenet는 Active Recoard 패턴을 구현하였다.

```php
// 전통적인 SQL 쿼리
$users = DB::select('SELECT * FROM users WHERE status = ? AND age > ?', ['active', 18]);

// Eloquent의 우아한 문법
$users = User::where('status', 'active')
            ->where('age', '>', 18)
            ->orderBy('created_at', 'desc')
            ->get();
```
