# CareerVerse

A production-ready [Next.js 15](https://nextjs.org) application built with TypeScript, Tailwind CSS, ESLint, and the App Router.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the project with `tsc` |

## Project structure

```
careerverse/
├── public/                 # Static assets served at the site root
├── src/
│   ├── app/                # App Router: routes, layouts, pages
│   │   ├── globals.css     # Global styles + Tailwind entry
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home route
│   ├── components/         # Reusable React components
│   │   ├── layout/         # Structural components (header, footer, ...)
│   │   └── ui/             # Presentational UI primitives
│   ├── config/             # Static app configuration (site.ts, ...)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Framework-agnostic helpers & clients
│   └── types/              # Shared TypeScript types
├── eslint.config.mjs       # ESLint (flat config)
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS / Tailwind
└── tsconfig.json           # TypeScript config (@/* -> src/*)
```

The `@/*` import alias maps to `src/*`, e.g. `import { siteConfig } from "@/config/site"`.

## Tech stack

- **Next.js 15** with the App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **ESLint 9** (flat config, `next/core-web-vitals` + `next/typescript`)
