# Access Issues

A web app from managing climbing access issues.

The Tech Stack:

- [React Router v7](https://reactrouter.com/) ([Framework Mode aka Remix v3?](https://reactrouter.com/start/framework/installation))
- [Drizzle](https://orm.drizzle.team/) with [PostgresSQL](https://www.postgresql.org/)
- [shadcn](https://ui.shadcn.com/)
- [Tailwind](https://tailwindcss.com/)

## Getting Started

### Prerequisites

[asdf](https://asdf-vm.com/): Runtime version manager for managing Node.js and PNPM versions.

### Installation

Install runtime dependencies:

```bash
asdf install
```

Install the app dependencies:

```bash
pnpm install
```

### Development

Copy `.env.sample.` to `.env`:

```bash
cp .env.sample
```

Start the development Postgres database in Docker:

```bash
docker compose up
```

Start the development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:3000`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

### TBD
