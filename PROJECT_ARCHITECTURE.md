# Project Architecture & Development Guide

> This document is the single source of truth for every developer and AI agent working on this project.
> Update it when any architectural decision changes.

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Project Structure](#2-project-structure)
3. [Internationalization (i18n)](#3-internationalization-i18n)
4. [Theming — Dark / Light / RTL](#4-theming--dark--light--rtl)
5. [State Management](#5-state-management)
6. [API Layer & Auth](#6-api-layer--auth)
7. [Forms & Validation](#7-forms--validation)
8. [Component System](#8-component-system)
9. [SEO](#9-seo)
10. [Testing](#10-testing)
11. [Environment Variables](#11-environment-variables)
12. [Code Quality Toolchain](#12-code-quality-toolchain)
13. [Deployment](#13-deployment)
14. [Git Workflow](#14-git-workflow)
15. [Open Questions & Future Decisions](#15-open-questions--future-decisions)

---

## 1. Stack Overview

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js (latest stable, App Router) | SSR/SSG/ISR, file-based routing, built-in image optimization |
| Language | TypeScript (strict mode) | Production safety, better DX with NestJS DTO alignment |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first + unstyled headless primitives you own |
| i18n | next-intl | Best App Router support, URL-based, RTL-aware, full TS |
| Theme | next-themes | System-preference detection, SSR-safe, zero flash |
| State | Redux Toolkit (RTK) + RTK Query | Predictable state, RTK Query replaces a standalone HTTP client |
| Forms | React Hook Form + Zod | Schema-driven, composable, aligns with NestJS DTOs |
| Auth | JWT via NestJS backend + httpOnly cookies | Backend owns auth; frontend is stateless regarding credentials |
| Testing | Vitest + React Testing Library + Playwright | Fast unit/integration + reliable e2e |
| Linting | ESLint (Next.js config) + Prettier | Enforced formatting and code quality |
| Git hooks | Husky + lint-staged | Pre-commit quality gates |
| Fonts | Vazirmatn (Persian + Latin) | Open source, well-hinted, covers both scripts |
| Deployment | Vercel (primary) + Liara (IR region) | Zero-config Vercel + Liara for Persian-region availability |

---

## 2. Project Structure

Following the [Next.js recommended project structure](https://nextjs.org/docs/app/getting-started/project-structure).

```
/
├── app/
│   ├── [locale]/                    # All routes are locale-prefixed (fa, en)
│   │   ├── layout.tsx               # Root layout: theme, direction, fonts
│   │   ├── page.tsx                 # Home page
│   │   ├── (auth)/                  # Route group: auth pages (no shared layout)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/                  # Route group: authenticated app shell
│   │   │   ├── layout.tsx           # Navbar, sidebar, etc.
│   │   │   └── dashboard/
│   │   └── [...not-found]/
│   ├── api/                         # Next.js API routes (BFF proxy — see §6)
│   │   └── [...proxy]/
│   ├── globals.css
│   └── layout.tsx                   # Minimal root layout (html/body only)
│
├── components/
│   ├── ui/                          # shadcn/ui generated components (do not edit manually)
│   └── shared/                      # App-specific shared components
│       ├── Navbar/
│       ├── ThemeToggle/
│       └── LanguageSwitcher/
│
├── features/                        # Feature-sliced modules
│   └── [feature-name]/
│       ├── components/              # Feature-specific components
│       ├── hooks/                   # Feature-specific hooks
│       ├── types.ts
│       └── index.ts                 # Public API of the feature
│
├── lib/
│   ├── store/                       # Redux store
│   │   ├── index.ts                 # Store configuration
│   │   ├── hooks.ts                 # Typed useAppDispatch / useAppSelector
│   │   └── slices/                  # RTK slices
│   ├── api/                         # RTK Query API definitions
│   │   ├── baseApi.ts               # Base query with auth headers + token refresh
│   │   └── endpoints/               # One file per resource
│   ├── i18n/
│   │   ├── routing.ts               # next-intl routing config
│   │   └── request.ts               # next-intl server-side config
│   ├── auth/
│   │   ├── session.ts               # Cookie read/write helpers
│   │   └── middleware-helpers.ts
│   └── utils/                       # Pure utility functions
│
├── messages/                        # Translation files
│   ├── fa.json                      # Persian (default)
│   └── en.json                      # English
│
├── hooks/                           # Global custom hooks
├── types/                           # Global TypeScript types and interfaces
├── public/                          # Static assets
├── middleware.ts                    # next-intl + auth route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .env.local                       # Never committed
├── .env.example                     # Committed, no values
└── PROJECT_ARCHITECTURE.md         # This file
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase directory + `index.tsx` | `components/shared/Navbar/index.tsx` |
| Hooks | camelCase prefixed with `use` | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase, `I` prefix for interfaces | `IUser`, `UserRole` |
| API slices | camelCase + `Api` suffix | `userApi.ts` |
| Redux slices | camelCase + `Slice` suffix | `authSlice.ts` |
| Translation keys | nested dot-notation, snake_case | `"common.submit_button"` |

---

## 3. Internationalization (i18n)

### Strategy: URL-based locale prefix

```
https://example.com/fa/dashboard   ← Persian (default, RTL)
https://example.com/en/dashboard   ← English (LTR)
```

### Library: `next-intl`

```ts
// lib/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always',   // always show /fa/ or /en/ in URL
});
```

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### Translation File Structure

```json
// messages/fa.json
{
  "common": {
    "submit": "ارسال",
    "cancel": "لغو",
    "loading": "در حال بارگذاری..."
  },
  "auth": {
    "login_title": "ورود به حساب کاربری",
    "email_label": "ایمیل"
  }
}
```

### Usage in Components

```tsx
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('submit')}</h1>;
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function SubmitButton() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}
```

### Adding a New Language

1. Add locale key to `routing.ts` locales array.
2. Create `messages/[locale].json`.
3. Add font support if the script requires it.
4. Verify Tailwind `dir` attribute is handled (see §4).

---

## 4. Theming — Dark / Light / RTL

### Dark/Light Mode: `next-themes`

Wrap the root layout with `ThemeProvider`. The theme is stored in `localStorage` and synced to a `data-theme` attribute on `<html>`.

```tsx
// app/[locale]/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- `suppressHydrationWarning` is required to avoid React hydration mismatch on theme injection.
- `defaultTheme="system"` respects OS preference on first visit.

### RTL

Direction is driven by locale, not a separate toggle. Set `dir` on the `<html>` element as above. Tailwind's `rtl:` variant handles layout flips:

```tsx
<div className="ml-4 rtl:ml-0 rtl:mr-4">...</div>
// Or with logical properties (preferred):
<div className="ms-4">...</div>  // ms = margin-inline-start
```

**Rule:** Always prefer Tailwind's logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) over physical ones (`ml-`, `mr-`, `left-`, `right-`) for any layout that must work in both LTR and RTL.

### Fonts

Load **Vazirmatn** as the primary font. It covers both Persian (Nastaliq-style), Arabic, and Latin characters.

```ts
// app/[locale]/layout.tsx
import localFont from 'next/font/local';

const vazirmatn = localFont({
  src: '../../public/fonts/Vazirmatn-Variable.woff2',
  variable: '--font-vazirmatn',
  display: 'swap',
});
```

Set `font-family` in `globals.css`:
```css
body {
  font-family: var(--font-vazirmatn), sans-serif;
}
```

### shadcn/ui Dark Mode

shadcn uses CSS variables. Dark mode colors are defined in `globals.css` under `.dark {}`. This works automatically with `next-themes` + `attribute="class"`.

---

## 5. State Management

### Redux Toolkit

Use RTK for global client state. Do **not** put server data into Redux — that is RTK Query's domain.

```
lib/store/
├── index.ts          ← configureStore, RootState, AppDispatch
├── hooks.ts          ← useAppDispatch, useAppSelector (typed wrappers)
└── slices/
    ├── authSlice.ts  ← current user, token status
    └── uiSlice.ts    ← sidebar open, modal state, etc.
```

```ts
// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```ts
// lib/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

**Redux is Client Components only.** Wrap with a `StoreProvider` client component that calls `Provider` from react-redux.

---

## 6. API Layer & Auth

### Architecture: BFF-Ready Proxy Pattern

The frontend communicates with the NestJS backend **directly** via RTK Query for now. API routes under `app/api/` are reserved as a **BFF (Backend for Frontend) proxy layer** that can be activated when:

- The backend moves to Next.js, or
- You need request transformation, secret injection, or rate limiting on the frontend.

```
Current flow:
  Client → RTK Query → NestJS REST API

Future-ready flow:
  Client → RTK Query → /api/[...proxy] → NestJS REST API
                                        ↘ Next.js API handlers
```

Switching is a **one-line change** in `baseApi.ts` — from `NEXT_PUBLIC_API_URL` to `/api`.

### RTK Query Base API

```ts
// lib/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',             // send httpOnly cookies
  prepareHeaders: (headers) => {
    // CSRF token or any static header if needed
    return headers;
  },
});

// Wrap with token-refresh logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );
        if (refreshResult.data) {
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post'],         // Add resource tags here
  endpoints: () => ({}),
});
```

### Auth Flow

1. User submits login form.
2. Request goes to NestJS `/auth/login`.
3. NestJS sets `access_token` and `refresh_token` as **httpOnly, Secure cookies**.
4. Frontend never reads or stores tokens — they are sent automatically by the browser.
5. RTK Query's `credentials: 'include'` ensures cookies are sent on every request.
6. On 401, the base query attempts a silent refresh via `/auth/refresh`.
7. On failed refresh, dispatch `logout()` and redirect to `/[locale]/login`.

**Auth state in Redux** only stores non-sensitive user metadata (name, role, avatar) — never the token itself.

### Endpoint Files

```ts
// lib/api/endpoints/userApi.ts
import { baseApi } from '../baseApi';
import type { IUser } from '@/types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<IUser, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<IUser, Partial<IUser>>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery, useUpdateProfileMutation } = userApi;
```

---

## 7. Forms & Validation

### React Hook Form + Zod

Zod schemas should mirror NestJS DTO validation as closely as possible. Define schemas in a shared `schemas/` directory inside the feature.

```ts
// features/auth/schemas/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'ایمیل معتبر نیست' }),
  password: z.string().min(8, { message: 'رمز عبور حداقل ۸ کاراکتر باید باشد' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

```tsx
// features/auth/components/LoginForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    // call RTK Query mutation
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* shadcn/ui FormField components */}
      </form>
    </Form>
  );
}
```

**Rules:**
- Validation errors should use translated messages via `next-intl`'s `t()` inside the schema factory.
- Never write validation logic inline in components.
- Server errors from the API should be mapped onto form fields via `form.setError()`.

---

## 8. Component System

### shadcn/ui

Components are installed via CLI into `components/ui/`. They are **owned by the project** — commit and modify them freely.

```bash
npx shadcn@latest add button input form dialog
```

### Component Layers

```
components/ui/          ← shadcn primitives (low-level, unstyled base)
components/shared/      ← Assembled app-specific components using ui/ primitives
features/*/components/  ← Feature-bound components (not reused across features)
```

**Do not import from `features/` outside that feature.** Export through `features/[name]/index.ts`.

### Component File Structure

```
components/shared/Navbar/
├── index.tsx           ← Public export
├── Navbar.tsx          ← Implementation
├── NavItem.tsx         ← Sub-component
└── Navbar.test.tsx     ← Co-located test
```

---

## 9. SEO

Mid-level SEO using Next.js built-in Metadata API. No third-party library needed.

```tsx
// app/[locale]/page.tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }): Promise<Metadata> {
  const t = await getTranslations('seo');
  return {
    title: t('home_title'),
    description: t('home_description'),
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        'fa': '/fa',
        'en': '/en',
      },
    },
    openGraph: {
      locale: params.locale,
    },
  };
}
```

**Checklist:**
- [ ] `robots.txt` — generated via `app/robots.ts`
- [ ] `sitemap.xml` — generated via `app/sitemap.ts`
- [ ] `hreflang` alternate links on every page (shown above)
- [ ] `og:image` — use `next/og` for dynamic generation
- [ ] Structured data (JSON-LD) for key pages
- [ ] Semantic HTML in all page components (`<main>`, `<nav>`, `<article>`, etc.)

---

## 10. Testing

### Setup

| Layer | Tool | Scope |
|---|---|---|
| Unit / Integration | Vitest + React Testing Library | Components, hooks, utils, slices |
| E2E | Playwright | Critical user flows |
| API mocking | MSW (Mock Service Worker) | Mock RTK Query in tests |

### File Placement

- Unit tests: co-located with their source file (`Component.test.tsx`)
- E2E tests: `/e2e/` directory at root

### Vitest Config

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom';
import { server } from './lib/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Playwright Config

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### What to Test

**Always test:**
- Auth flow (login, token expiry, redirect)
- Forms: validation messages, submission, server error mapping
- RTK Query endpoints: loading, success, error states (via MSW)
- Redux slices: reducers and selectors

**Do not test:**
- shadcn/ui internal component logic
- CSS / visual styles
- Implementation details of third-party libraries

---

## 11. Environment Variables

```bash
# .env.example — commit this file, never .env.local

# Backend API
NEXT_PUBLIC_API_URL=https://api.example.com    # Exposed to browser
API_SECRET_KEY=                                 # Server-only, never NEXT_PUBLIC_

# next-auth / session (if added later)
AUTH_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://example.com
```

**Rules:**
- `NEXT_PUBLIC_` prefix = exposed to the browser bundle. Never put secrets here.
- Server-only vars (no prefix) are only available in Server Components, API routes, and middleware.
- Never hardcode URLs or keys in source code.
- Add every new variable to `.env.example` with an empty value and a comment.

---

## 12. Code Quality Toolchain

### ESLint

Using `eslint-config-next` as the base, extended with:
- `@typescript-eslint/recommended`
- `eslint-plugin-import` (import order enforcement)

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Husky + lint-staged

```json
// package.json (partial)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

Pre-commit hook runs lint-staged. Pre-push hook runs `vitest run`.

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 13. Deployment

### Vercel (Primary)

- Connect GitHub repo, auto-deploy on push to `main`.
- Set all production env vars in Vercel dashboard.
- Enable **Edge Middleware** (middleware.ts runs on the edge by default).
- Use Vercel's **Preview Deployments** for every PR.

```json
// vercel.json — only if customization is needed
{
  "regions": ["fra1"]   // Frankfurt for EU/IR latency
}
```

### Liara (IR Region)

Liara supports Next.js deployment via Docker or its native buildpack.

```dockerfile
# Dockerfile (for Liara)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Enable `output: 'standalone'` in `next.config.ts` for Docker builds:

```ts
// next.config.ts
const nextConfig = {
  output: 'standalone',
};
```

**Rule:** The same codebase deploys to both. Use `NEXT_PUBLIC_APP_URL` to handle domain differences.

---

## 14. Git Workflow

### Branching

```
main          ← production, protected, no direct push
staging       ← pre-production integration
dev           ← active development integration
feature/*     ← feature branches, branch from dev
fix/*         ← bug fixes
chore/*       ← non-functional changes (deps, config)
```

### Commit Messages (Conventional Commits)

```
feat(auth): add JWT refresh token handling
fix(i18n): correct RTL margin on navbar
chore(deps): upgrade next-intl to 3.x
refactor(store): split auth slice into separate file
test(login): add e2e test for invalid credentials
```

### PR Rules

- Every PR targets `dev` (never `main` directly).
- At least one reviewer required.
- All CI checks must pass (lint, type-check, unit tests).
- Squash merge to keep history clean.

---

## 15. Open Questions & Future Decisions

These items are **not decided yet** and must be resolved before the relevant feature is built.

| # | Question | Impact | Priority |
|---|---|---|---|
| 1 | Will the NestJS backend implement **WebSockets**? If yes, plan for a real-time layer (Socket.io client or native WS). | Real-time features | High |
| 2 | **File uploads**: handled client-to-backend directly, or through a Next.js API proxy (for virus scanning, size limits)? | File feature scope | High |
| 3 | **Role-based access control (RBAC)**: How granular? Define roles before building any protected route logic. | Middleware, UI | High |
| 4 | **Pagination strategy**: cursor-based or offset-based from NestJS? Affects RTK Query cache invalidation design. | All list views | Medium |
| 5 | **Image CDN**: Will user-uploaded images be served from a CDN (S3 + CloudFront, or Liara Object Storage)? Affects `next/image` `domains` config. | Media features | Medium |
| 6 | **Error monitoring**: No tool chosen yet. Sentry is the standard choice when ready. Drop-in addition. | Production stability | Medium |
| 7 | **Analytics**: Persian region may require a self-hosted alternative to Google Analytics (e.g., Umami). | Marketing/growth | Low |
| 8 | **PWA support**: Would offline capability or "Add to Home Screen" be valuable for mobile users? | Mobile UX | Low |
| 9 | **Email templates**: If transactional emails are needed, does NestJS handle them fully, or does Next.js need to render templates? | Notifications | Low |
| 10 | **Storybook**: Worth adding for the component library once the design system stabilizes. | DX, design alignment | Low |

---

## Quick Start Checklist (Onboarding)

For every new developer or AI agent starting on this project:

- [ ] Read this document top to bottom.
- [ ] Run `cp .env.example .env.local` and fill in values.
- [ ] Run `npm install`.
- [ ] Run `npm run dev` — verify the app loads at `/fa` by default.
- [ ] Verify dark mode toggle works.
- [ ] Verify language switch between `/fa` and `/en` works.
- [ ] Run `npm run test` — all tests should pass.
- [ ] Ask the team lead about any **Open Questions** relevant to your assigned feature before writing code.

---

*Last updated: project initialization*
*Maintained by: [team lead name]*
