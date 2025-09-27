# 🌐 PHP_Laravel

## 1.PHP_Laravel 개념

### 1-1. 🐘 PHP 기본 특성 - "웹 개발의 든든한 동반자"

#### 🚀 PHP란 무엇인가?

- **PHP: Hypertext Preprocessor**: 서버 사이드 스크립트 언어
- **웹에 특화된 언어**: HTML과 자연스럽게 결합, 동적 웹 페이지 생성한다.
- 데이터를 받아 웹 페이지를 고객에게 제공한다.

#### 🔍 PHP의 핵심 특징

1. 서버사이드 실행

```php
   <?php
   // 서버에서 실행되고, 결과만 브라우저에 전송
   $currentTime = date('Y-m-d H:i:s');
   echo "현재 시간: " . $currentTime;
   // 클라이언트는 PHP 코드를 볼 수 없고, 결과만 받음
   ?>
```

2. 동적 타입 시스템(유연한 변수 처리)

```php
   $variable = "문자열";        // string
   $variable = 123;            // integer
   $variable = 12.34;          // float
   $variable = true;           // boolean
   $variable = ['a', 'b', 'c']; // array
   // 런타임에 타입이 결정됨
```

3. HTML 친화적

```php
   <html>
   <body>
       <h1><?php echo "동적으로 생성된 제목"; ?></h1>
       <p>사용자 이름: <?= $userName ?></p>
       <ul>
       <?php foreach($items as $item): ?>
           <li><?= $item ?></li>
       <?php endforeach; ?>
       </ul>
   </body>
   </html>
```

#### 🎯 PHP의 장점과 특징

- ✅ 장점들:
  - 빠른 학습 곡선: C와 유사한 문법으로 접근성이 좋다
  - 거대한 생태계: 수많은 라이브러리와 프레임워크
  - 호스팅 친화적: 대부분의 웹 호스팅에서 기본 지원

---

### 1-2. 🤝 PHP와 Laravel의 관계 - "왜 Laravel인가?"

#### 🔍 PHP 순수 개발 vs Laravel 프레임워크

**Laravel의 우아한 해결:**

```php
// routes/web.php
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);

// UserController.php
class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return view('users.index', compact('users'));
    }

    public function store(Request $request)
    {
        User::create($request->validated());
        return redirect('/users');
    }
}
```

#### 🎯 Laravel이 PHP에게 제공하는 가치

1. 개발 생산성 향상

```php
   // 순수 PHP - 데이터베이스 연결과 쿼리
   $pdo = new PDO('mysql:host=localhost;dbname=blog', $user, $pass);
   $stmt = $pdo->prepare('SELECT * FROM users WHERE active = ? ORDER BY created_at DESC');
   $stmt->execute([1]);
   $users = $stmt->fetchAll();

   // Laravel Eloquent - 한 줄로 해결
   $users = User::where('active', true)->latest()->get();
```

2. 보안 제공

```php
   // 순수 PHP - SQL Injection 위험
   $query = "SELECT * FROM users WHERE id = " . $_GET['id']; // 매우 위험!

   // Laravel - 자동 보안 처리
   $user = User::find($request->id); // 자동으로 파라미터 바인딩
```

3. 구조화된 코드 아키텍처

```php
   // Laravel의 체계적 구조
   app/
   ├── Http/Controllers/     # 비즈니스 로직
   ├── Models/              # 데이터 모델
   ├── Services/            # 서비스 레이어
   └── Repositories/        # 데이터 접근 레이어
```

---

### 1-3. 🏗️ Laravel Architecture - "웹 애플리케이션의 설계도"

#### 🔍 Laravel MVC 아키텍처의 진화

**전통적인 PHP 개발**:

```php
모든 코드가 한 파일에 섞여있음
├── HTML
├── PHP 로직
├── SQL 쿼리
└── CSS/JavaScript
```

**Laravel MVC 분리:**

```php
역할별 명확한 분리
├── Model (데이터 관리)
├── View (사용자 인터페이스)
├── Controller (요청 처리)
└── Route (URL 매핑)
```

#### 각 항목 특징

1. **Model**

```php
class User extends Model
   {
       // 데이터 검증 규칙
       protected $fillable = ['name', 'email'];

       // 비즈니스 로직
       public function getFullNameAttribute()
       {
           return $this->first_name . ' ' . $this->last_name;
       }

       // 관계 정의
       public function posts()
       {
           return $this->hasMany(Post::class);
       }
   }
```

2. **Controller**

```php
   class UserController extends Controller
   {
       public function store(UserRequest $request)
       {
           // 요청 검증은 UserRequest에서 처리
           // 비즈니스 로직은 Service로 위임
           $user = $this->userService->createUser($request->validated());

           return redirect()->route('users.show', $user)
                          ->with('success', '사용자가 생성되었습니다.');
       }
   }
```

3. **View(Blade)**

```php
   @extends('layouts.app')

   @section('content')
       <div class="container">
           @if(session('success'))
               <div class="alert alert-success">
                   {{ session('success') }}
               </div>
           @endif

           @foreach($users as $user)
               <div class="user-card">
                   <h3>{{ $user->full_name }}</h3>
                   <p>{{ $user->email }}</p>
               </div>
           @endforeach
       </div>
   @endsection
```

---

### 1-4. 🗃️ Eloquent ORM - "데이터베이스 마법사의 진화"

#### 🎯 Eloquent의 활용

```php
// Laravel Eloquent - 직관적이고 강력함
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// 사용법 - 자연어와 비슷함
$userWithPosts = User::with('posts')
                    ->where('active', true)
                    ->first();

// 관계 데이터 접근도 직관적
foreach ($userWithPosts->posts as $post) {
    echo $post->title;
}
```

#### 🔍 Eloquent의 고급 패턴들

1. 재사용 가능한 로직

```php
   class Post extends Model
   {
       public function scopePublished($query)
       {
           return $query->where('published_at', '<=', now());
       }

       public function scopeByAuthor($query, $authorId)
       {
           return $query->where('author_id', $authorId);
       }
   }

   // 조합 가능한 쿼리 빌딩
   $posts = Post::published()
               ->byAuthor($authorId)
               ->latest()
               ->paginate(10);
```

2. 데이터 변환

```php
 class User extends Model
   {
       // Mutator - 저장할 때 자동 변환
       public function setPasswordAttribute($value)
       {
           $this->attributes['password'] = bcrypt($value);
       }

       // Accessor - 조회할 때 자동 변환
       public function getFullNameAttribute()
       {
           return $this->first_name . ' ' . $this->last_name;
       }
   }

   // 사용 시 자동으로 처리됨
   $user = new User();
   $user->password = 'plain-text'; // 자동으로 암호화되어 저장
   echo $user->full_name;          // first_name + last_name 자동 결합

```

---

### 1-5. 🐳 Laravel Sail - "개발 환경 혁명"

#### 🚀 Laravel Sail

```yaml
# docker-compose.yml - 모든 팀원이 동일한 환경
services:
  laravel.test:
    image: sail-8.1/app
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      WWWUSER: "1000"
      LARAVEL_SAIL: 1
    volumes:
      - ".:/var/www/html"
    networks:
      - sail
    depends_on:
      - mysql
      - redis

  mysql:
    image: "mysql/mysql-server:8.0"
    environment:
      MYSQL_ROOT_PASSWORD: "password"
      MYSQL_DATABASE: "laravel"
    volumes:
      - "sail-mysql:/var/lib/mysql"
```
