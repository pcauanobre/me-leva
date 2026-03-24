# Project Research Summary

**Project:** Me Leva — Plataforma de Adocao de Animais
**Domain:** Pet adoption catalog with public listing + private admin panel
**Researched:** 2026-03-24
**Confidence:** HIGH

---

## Executive Summary

Me Leva is a purpose-built pet adoption catalog for an independent animal rescuer in Fortaleza, Brazil. The product replaces fragmented Instagram-based management with a fully owned web platform: a public animal listing with search filters, individual animal profiles with a contact form, and a private admin panel for managing animals and reviewing adoption interest submissions. The architecture follows a well-established Next.js 16 App Router + Supabase pattern where the public site is rendered server-side for SEO, the admin panel is protected by server-validated JWT sessions, and all data lives in a single Supabase project (PostgreSQL + Auth + Storage).

All four research dimensions align on a single recommended approach: Next.js 16.2.0 with App Router, Supabase for backend-as-a-service, Tailwind v4 + shadcn/ui for styling, and react-hook-form + Zod for form handling. There are no conflicts between researchers — the stack, features, architecture, and pitfall findings reinforce each other. The feature set is deliberately lean: every feature in scope can be built and tested within a 3-week MVP timeline at zero infrastructure cost using free tiers. The most important architectural decisions (RLS policies, `getUser()` over `getSession()`, server-only Supabase initialization) are well-documented in official sources and carry clear prevention strategies.

The primary risks are operational rather than technical: Supabase free-tier project pausing, RLS misconfiguration that silently returns empty data, and auth security that relies only on middleware rather than per-endpoint validation. All three risks have low-cost mitigations that must be baked into the implementation from day one, not retroactively added. The one unresolved uncertainty is whether Supabase Image Transformations are available on the free plan — this must be verified at project initialization, with a plain `remotePatterns` fallback ready if they are not.

---

## Key Findings

### Recommended Stack

The pre-decided Next.js + Supabase stack is the right choice for this project and is well-supported by current tooling. Next.js 16.2.0 (App Router, Turbopack, React 19) is the verified stable release as of March 2026. Supabase handles all backend concerns — PostgreSQL, Auth, and Storage — within a single free-tier project, eliminating third-party service dependencies. Tailwind v4 and shadcn/ui (new-york style) provide the UI layer with full code ownership and zero runtime overhead.

One critical Next.js 16 change affects auth setup: `middleware.ts` is deprecated in favor of `proxy.ts`, which runs on Node.js runtime and resolves previous Edge runtime incompatibilities with `@supabase/ssr`. This is not reflected in most tutorials but is documented in the official Next.js 16 migration guide.

**Core technologies:**
- **Next.js 16.2.0 (App Router):** Full-stack framework — SSR for public SEO, route groups for clean public/admin separation, Server Actions for mutations
- **Supabase (PostgreSQL + Auth + Storage):** Pre-decided backend — free tier covers this MVP scale; RLS enforces security at DB level
- **Tailwind v4 + shadcn/ui:** Styling — CSS-first config, Radix-based accessible components, full code ownership
- **react-hook-form 7.72.0 + Zod 4.3.6:** Form handling — minimal re-renders, shared schemas across client and server
- **`@supabase/ssr` (latest):** SSR-safe Supabase client — replaces deprecated `@supabase/auth-helpers-nextjs`; required for cookie-based sessions in App Router

**Key version constraints:**
- Use `@hookform/resolvers@^5.2.2` for Zod v4 support (earlier versions do not support Zod v4)
- Do NOT install `@supabase/auth-helpers-nextjs` — deprecated, no longer maintained
- shadcn/ui: use `new-york` style; `default` style is being deprecated

### Expected Features

All researchers agree the MVP feature set is correct and achievable. The public listing + filters + profile + interest form is the minimum viable loop for the rescuer. The admin panel (CRUD + photo upload + interest form inbox) is the minimum viable backend. Everything else is explicitly deferred.

**Must have (table stakes):**
- Public animal listing with photos, names, species, and status badges
- Animal profile page with photo gallery and full data (breed, age, size, sex, neutered, vaccinated, description)
- Species / size / age / status filters on the listing page
- Individual interest form (name, phone, message) — no account required
- Availability status (Disponivel / Urgente / Adotado) with auto-hide of adopted animals from public listing
- Admin login (Supabase Auth, email + password)
- Admin CRUD for animals including multi-photo upload (up to 5 per animal)
- Admin inbox showing interest form submissions per animal
- Institutional "Sobre" page and LGPD privacy policy page

**Should have (competitive differentiators):**
- "Urgente" status with visually prominent badge — proven to drive faster adoption action
- Honeypot spam protection — zero UX friction vs reCAPTCHA
- WhatsApp number never exposed — rescuer privacy protection
- LGPD consent checkbox on the interest form linking to the privacy policy

**Defer (v1.x after validation):**
- Email notification to admin on new form submission
- Kanban-style adoption flow tracking
- "Favoritar" / save animal for return visitors

**Defer (v2+):**
- Multi-admin / team roles
- Instagram auto-post integration
- Donation system
- Mobile app (PWA or native)

### Architecture Approach

The architecture uses Next.js route groups `(public)` and `(admin)` to share a single Next.js project while maintaining completely separate layouts, rendering strategies, and access controls. Public routes are React Server Components (SSR/SSG) — no client JS needed for content rendering, benefiting SEO. Admin routes are protected at two levels: `proxy.ts` (formerly `middleware.ts`) for the first-pass redirect, and `supabase.auth.getUser()` in every Server Action and server component for the definitive auth check. All mutations go through Server Actions — no API route handlers needed.

The data model is intentionally simple: two tables (`animals` and `interest_forms`), a public Supabase Storage bucket (`pet-photos`), and RLS policies that enforce the access rules the app needs. Photos are stored as an ordered `text[]` array on the `animals` row (not a join table) — sufficient and simpler at MVP scale.

**Major components:**
1. **`(public)` route group** — Animal listing, animal profiles, Sobre, Privacidade; Server Components; anon RLS access
2. **`(admin)` route group** — Animal CRUD, photo uploader, interest form inbox; authenticated; Server Actions for all mutations
3. **`app/login/` page** — Outside both groups, accessible without auth; calls `supabase.auth.signInWithPassword()` via Server Action
4. **`proxy.ts`** — Session refresh + first-pass admin route guard; reads Supabase cookie before Server Components render
5. **`lib/supabase/server.ts` + `client.ts`** — Per-request Supabase clients using `@supabase/ssr`; server file for Server Components and Server Actions, client file for Client Components only
6. **Supabase `animals` table + RLS** — Public anon SELECT (status != 'adotado'); authenticated full CRUD
7. **Supabase `interest_forms` table + RLS** — Anon INSERT; authenticated SELECT + DELETE
8. **Supabase Storage `pet-photos` bucket** — Public GET; authenticated INSERT + DELETE

### Critical Pitfalls

1. **RLS enabled with no policies (silent empty results)** — Enable RLS and write all policies in the same SQL migration. Test public queries with the anon key from a logged-out browser, never from the Supabase Dashboard SQL Editor (which runs as superuser and bypasses RLS).

2. **`getSession()` in server auth checks** — Always use `supabase.auth.getUser()` in `proxy.ts`, Server Components, and Server Actions. `getSession()` reads the cookie without revalidating with the Auth server — an expired or tampered session passes the check.

3. **Middleware-only admin protection (CVE-2025-29927)** — Keep Next.js at 15.2.3+ (patches the bypass). Even after patching, every Server Action and admin server component must independently call `getUser()` and redirect on failure. Middleware is a first filter, not the final guard.

4. **Supabase free-tier project pausing after 7 days of inactivity** — Set up a keep-alive ping (GitHub Actions cron or UptimeRobot) before launch. The rescuer will have sporadic admin usage — the site will go dark during quiet periods without this.

5. **Orphaned Storage files when animals are deleted** — Explicitly call `supabase.storage.from('pet-photos').remove([...paths])` inside the delete-animal Server Action before or alongside the `DELETE FROM animals`. `ON DELETE CASCADE` does not extend to the Storage layer.

6. **`next/image` hostname not configured** — Add `*.supabase.co` to `remotePatterns` in `next.config.ts` before writing a single `<Image>` component. This is a day-one `next.config.ts` setup, not an afterthought.

7. **LGPD consent missing from the interest form** — Add a required checkbox ("Li e aceito a Politica de Privacidade") with a link to the privacy policy before launch. The privacy policy page alone is insufficient under a strict LGPD reading.

---

## Agreements and Conflicts Across Research

### Strong Agreements

- **Stack is fixed and correct.** All researchers assume Next.js + Supabase. No conflicts. The stack is well-suited to the problem.
- **Admin auth must be Phase 1, not later.** FEATURES.md identifies admin auth as the root gate for all other features. ARCHITECTURE.md designs everything around it. PITFALLS.md identifies auth implementation as the highest-risk phase. All three align: auth must be established and hardened before any other work.
- **RLS must be written with the schema, not after.** ARCHITECTURE.md defines the RLS policies in migration files. PITFALLS.md identifies forgetting RLS as the top critical pitfall. STACK.md notes RLS as a security constraint. Full alignment.
- **No adopter accounts.** FEATURES.md marks this as a deliberate anti-feature. ARCHITECTURE.md designs the data model without `user_id` on `interest_forms`. PROJECT.md lists it as out of scope. No conflict.
- **Honeypot over reCAPTCHA.** FEATURES.md, STACK.md, and PITFALLS.md all agree: honeypot is sufficient for this use case and causes zero UX friction.

### Minor Tension: `proxy.ts` vs `middleware.ts` Naming

STACK.md refers to Next.js 16's session refresh mechanism as `proxy.ts` (the new name in Next.js 16 for what was `middleware.ts`). ARCHITECTURE.md uses `middleware.ts` in its code examples and project structure. This is a naming discrepancy, not a logical conflict — the code pattern is identical. Clarification: Next.js 16 introduced `proxy.ts` as a more capable replacement, but `middleware.ts` still works. Prefer `proxy.ts` for new Next.js 16 projects as STACK.md recommends. The ARCHITECTURE.md code samples using `middleware.ts` are functionally correct and can be renamed `proxy.ts` without logic changes.

### One Unresolved Gap: Image Transformations on Free Tier

STACK.md flags LOW confidence that Supabase Image Transformations are available on the free plan (official docs suggest Pro Plan). PITFALLS.md lists a performance trap about serving full-resolution images on the public listing. If transformations are unavailable, full-res images will be served to the listing grid — acceptable for launch, but degraded performance. Mitigation: verify at project init; if unavailable, use `next/image` with `remotePatterns` (unoptimized but functional) and note in the backlog.

---

## Implications for Roadmap

The feature dependency tree from FEATURES.md combined with the pitfall-to-phase mapping from PITFALLS.md suggests a natural 5-phase structure. Each phase is independently testable and delivers real value before the next begins.

### Phase 1: Foundation — Project Setup + Database + Auth
**Rationale:** Admin auth is the root gate for everything. The database schema with RLS must exist before any feature is buildable. This phase has no user-visible output but creates the secure foundation that all subsequent phases depend on.
**Delivers:** Working Next.js project, Supabase project configured, `animals` and `interest_forms` tables with full RLS policies, admin login flow (`/login` → `/admin`), session refresh via `proxy.ts`, keep-alive cron configured.
**Addresses:** Admin login (P1 from FEATURES.md)
**Avoids:** Pitfall 1 (RLS without policies), Pitfall 4 (`getSession()` in server code), Pitfall 5 (middleware-only auth), Pitfall 9 (module-level client initialization)
**Research flag:** Well-documented patterns — skip research-phase. Official Supabase + Next.js docs are authoritative.

### Phase 2: Admin Panel — Animal CRUD + Photo Upload
**Rationale:** The admin needs to create animals before the public site has anything to display. Photo upload is part of animal creation — separating them would leave the admin unusable. This phase also ensures orphaned file deletion is built from the start.
**Delivers:** Admin can create, edit, and delete animals with all fields (name, species, breed, age, size, sex, neutered, vaccinated, description, status). Multi-photo upload to Supabase Storage (up to 5 per animal). Status management (Disponivel / Urgente / Adotado). Animal list view in admin.
**Uses:** Supabase Storage `pet-photos` bucket, Server Actions for mutations, `PhotoUploader` Client Component, `AnimalForm` with react-hook-form + Zod
**Avoids:** Pitfall 6 (private bucket), Pitfall 7 (orphaned files on deletion), Pitfall 8 (`next/image` remotePatterns)
**Research flag:** Well-documented patterns — skip research-phase.

### Phase 3: Public Site — Listing + Animal Profiles
**Rationale:** Once the admin can populate animals, the public-facing catalog can be built and tested with real data. Server Components for SEO, ISR for listing freshness, filters via URL search params.
**Delivers:** Public animal listing at `/animais` with photo cards, species/size/age/status filters, ISR revalidation on admin mutations. Individual animal profile at `/animais/[slug]` with full data and photo gallery. Auto-hide of adopted animals via RLS SELECT policy.
**Implements:** RSC pattern (Pattern 2 from ARCHITECTURE.md), `AnimalGrid` + `AnimalCard` + `AnimalFilters` components, `AnimalGallery` on profile page
**Avoids:** Serving adopted animals on public listing (UX pitfall from PITFALLS.md)
**Research flag:** Well-documented RSC patterns — skip research-phase.

### Phase 4: Interest Form + Admin Inbox
**Rationale:** The interest form is the core conversion action — but it must sit on top of working animal profiles (Phase 3) and connect to an admin inbox. Building both together ensures the end-to-end flow is testable before launch.
**Delivers:** Interest form on animal profile page (name, phone, message — no account required), honeypot spam protection, LGPD consent checkbox linking to privacy policy, server-side Zod validation in Server Action. Admin inbox at `/admin/formularios` showing submissions organized by animal.
**Implements:** Pattern 3 (honeypot), Pattern 1 (Server Action for form submission), `InterestForm` component, `FormSubmissionRow` admin component
**Avoids:** Pitfall from LGPD section (missing consent checkbox), missing server-side validation security mistake, UX pitfall (no form feedback / silent submission)
**Research flag:** Well-documented patterns — skip research-phase.

### Phase 5: Static Pages + Production Hardening
**Rationale:** The "Sobre" and privacy policy pages are static content that can be written at any point, but must exist before public launch (LGPD compliance requires the privacy policy). Production hardening (keep-alive cron, incognito testing, RLS verification) gates the go-live decision.
**Delivers:** "Sobre" institutional page, LGPD privacy policy page, confirmation that all checklist items from PITFALLS.md "Looks Done But Isn't" section are verified, keep-alive cron live, Vercel deployment confirmed with correct environment variables.
**Addresses:** Privacy policy (P1 from FEATURES.md), HTTPS via Vercel (automatic), LGPD compliance gate
**Avoids:** Pitfall 3 (Supabase project pausing), Pitfall from LGPD section (policy/collection misalignment)
**Research flag:** No deep research needed — static content + deployment checklist.

### Phase Ordering Rationale

- Auth before content because every admin write path requires it (FEATURES.md dependency tree)
- Admin CRUD before public site because the public site has no data without it
- Listing before interest form because the form is embedded in an animal profile — the profile must exist first
- Static pages last because they carry no technical dependencies and can be drafted in parallel with other phases — but must be verified complete before launch
- Keep-alive and production hardening bundled into the final phase so they are not forgotten

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase` during planning):
- **Phase 1 (Foundation):** Supabase + Next.js auth is exhaustively documented in official sources
- **Phase 2 (Admin CRUD):** Standard CRUD + file upload patterns; pitfalls are well-known and documented
- **Phase 3 (Public Site):** RSC + ISR patterns are Next.js fundamentals
- **Phase 4 (Interest Form):** Server Actions + honeypot + form validation are standard patterns
- **Phase 5 (Static + Hardening):** No complex integrations; deployment checklist items

No phase in this MVP requires a dedicated research phase. The project is scoped to well-documented technology patterns on a fixed, validated stack.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16.2.0 verified via GitHub releases. Supabase docs verified. Tailwind v4 + shadcn/ui officially documented compatibility confirmed. RHF + Zod versions confirmed via npm. One LOW confidence item: Supabase Image Transformations on free tier — must verify at project init. |
| Features | HIGH | Core feature set matches Brazilian market platforms (Viu Meu Pet, Adote Petz) and aligns exactly with PROJECT.md requirements. Anti-features are well-reasoned. Competitor analysis verified via live site research. |
| Architecture | HIGH | Official Supabase SSR docs + Next.js App Router docs are the source. RLS policy patterns verified. Data model is straightforward. The `proxy.ts` vs `middleware.ts` naming discrepancy is minor and does not affect logic. |
| Pitfalls | HIGH | All critical pitfalls sourced from official docs, CVE disclosures, and verified community issues. Prevention strategies are specific and actionable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Supabase Image Transformations availability on free tier:** STACK.md rates this LOW confidence. At project initialization, test `?width=400&quality=80` on a Storage URL. If it returns a 402 or 400, fall back to plain `remotePatterns` in `next.config.ts` and note in the backlog for a potential upgrade trigger. This does not block any phase — it only affects listing page image quality.

- **`@supabase/ssr` exact version at install time:** STACK.md notes it was at pre-release (v0.8.0-rc.x) in late 2025. Run `npm install @supabase/ssr@latest` at project init and confirm stable release. This is a 30-second verification, not a risk.

- **`proxy.ts` adoption in Next.js 16:** STACK.md identifies `proxy.ts` as the Next.js 16 replacement for `middleware.ts`. ARCHITECTURE.md examples use `middleware.ts`. At project setup, verify which filename Next.js 16.2.0 expects by checking the official migration docs — the code logic is identical regardless of filename.

- **Brazilian phone number validation regex:** PITFALLS.md recommends validating 10–11 digit Brazilian phone numbers in the interest form. The Zod schema needs a Brazil-specific phone regex. This is a one-liner but needs to be defined before Phase 4.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16 release blog (nextjs.org/blog/next-16) — framework version, proxy.ts, App Router defaults
- Supabase Auth + Next.js App Router (supabase.com/docs/guides/auth/server-side/nextjs) — auth pattern, `getUser()` vs `getSession()`
- Supabase Row Level Security (supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns
- Supabase Storage Access Control (supabase.com/docs/guides/storage/security/access-control) — bucket RLS
- Tailwind CSS v4 release (tailwindcss.com/blog/tailwindcss-v4) — version, CSS-first config
- shadcn/ui Tailwind v4 docs (ui.shadcn.com/docs/tailwind-v4) — compatibility confirmation
- react-hook-form npm (npmjs.com/package/react-hook-form) — v7.72.0 confirmed
- zod npm (npmjs.com/package/zod) — v4.3.6 confirmed
- @hookform/resolvers (npmjs.com/package/@hookform/resolvers) — v5.2.2 with Zod v4 support confirmed
- Next.js Data Security guide (nextjs.org/docs/app/guides/data-security) — server-side auth patterns
- CVE-2025-29927 (projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware bypass

### Secondary (MEDIUM confidence)
- Supabase Storage: Delete Objects docs — SDK vs SQL delete distinction
- Supabase Auth Rate Limits — admin login brute-force protection
- Viu Meu Pet (viumeupet.com.br/adocao) — Brazilian market feature reference
- Adote Petz (adotepetz.com.br) — Brazilian market leader feature comparison
- CyberOptik — 20 Best Pet Adoption Websites of 2026 — aggregated feature survey
- MakerKit Next.js App Router best practices — project structure patterns

### Tertiary (LOW confidence)
- Supabase Image Transformations free tier availability — official docs suggest Pro Plan required; needs verification at project init

---

*Research completed: 2026-03-24*
*Ready for roadmap: yes*
