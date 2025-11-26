## 2. ORM이란?

### 📌 ORM(Object-Relational Mapping)이란?

- ORM은 객체 지향 프로그래밍 언어와 관계형 데이터 베이스 사이의 데이터를 변환해주는 기술이다.

- ORM이 필요한 이유

  - 객체와 테이블의 패러다임 불일치를 해결한다. 객체지향 프로그래밍과 데이터베이스는 데이터를 다루는 방식이 다르다.
  - 생산성향상: SQL 쿼리를 직접 작성안하고 객체 메소드로 데이터를 다룬다.
  - 유지보수가 용이하다.
  - 데이터베이스 독립성: 특정 DB에 종속되지 않는다.

- ORM의 단점
  - 성능이슈: 복잡한 쿼리에서는 성능이 떨어진다.
  - 복잡한 쿼리 작성 어려움: 통계, 집계 등 복잡한 쿼리는 복잡하고 심도 깊은 quey문이 필요하다.

---

### 🌍 언어별 주요 ORM

**Node.js(TypeScript, JavaScript)**

1. TypeORM

- TypeORM은 TypeScript와 JavaScript를 위한 ORM으로, NestJS에서 많이 사용된다.
- 데코레이터 패턴을 사용해 모델 정의가 편하고, Active Record와 Data Mapper 패턴이 있다.

**장점**

- TypeScript 지원 및 데코레이터 기반 문법이있다.
- SQL과 NoSQL(MongoDB) 모두 지원한다.
- Active Record와 Data Mapper 패턴을 선택 가능하다.
- 다양한 데이터베이스 지원 (MySQL, PostgerSQL, SQLite 등)

**단점**

- 타입 안전성이 완벽하지 않아 "anyORM"이라는 이슈가 생길수도 있다.
- API 변경이 잦아 버전 간 호환성 이슈가 있을 수 있다.

```ts
@Entitiy()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMnay(() => Post, (post) => post.author)
  posts: Post[];
}
```

2. Sequelize

- Sequelize는 Node.js에서 오래된 ORM으로 많은 자료가 있다.
- Promise 기반 API를 제공, MySQL, PostgreSQL, SQLite, MSSQL 등 데이터베이스를 지원한다.
  **장점**
  - 풍부한 문서와 자료가 있다.
  - 안전성이 보장된다.
  - 트랜잭션, 관계, 마이그레이션 등 다양한 기능이 있다.

**단점**

- TypeScript 지원이 부족하다(JavaScript 기반으로 만들어졌다)
- 문법이 애매하다.
- TypeORM과 Prisma에 밀려 인기가 감소하는 추세다.

```js
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
});
```

3. Prisma

- 23년 기준 사용량이 많이 늘어난 차세대 ORM이다.
- 높은 추상화 수준을 제공하여 개발자 친화적인 기능을 가지고 있다.

**장점**

- 타입 안전성이 뛰어나 컴파일 타임에 에러 감지가 가능하다.
- Prisma Schema Language(SDL)을 통해 선언적 스키마를 정의한다.
- 자동 생성되는 타입 안전이다.
- 직관적이고 간결한 쿼리 문법이다.

**단점**

- TypeORM보다 쿼리 성능이 느릴 수 있다.
- 레퍼런스가 타 기능보다 적을 수 있다.

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

```ts
// 사용
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true },
});
```

### 📊 Node.js ORM 비교표

| 구분                | TypeORM   | Sequelize    | Prisma         |
| :------------------ | :-------- | :----------- | :------------- |
| **출시 시기**       | 2016년    | 2010년       | 2019년         |
| **TypeScript 지원** | 좋음      | 보통         | **매우 좋음**  |
| **타입 안전성**     | 보통      | 낮음         | **매우 높음**  |
| **러닝 커브**       | 중간      | 낮음         | 중간           |
| **커뮤니티**        | 크다      | 매우 크다    | 빠르게 성장 중 |
| **성능**            | 좋음      | 좋음         | 대부분 좋음    |
| **마이그레이션**    | 자동      | 수동         | 선언적         |
| **최근 인기도**     | 📊 안정적 | 📉 감소 추세 | 📈 **급상승**  |

---

**JPA(Java Persistence API) + hIBERNATE**

---

**PHP(Laravel-EloquentORM)**

---
