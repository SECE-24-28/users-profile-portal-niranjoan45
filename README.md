# Student Profile Portal

A full-stack student profile management system built with Next.js, GraphQL, Prisma, PostgreSQL, and JWT authentication.

## Features

- JWT Authentication (Register / Login)
- View all students (card grid)
- Add a student
- Edit student profile
- Delete a student
- Upload profile image

## Tech Stack

- **Frontend**: Next.js 15, React
- **API**: GraphQL (Apollo Server)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcryptjs)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/SECE-24-28/users-profile-portal-niranjoan45.git
cd users-profile-portal-niranjoan45
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

### 4. Push DB schema
```bash
npx prisma db push
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── graphql/route.ts   # Apollo Server endpoint
│   │   └── upload/route.ts    # Image upload endpoint
│   ├── login/page.tsx         # Login & Register page
│   └── students/page.tsx      # Students CRUD page
├── graphql/
│   ├── schema.ts              # GraphQL type definitions
│   └── resolvers.ts           # GraphQL resolvers
└── lib/
    ├── prisma.ts              # Prisma client singleton
    └── auth.ts                # JWT utilities
```
