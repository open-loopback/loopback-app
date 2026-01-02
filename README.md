# Loopback App

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596be?style=for-the-badge&logo=trpc&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

Loopback App is a modern web application built with Next.js 16, featuring robust authentication, database management, and caching.

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** Postgres
- **API:** [tRPC](https://trpc.io/)
- **Caching:** [Flamecache](https://github.com/flamecache/flamecache) with Firebase
- **Styling:** Tailwind CSS & Shadcn UI

## Getting Started

### Prerequisites

- Node.js installed
- A Postgres database instance
- A Clerk project for authentication
- A Firebase project for caching (optional)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the required environment variables in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Get these from your Clerk Dashboard.
   - `DATABASE_URL`: Your Postgres connection string.
   - `FIREBASE_*`: Your Firebase configuration for caching.

### Development

First, install dependencies:
```bash
npm install # or bun install
```

Then, run the development server:
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Shadcn UI).
- `db/`: Database schema and Drizzle configuration.
- `lib/`: Utility functions and API clients (tRPC, cache).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Clerk Documentation](https://clerk.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
