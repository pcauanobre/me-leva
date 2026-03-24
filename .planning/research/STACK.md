# Technology Stack

**Project:** Me Leva — Pet Adoption Platform
**Researched:** 2026-03-24
**Research mode:** Ecosystem (Stack dimension)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.0 (latest stable) | Full-stack React framework | SSR for public pet listings (SEO), App Router for RSC, single codebase for public site + admin panel |
| React | 19.x (bundled with Next.js 16) | UI layer | Required by Next.js 16; includes React Compiler support |
| TypeScript | 5.x | Type safety | Next.js 16 requires TypeScript 5.1+; enforced by `create-next-app` defaults |

**Confidence: MEDIUM** — Next.js 16 was released October 2025 and is verified stable. Version 16.2.0 confirmed from GitHub releases on 2026-03-18. The App Router is the default for all new projects created with `create-next-app@latest`.

**App Router is the right choice here, not Pages Router.** Reasons specific to this project:

- Public listing page (`/animals`) benefits from React Server Components — data fetched server-side, no client JS for the grid render, better LCP
- Admin panel is server-rendered by default; sensitive data never reaches client unless explicitly passed
- `proxy.ts` (formerly `middleware.ts`) runs on Node.js runtime in Next.js 16, removing the Edge runtime incompatibility with `@supabase/ssr` that existed in prior versions
- `create-next-app` defaults to App Router + Turbopack; no configuration needed

**Rendering strategy per route:**

| Route | Strategy | Rationale |
|-------|----------|-----------|
| `/` (home) | Static (SSG) | No dynamic data; fast initial load |
| `/animals` (listing) | ISR or dynamic server render | Animal list changes, but not per-request; revalidate on admin mutations |
| `/animals/[slug]` (detail) | ISR | Per-animal pages; rebuilt when admin updates status/photos |
| `/admin/*` | Dynamic server render | Authenticated, private; must never be cached |
| `/sobre`, `/privacidade` | Static (SSG) | Purely informational content |

---

### Database and Backend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase (PostgreSQL) | Latest (managed service) | Primary database | Free tier, RLS enforced at DB level, familiar SQL, structured data for animals + adoption forms |
| Supabase Auth | Latest (managed) | Admin authentication | Email+password for single admin user; no OAuth needed per PROJECT.md; cookie-based session via `@supabase/ssr` |
| Supabase Storage | Latest (managed) | Pet photo storage | Up to 5 photos per animal; free tier bucket; native image transformation API |

**Confidence: HIGH** — Supabase stack was pre-decided by the team. Architecture details verified against official Supabase docs.

**Critical Auth architecture decision (Next.js 16 specific):**

Use `proxy.ts` (not `middleware.ts`) for session refresh. In Next.js 16, `middleware.ts` is deprecated — the replacement is `proxy.ts` which runs on Node.js runtime. This is critical because `@supabase/ssr` requires Node.js APIs and fails silently on Edge runtime. The pattern:

1. `proxy.ts` at project root — refreshes Supabase session cookies before any Server Component renders
2. `utils/supabase/server.ts` — server client using `@supabase/ssr` with cookie read/write
3. `utils/supabase/client.ts` — browser client for Client Components

**Security rule:** Always use `supabase.auth.getClaims()` (not `getSession()`) in server code to protect admin routes. `getClaims()` validates the JWT signature on every call; `getSession()` trusts the cookie without re-validation.

---

### NPM Packages — Backend/Auth

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@supabase/supabase-js` | `^2.x` (latest) | Core Supabase client | Base package required alongside `@supabase/ssr` |
| `@supabase/ssr` | `^0.x` (latest stable) | SSR-safe Supabase client | Replaces deprecated `@supabase/auth-helpers-nextjs`; cookie-based sessions |

**Confidence: MEDIUM** — `@supabase/ssr` was at pre-release (v0.8.0-rc.9) as of late November 2025 per npm search; check `npm install @supabase/ssr@latest` at project init time to confirm current stable. The package is the officially recommended replacement for `@supabase/auth-helpers-nextjs` which is deprecated.

Do NOT install `@supabase/auth-helpers-nextjs` — deprecated, no longer receives updates.

---

### UI Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4.x (stable since Jan 2025) | Styling | CSS-first config, zero-config content detection, 5x faster builds; `create-next-app` includes it by default |
| shadcn/ui | CLI-based (no package version) | Component primitives | Copy-owned components, full code control, built on Radix UI (accessible), updated for Tailwind v4 + React 19 as of February 2025 |

**Confidence: HIGH** — Both verified against official docs. Tailwind v4 stable released January 22, 2025. shadcn/ui official Tailwind v4 support documented at `ui.shadcn.com/docs/tailwind-v4`.

**shadcn/ui specifics for this project:**

- Use `new-york` style (default for new projects; `default` style is being deprecated)
- Relevant components to install: `card`, `button`, `badge`, `input`, `textarea`, `select`, `label`, `dialog`, `table`, `avatar`, `separator`, `skeleton`, `toast` (use `sonner` instead — shadcn deprecated its own `toast` component in favor of `sonner`)
- Color customization: brand uses purple/pink — set OKLCH tokens in `globals.css` via `@theme` directive (Tailwind v4 CSS-first config)

---

### Form Handling

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react-hook-form` | `^7.72.0` | Form state management | Uncontrolled components, minimal re-renders |
| `zod` | `^4.x` | Schema validation | TypeScript-first, client + server shared schemas |
| `@hookform/resolvers` | `^5.2.2` | Bridge RHF and Zod | v5.2.2+ supports Zod v4; v4 and v3 auto-detected |

**Confidence: HIGH** — Versions confirmed via npm search as of 2026-03-24. `react-hook-form@7.72.0` published 2 days ago. `zod@4.3.6` is latest stable. `@hookform/resolvers@5.2.2` is latest stable with Zod v4 support.

**Pattern for the adoption interest form (no server action needed for simple submission):**

```typescript
// Client Component (app/animals/[slug]/adoption-form.tsx)
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  message: z.string().min(10),
  honeypot: z.string().max(0), // must be empty — bot trap
})
```

Use the same `schema` on the Server Action to re-validate server-side before DB insert.

---

### Image Handling

| Approach | Rationale |
|----------|-----------|
| `next/image` with Supabase custom loader | Serves images through Supabase Storage transformation API (resize, WebP, quality) |
| Supabase Image Transformations | Free plan: available; resizes on-the-fly, auto WebP for supported browsers |

**Confidence: MEDIUM** — Supabase Image Transformations documented as requiring Pro Plan per the official docs fetched directly. The free tier may NOT include transformations. Verify at project start — if unavailable on free tier, fall back to `next/image` with `remotePatterns` pointing to the raw Supabase Storage URL (unoptimized but functional).

Custom loader setup for `next.config.ts`:

```typescript
// supabase-image-loader.ts
export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const url = new URL(`https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/render/image/public/${src}`)
  url.searchParams.set("width", width.toString())
  url.searchParams.set("quality", (quality ?? 75).toString())
  return url.href
}
```

Upload strategy for up to 5 photos per animal:
- Client-side file picker → validate type (jpg/png/webp) and size (< 5MB each) before upload
- Use Supabase Storage standard upload for files < 6MB; TUS resumable upload only needed for larger files
- Store photo URLs (or storage paths) in a separate `animal_photos` table with FK to `animals`, ordered by position
- Bucket should be **public** with RLS restricting write/delete to authenticated admin only

---

### Spam Protection

| Approach | Rationale |
|----------|-----------|
| Honeypot field | Invisible input field in adoption form. Bots fill it; humans leave it empty. Zero UX friction. Zero cost. Chosen over CAPTCHA per PROJECT.md decision. |

Implementation: add `<input name="honeypot" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />` to the form. Validate `honeypot === ""` in the Server Action before inserting to DB.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Router | App Router | Pages Router | Pages Router is stable but lacks RSC; App Router is the default for new projects in Next.js 16; admin + public in one project is cleaner with App Router route groups |
| Auth | Supabase Auth | NextAuth.js / Auth.js | Pre-decided stack; one less dependency; single admin user doesn't justify third-party auth layer |
| UI library | shadcn/ui | Chakra UI, MUI | shadcn gives code ownership; Chakra/MUI carry runtime overhead and opinionated theming that conflicts with brand customization |
| Form | react-hook-form + zod | Formik + yup | RHF has significantly lower re-render cost; zod is TypeScript-native and shares schemas across client and server |
| Styling | Tailwind v4 | Tailwind v3, CSS Modules | v4 is faster, built into Next.js 16 defaults, CSS-first config eliminates `tailwind.config.js` maintenance |
| Image upload | Supabase Storage | Cloudinary, AWS S3 | Free tier covers 1GB storage; no extra service to configure; integrated with existing RLS auth |
| Notifications | (none in MVP) | Resend, SendGrid | Out of scope per PROJECT.md; deferred to Phase 2 |

---

## Installation

```bash
# Create project with latest Next.js (includes Tailwind v4, TypeScript, App Router, Turbopack)
npx create-next-app@latest me-leva --typescript --tailwind --app --turbopack

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Form handling
npm install react-hook-form zod @hookform/resolvers

# UI components (shadcn/ui CLI — not an npm install)
npx shadcn@latest init
# Choose: new-york style, oklch colors, yes to CSS variables

# Install shadcn components as needed
npx shadcn@latest add card button badge input textarea select label dialog table skeleton separator
npx shadcn@latest add sonner  # replaces deprecated toast
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon_key>
# Keep service role key server-only — never NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

---

## Sources

- Next.js 16 release blog: https://nextjs.org/blog/next-16 (official, October 2025)
- Next.js 16.2.0 on GitHub releases: https://github.com/vercel/next.js/releases (verified March 2026)
- Supabase Auth + Next.js App Router: https://supabase.com/docs/guides/auth/server-side/nextjs (official)
- Supabase SSR package: https://supabase.com/docs/guides/auth/server-side/creating-a-client (official)
- Supabase Image Transformations: https://supabase.com/docs/guides/storage/serving/image-transformations (official)
- Tailwind CSS v4 release: https://tailwindcss.com/blog/tailwindcss-v4 (official, January 2025)
- shadcn/ui Tailwind v4 docs: https://ui.shadcn.com/docs/tailwind-v4 (official, February 2025)
- react-hook-form npm: https://www.npmjs.com/package/react-hook-form (v7.72.0)
- zod npm: https://www.npmjs.com/package/zod (v4.3.6)
- @hookform/resolvers: https://www.npmjs.com/package/@hookform/resolvers (v5.2.2, Zod v4 support)
- Supabase Storage upload guide: https://supabase.com/docs/guides/storage/uploads/standard-uploads (official)

---

## Confidence Summary

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js version (16.2.0) | HIGH | Verified via GitHub releases + official blog |
| App Router recommendation | HIGH | Official default since Next.js 13; mandatory choice for Next.js 16 new projects |
| Supabase Auth pattern | HIGH | Official docs verified; `proxy.ts` is the correct Next.js 16 pattern |
| Supabase Storage + RLS | HIGH | Official docs verified |
| Image Transformations (free tier) | LOW | Official docs state Pro Plan required — must verify at project start |
| Tailwind v4 + shadcn/ui | HIGH | Both officially documented with compatibility confirmed |
| react-hook-form + zod + resolvers | HIGH | Versions verified via npm; Zod v4 support in resolvers v5.2.2+ confirmed |
| `@supabase/ssr` exact version | MEDIUM | Pre-release versions seen in search; install `@latest` at project init |
