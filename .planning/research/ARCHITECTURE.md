# Architecture Research

**Domain:** Pet adoption catalog with public listing + private admin panel
**Researched:** 2026-03-24
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Vercel (Edge + CDN)                        │
├─────────────────────────────────┬────────────────────────────────┤
│        Public Site              │         Admin Panel            │
│  (anon, SSR + SSG, SEO-first)  │  (authenticated, CSR-optional) │
│  ┌──────────┐  ┌─────────────┐  │  ┌──────────────────────────┐ │
│  │  /        │  │ /animais/   │  │  │ /admin/animais           │ │
│  │  /animais │  │ [slug]      │  │  │ /admin/animais/novo      │ │
│  │  /sobre   │  │             │  │  │ /admin/formularios       │ │
│  │  /privaci-│  │             │  │  │                          │ │
│  │  dade     │  │             │  │  │                          │ │
│  └──────────┘  └─────────────┘  │  └──────────────────────────┘ │
├─────────────────────────────────┴────────────────────────────────┤
│                    Next.js Middleware (middleware.ts)             │
│              Reads Supabase session cookie → guard /admin/*      │
├──────────────────────────────────────────────────────────────────┤
│                        Supabase Platform                         │
│  ┌─────────────┐  ┌───────────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL │  │    Supabase Auth  │  │ Supabase Storage │   │
│  │  (tables +  │  │  (email+password) │  │  (pet-photos     │   │
│  │   RLS)      │  │  (JWT cookies)    │  │   bucket)        │   │
│  └─────────────┘  └───────────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public route group `(public)` | Renders pet catalog, individual profiles, static pages (Sobre, LGPD) | Next.js Server Components, SSR/SSG |
| Admin route group `(admin)` | CRUD for animals, photo uploads, view interest forms | Next.js Server Components + Client Components for forms/uploads |
| `middleware.ts` | Guards `/admin/*` — redirects unauthenticated users to `/login` | `@supabase/ssr` + `supabase.auth.getClaims()` (NOT `getSession`) |
| `lib/supabase/` | Creates typed server/client Supabase instances | `@supabase/ssr` createServerClient / createBrowserClient |
| Supabase `animals` table | Stores all pet data with RLS: anon can SELECT, authenticated can INSERT/UPDATE/DELETE | PostgreSQL table + RLS policies |
| Supabase `interest_forms` table | Stores adopter submissions — anon INSERT, authenticated SELECT | PostgreSQL table + RLS policies |
| Supabase Storage `pet-photos` bucket | Stores pet images — public GET, authenticated INSERT/DELETE | Storage bucket + RLS on storage.objects |

## Recommended Project Structure

```
me-leva/
├── app/
│   ├── (public)/                   # Public site — no auth required
│   │   ├── layout.tsx              # Public layout (header, footer, brand colors)
│   │   ├── page.tsx                # Home: hero + animal listing
│   │   ├── animais/
│   │   │   ├── page.tsx            # Animal listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Individual animal profile + interest form
│   │   ├── sobre/
│   │   │   └── page.tsx            # Institutional "Sobre" page
│   │   └── privacidade/
│   │       └── page.tsx            # LGPD privacy policy
│   ├── (admin)/                    # Admin panel — auth required (enforced by middleware)
│   │   ├── layout.tsx              # Admin layout (sidebar/topbar, session check)
│   │   ├── admin/
│   │   │   ├── page.tsx            # Admin dashboard / quick stats
│   │   │   ├── animais/
│   │   │   │   ├── page.tsx        # Animal list with edit/delete actions
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx    # New animal form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Edit animal form
│   │   │   └── formularios/
│   │   │       ├── page.tsx        # List all interest forms
│   │   │       └── [id]/
│   │   │           └── page.tsx    # View single interest form
│   └── login/
│       └── page.tsx                # Login page (email + password)
├── components/
│   ├── public/
│   │   ├── AnimalCard.tsx          # Card used in listing (photo, name, species, status)
│   │   ├── AnimalGrid.tsx          # Responsive grid + filter bar
│   │   ├── AnimalFilters.tsx       # Species / size / age / status filter UI
│   │   ├── AnimalGallery.tsx       # Photo gallery on animal profile
│   │   └── InterestForm.tsx        # Adoption interest form with honeypot
│   ├── admin/
│   │   ├── AnimalForm.tsx          # Create/edit animal (all fields)
│   │   ├── PhotoUploader.tsx       # Multi-photo upload (max 5) with preview
│   │   ├── StatusBadge.tsx         # Disponivel / Urgente / Adotado badge
│   │   └── FormSubmissionRow.tsx   # Row in interest forms table
│   └── ui/                         # Shared primitives (Button, Input, etc.)
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # createServerClient (Server Components, Server Actions)
│   │   ├── client.ts               # createBrowserClient (Client Components)
│   │   └── types.ts                # Generated Supabase TypeScript types (supabase gen types)
│   └── utils/
│       ├── honeypot.ts             # Honeypot field validation logic
│       └── slugify.ts              # Generate URL slug from animal name+id
├── middleware.ts                   # Auth guard for /admin/* routes
└── supabase/
    └── migrations/                 # SQL migration files (applied via Supabase CLI)
        ├── 001_create_animals.sql
        ├── 002_create_interest_forms.sql
        ├── 003_rls_animals.sql
        ├── 004_rls_interest_forms.sql
        └── 005_storage_pet_photos.sql
```

### Structure Rationale

- **`(public)` and `(admin)` route groups:** Route groups (parenthesised folders) let each section have its own `layout.tsx` without contributing to the URL. Public routes get a brand-coloured header/footer; admin routes get a sidebar — completely separate HTML roots. URL paths remain `/animais`, `/admin/animais`, etc.
- **`app/login/` outside both groups:** The login page must be reachable without auth. Placing it outside `(admin)` prevents the admin layout from wrapping it.
- **`components/public/` vs `components/admin/`:** Separates concerns. Public components are Server-Component-friendly (no client state needed for display). Admin components are Client Components because they handle uploads and mutations.
- **`lib/supabase/server.ts` + `client.ts`:** The `@supabase/ssr` package requires two different constructors. Having separate files prevents accidentally using the browser client in Server Components (which would expose the anon key in SSR context without cookie handling).
- **`supabase/migrations/`:** Tracking SQL as migration files (via Supabase CLI) makes schema changes reproducible and reviewable in git.

## Data Model

### Tables

#### `animals`

```sql
create table animals (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,          -- URL-friendly identifier
  species     text not null,                 -- 'cachorro' | 'gato' | 'outro'
  breed       text,
  age_months  int,                           -- age stored in months for flexible display
  size        text,                          -- 'pequeno' | 'medio' | 'grande'
  sex         text not null,                 -- 'macho' | 'femea'
  neutered    boolean not null default false,
  vaccinated  boolean not null default false,
  description text,
  status      text not null default 'disponivel',  -- 'disponivel' | 'urgente' | 'adotado'
  photo_urls  text[] not null default '{}', -- ordered array of Supabase Storage public URLs (max 5)
  cover_photo text,                          -- first item of photo_urls, denormalized for fast listing
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

Notes:
- `slug` is derived from `name` + short `id` suffix (e.g., `rex-ab12`) to guarantee uniqueness.
- `photo_urls` stored as an ordered array on the row — avoids a separate `animal_photos` join table for MVP scale. Max 5 photos keeps the array bounded.
- `cover_photo` is a denormalized copy of `photo_urls[0]` for listing queries — avoids array indexing in SQL filters.
- `status = 'adotado'` is the soft-delete for public listing (filtered out by default in public queries).

#### `interest_forms`

```sql
create table interest_forms (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid not null references animals(id) on delete cascade,
  name        text not null,
  phone       text not null,
  message     text,
  created_at  timestamptz not null default now()
);
```

Notes:
- No `user_id` — adopters do not have accounts (MVP decision).
- `on delete cascade` ensures form submissions are removed when an animal record is deleted.
- Phone stored as plain text — no normalization in MVP.

### Relationships

```
animals (1) ──< interest_forms (many)
  animal_id FK → animals.id
```

### Indexes

```sql
create index on animals(status);         -- public listing filter
create index on animals(species);        -- public listing filter
create index on animals(slug);           -- profile page lookup
create index on interest_forms(animal_id); -- admin view submissions per animal
```

## Auth Flow

### Login Flow

```
Admin visits /admin/*
       ↓
middleware.ts intercepts request
       ↓
createServerClient reads session cookie
       ↓
supabase.auth.getClaims() ← sends request to Supabase Auth server to revalidate
       ↓
    [no valid session]                [valid session]
         ↓                                  ↓
  redirect(/login)              allow request to proceed
         ↓
Admin fills email + password at /login
       ↓
supabase.auth.signInWithPassword() (Server Action)
       ↓
Supabase issues JWT, @supabase/ssr writes it to HttpOnly cookie
       ↓
redirect(/admin)
```

### Session Refresh

```
Any /admin/* request
       ↓
middleware.ts runs createServerClient with cookie adapter
       ↓
supabase.auth.getClaims() triggers token refresh if expired
       ↓
Response cookies updated with new JWT (middleware writes back)
       ↓
Server Component receives fresh session
```

**Security note:** The official Supabase SSR docs specify `getClaims()` (not `getSession()`) inside server code and middleware, because `getSession()` does not revalidate the token against the Auth server. An expired or spoofed cookie would pass `getSession()` but fail `getClaims()`.

### Middleware Pattern

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

## Image Upload Pipeline

### Upload Flow (Admin)

```
Admin selects up to 5 photos in PhotoUploader component
       ↓
Client Component calls Server Action: uploadAnimalPhoto(formData)
       ↓
Server Action uses createServerClient (authenticated session)
       ↓
supabase.storage.from('pet-photos').upload(
  `animals/{animal_id}/{timestamp}-{filename}`,
  file,
  { contentType: file.type, upsert: false }
)
       ↓
Supabase returns public URL via getPublicUrl()
       ↓
Server Action appends URL to animals.photo_urls array
       ↓
Component shows preview with new image
```

### Storage Bucket: `pet-photos`

- **Bucket type:** Public bucket (files served via CDN URL without signed tokens)
- **Path convention:** `animals/{animal_id}/{timestamp}-{original_name}`
- **Max files per animal:** 5 (enforced in application logic, not at storage layer)

### Storage RLS Policies

```sql
-- Anyone can read (public bucket — images shown to all visitors)
create policy "Public read pet photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'pet-photos');

-- Only authenticated admin can upload
create policy "Authenticated upload pet photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'pet-photos');

-- Only authenticated admin can delete
create policy "Authenticated delete pet photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'pet-photos');
```

### Database RLS Policies

```sql
-- ANIMALS TABLE
alter table animals enable row level security;

-- Public: anyone can read non-adopted animals
create policy "Public read available animals"
on animals for select
to anon, authenticated
using (status != 'adotado');

-- Admin: authenticated can read all animals (including adopted)
create policy "Admin read all animals"
on animals for select
to authenticated
using (true);

-- Admin: authenticated can insert, update, delete
create policy "Admin write animals"
on animals for all
to authenticated
using (true)
with check (true);

-- INTEREST_FORMS TABLE
alter table interest_forms enable row level security;

-- Public: anyone can submit a form (no account required)
create policy "Anyone can submit interest form"
on interest_forms for insert
to anon, authenticated
with check (true);

-- Admin: only authenticated can read submissions
create policy "Admin read interest forms"
on interest_forms for select
to authenticated
using (true);

-- Admin: authenticated can delete forms
create policy "Admin delete interest forms"
on interest_forms for delete
to authenticated
using (true);
```

Note on the `animals` SELECT policies: PostgreSQL evaluates policies with OR logic when multiple SELECT policies exist for a role. The "Public read" policy restricts `anon` to non-adopted records. The `authenticated` role gets the "Admin read all" policy. This is correct because there is only one admin account — no multi-user permission tiering is needed.

## Architectural Patterns

### Pattern 1: Server Actions for Mutations

**What:** Form submissions (interest form, animal create/edit) handled via Next.js Server Actions rather than API Route Handlers.

**When to use:** Any mutation triggered from a form or button in the MVP.

**Trade-offs:** Server Actions run on the server (no client API key exposure), integrate naturally with React forms, support progressive enhancement, and eliminate a round-trip to a custom `/api/*` handler. Downside: slightly harder to test in isolation vs. an HTTP endpoint.

**Example:**

```typescript
// app/(public)/animais/[slug]/actions.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'

export async function submitInterestForm(formData: FormData) {
  // Honeypot check — bots fill hidden fields, humans don't
  if (formData.get('website') !== '') return { error: 'spam' }

  const supabase = await createServerClient()
  await supabase.from('interest_forms').insert({
    animal_id: formData.get('animal_id') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
  })
}
```

### Pattern 2: RSC for Public Pages (SEO)

**What:** Public animal listing and profile pages are React Server Components using `fetch` / Supabase server client. No client JS required for rendering content.

**When to use:** All public read-only pages (`/animais`, `/animais/[slug]`, `/sobre`, `/privacidade`).

**Trade-offs:** Full HTML delivered on first byte — excellent for SEO crawlers. Filter interactivity on the listing page requires a small Client Component island (`AnimalFilters`) that updates URL search params; the page itself re-renders on the server with new params.

**Example:**

```typescript
// app/(public)/animais/page.tsx — Server Component
import { createServerClient } from '@/lib/supabase/server'

export default async function AnimaisPage({
  searchParams,
}: {
  searchParams: { species?: string; size?: string; status?: string }
}) {
  const supabase = await createServerClient()
  let query = supabase
    .from('animals')
    .select('id, name, slug, species, size, status, cover_photo')
    .neq('status', 'adotado')

  if (searchParams.species) query = query.eq('species', searchParams.species)
  if (searchParams.size)    query = query.eq('size', searchParams.size)

  const { data: animals } = await query.order('created_at', { ascending: false })

  return <AnimalGrid animals={animals ?? []} />
}
```

### Pattern 3: Honeypot on Public Form

**What:** Hidden `<input>` field invisible to human users but filled by bots. Server Action rejects submission if the field is non-empty.

**When to use:** The interest form (the only public write endpoint).

**Trade-offs:** Zero UX friction for humans. Not foolproof against sophisticated bots, but sufficient for a small NGO site without needing reCAPTCHA complexity.

**Example:**

```typescript
// components/public/InterestForm.tsx (relevant field only)
<input
  name="website"
  type="text"
  autoComplete="off"
  tabIndex={-1}
  aria-hidden="true"
  style={{ display: 'none' }}
/>
```

## Data Flow

### Public: Visit Animal Profile + Submit Interest Form

```
User visits /animais/rex-ab12
       ↓
Next.js Server Component fetches animals WHERE slug = 'rex-ab12' (anon RLS)
       ↓
Supabase returns animal row + photo_urls array
       ↓
Page renders with full HTML (SEO-ready)
       ↓
User fills InterestForm + submits
       ↓
Server Action: honeypot check → INSERT into interest_forms (anon RLS allows insert)
       ↓
User sees success message (no redirect needed)
```

### Admin: Upload Photos for an Animal

```
Admin opens /admin/animais/[id]
       ↓
Server Component fetches animal (authenticated RLS, returns all statuses)
       ↓
Admin selects files in PhotoUploader (Client Component)
       ↓
Server Action: upload files to storage 'pet-photos/animals/{id}/*'
       ↓
Supabase returns public CDN URLs
       ↓
Server Action: UPDATE animals SET photo_urls = array_append(photo_urls, url)
       ↓
revalidatePath('/admin/animais/[id]') → page re-renders with new photos
```

### Admin: Change Animal Status to "Adotado"

```
Admin clicks "Marcar como Adotado" in animal form
       ↓
Server Action: UPDATE animals SET status = 'adotado'
       ↓
RLS public SELECT policy (status != 'adotado') automatically hides animal from public
       ↓
Animal disappears from /animais listing on next visit (no extra query needed)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 animals / 1k monthly visits | Current design is sufficient. Supabase free tier handles this easily. |
| 500-5k animals / 10k monthly visits | Add `generateStaticParams` to pre-render high-traffic animal profiles at build time. Implement ISR (`revalidate`) for the listing page. |
| 5k+ animals / 100k+ visits | Move to Supabase Pro. Add full-text search (Postgres `tsvector`). Consider separate read replica for public queries. |

### Scaling Priorities

1. **First bottleneck:** Image delivery — Supabase Storage CDN handles this adequately. If needed, route images through Vercel's Image Optimization (`next/image`) for automatic WebP conversion and resizing.
2. **Second bottleneck:** Animal listing query — add composite index `(status, created_at)` and cursor-based pagination if list grows beyond 100 animals.

## Anti-Patterns

### Anti-Pattern 1: Using `getSession()` in Middleware

**What people do:** Call `supabase.auth.getSession()` in `middleware.ts` to check authentication.

**Why it's wrong:** `getSession()` reads the session from the cookie without revalidating it with the Auth server. A tampered or expired cookie will pass the check, allowing unauthorized access to admin routes.

**Do this instead:** Always call `supabase.auth.getUser()` (or `getClaims()` in newer SDK versions) inside middleware and server code — it makes a network request to Supabase Auth to verify the token is still valid.

### Anti-Pattern 2: Storing Images as Base64 in the Database

**What people do:** Convert uploaded images to base64 strings and store them in a `text` column.

**Why it's wrong:** Bloats PostgreSQL rows, destroys query performance, bypasses CDN delivery, and Supabase free-tier row size limits apply.

**Do this instead:** Upload files to Supabase Storage, store only the public CDN URL in the database (as done in `animals.photo_urls`).

### Anti-Pattern 3: Using the Service Role Key in Client Components

**What people do:** Set `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_*` environment variable so Client Components can perform admin operations.

**Why it's wrong:** The service role key bypasses all RLS policies and is visible to anyone who inspects the browser bundle. This exposes the entire database to public write/delete.

**Do this instead:** All admin mutations go through Server Actions (which run on the server). Client Components receive results and display UI only. The service role key, if ever needed, lives exclusively in Server Actions or API Route Handlers.

### Anti-Pattern 4: Disabling RLS to "Fix" Permission Errors

**What people do:** When a query fails due to an RLS policy violation, disable RLS on the table as a quick fix.

**Why it's wrong:** This exposes all rows to the `anon` role — anyone with the public Supabase URL can read, insert, or delete records via the auto-generated REST API.

**Do this instead:** Read the RLS error message carefully, identify which policy is missing (SELECT vs INSERT vs UPDATE vs DELETE), and add the specific policy. Test with the Supabase dashboard's RLS policy simulator.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | `@supabase/ssr` cookie-based sessions, `createServerClient` in middleware + Server Components | Use `getUser()` not `getSession()` in server code |
| Supabase Storage | Server Action uploads via `supabase.storage.from().upload()`, public CDN URLs stored in DB | Bucket must be public; RLS on `storage.objects` for write control |
| Vercel | Deploy via git push; automatic SSL, edge middleware support | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public pages ↔ Supabase | Supabase anon client (Server Component) | RLS enforces read-only, non-adopted animals only |
| Admin pages ↔ Supabase | Supabase authenticated client (Server Action / Server Component) | RLS allows full CRUD |
| Client Components ↔ Server | Server Actions (mutations), Server Component props (reads) | No direct Supabase calls from Client Components |
| Public form ↔ Server Action | `<form action={serverAction}>` with honeypot field | No auth required; RLS allows anon INSERT |

## Environment Variables

```bash
# Required in Vercel + local .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Only if needed for admin migrations
```

## Sources

- [Next.js Route Groups — Official Docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — HIGH confidence (official, updated 2026-03-20)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence (official Supabase docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence (official Supabase docs)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — HIGH confidence (official Supabase docs)
- [Next.js App Router Best Practices 2025 — MakerKit](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure) — MEDIUM confidence (community, cross-referenced with official)
- [Secure File Uploads with Signed URLs — Supabase Discussion](https://github.com/orgs/supabase/discussions/26424) — MEDIUM confidence (community/official repo)

---
*Architecture research for: Pet adoption catalog (Me Leva) — Next.js App Router + Supabase*
*Researched: 2026-03-24*
