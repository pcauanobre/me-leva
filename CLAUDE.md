## Project

**Me Leva**

Plataforma web (responsiva para desktop e mobile) de adocao de animais para uma protetora independente em Fortaleza. Funciona como um catalogo publico de pets disponiveis, com painel administrativo privado para gerenciar cadastros, fotos e formularios de interesse recebidos. Usuarios podem se registrar e submeter animais para aprovacao. Substitui a divulgacao fragmentada via Instagram por um canal proprio e organizado.

**Core Value:** Conectar animais resgatados a adotantes de forma organizada, com autonomia total da protetora — sem depender de redes sociais.

### Constraints

- **Stack**: Next.js 16 + Supabase (PostgreSQL, Auth, Storage) + MUI + Tailwind CSS v4 + Vercel
- **Timeline**: MVP em ~3 semanas
- **Budget**: Zero — usando tiers gratuitos de Supabase e Vercel
- **LGPD**: Obrigatorio ter politica de privacidade por coletar dados pessoais
- **Seguranca**: RLS no banco, honeypot nos formularios, HTTPS, numero da protetora nunca publico

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.1 | Full-stack React framework (App Router, Turbopack) |
| React | 19.2.x | UI layer |
| TypeScript | 5.x | Type safety |
| MUI (Material UI) | 7.x | Component library (replaces shadcn/ui) |
| @emotion/react + styled | 11.x | CSS-in-JS for MUI |
| Tailwind CSS | v4.x | Utility CSS (used alongside MUI) |
| Supabase | Latest | PostgreSQL + Auth + Storage |
| @supabase/ssr | 0.9.x | SSR-safe Supabase client with cookie sessions |
| Zod | 4.x | Schema validation (client + server) |
| react-hook-form | 7.x | Form state management |
| @hookform/resolvers | 5.x | Bridge RHF and Zod |
| @mui/x-charts | 9.x | Charts (bar, pie) for the admin Analytics dashboard |
| ua-parser-js | 2.x | Server-side User-Agent parsing for analytics

### Key Patterns

- **proxy.ts** (not middleware.ts): Next.js 16 renamed middleware to proxy. Export must be named `proxy`.
- **Server Components**: Public pages use RSC for SEO. No `component={Link}` prop on MUI components in Server Components — wrap `<Link>` around instead.
- **Server Actions**: All mutations (create/edit/delete animals, submit forms, upload photos) use Server Actions.
- **Zod v4**: Uses `.issues` (not `.errors`), `{ error: "..." }` (not `{ required_error: "..." }`).
- **Type assertions**: Supabase queries use `as Animal | null` type assertions since we don't use the full Database generic.
- **MUI + Tailwind**: MUI handles component styling; Tailwind handles layout utilities in `globals.css`.

## Architecture

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (ThemeRegistry, fonts)
│   ├── (public)/                     # Public site (no auth)
│   │   ├── layout.tsx                # Header + Footer
│   │   ├── page.tsx                  # Home (hero + featured animals)
│   │   ├── animais/page.tsx          # Animal listing with filters
│   │   ├── animais/[slug]/page.tsx   # Animal profile + interest form
│   │   ├── adotar/page.tsx           # Comprehensive adoption form (wizard)
│   │   ├── sobre/page.tsx            # Institutional page
│   │   └── privacidade/page.tsx      # LGPD privacy policy
│   ├── (admin)/                      # Admin panel (auth required)
│   │   ├── layout.tsx                # Auth guard + AdminShell
│   │   ├── AdminShell.tsx            # Sidebar navigation (client component)
│   │   └── admin/
│   │       ├── page.tsx              # Dashboard with stats
│   │       ├── animais/page.tsx      # Animal list table
│   │       ├── animais/novo/page.tsx # Create animal form
│   │       ├── animais/[id]/page.tsx # Edit animal + photo upload
│   │       ├── formularios/page.tsx  # Interest forms viewer
│   │       ├── adocao/              # Adoption forms management
│   │       │   ├── page.tsx         # Adoption forms list + filters
│   │       │   └── [id]/page.tsx    # Adoption form detail + edit
│   │       └── analytics/           # Visitor journey analytics
│   │           ├── page.tsx         # Funnel, KPIs, sessions table, drill-down
│   │           ├── actions.ts       # deleteAnalyticsSession, purgeAnalyticsOlderThan
│   │           ├── AnalyticsCharts.tsx   # MUI X chart components (client)
│   │           ├── DateRangeFilter.tsx
│   │           ├── LiveSessions.tsx
│   │           ├── RecentSessionsTable.tsx
│   │           └── SessionTimelineDialog.tsx
│   ├── api/
│   │   └── analytics/
│   │       ├── event/route.ts       # POST: insert analytics_events
│   │       ├── session/route.ts     # POST: upsert analytics_sessions
│   │       └── live/route.ts        # GET: live session count (admin only)
│   └── login/                        # Login page (outside route groups)
├── components/
│   ├── analytics/
│   │   └── AnalyticsProvider.tsx     # Mounts in (public) and (user) layouts; tracks page_view + form abandon
│   └── public/                       # Reusable public components
│       ├── PublicHeader.tsx
│       ├── PublicFooter.tsx
│       ├── AnimalCard.tsx
│       ├── AnimalFilters.tsx
│       ├── AnimalGallery.tsx
│       ├── InterestForm.tsx          # Dead code (kept for /admin/formularios history)
│       ├── AdoptionForm.tsx          # Multi-step adoption form wizard
│       └── AdoptionFormSteps/        # Step sub-components
│           ├── ContactStep.tsx
│           ├── AdopterDataStep.tsx
│           ├── AnimalPreferenceStep.tsx
│           └── InterviewStep.tsx
├── lib/
│   ├── analytics/
│   │   ├── client.ts                 # Browser tracking helpers (track, trackPetClick, trackFormStep, ...)
│   │   └── server.ts                 # parseRequest, upsertSession, insertEvent (uses ua-parser-js)
│   ├── supabase/
│   │   ├── server.ts                 # createServerClient (Server Components, Server Actions)
│   │   ├── client.ts                 # createBrowserClient (Client Components)
│   │   └── types.ts                  # Animal, InterestFormRow, AdoptionFormRow, Analytics*, Database types
│   ├── schemas.ts                    # Zod schemas (animal, interest form, adoption form)
│   ├── adoptionQuestions.ts          # 63 interview questions + groupings constant
│   ├── theme.ts                      # MUI theme (purple/pink brand)
│   ├── ThemeRegistry.tsx             # MUI + Emotion provider
│   └── utils/
│       └── slugify.ts                # URL slug generation
└── proxy.ts                          # Auth guard for /admin/* and /login redirect
```

### Database Tables

- **animals**: id, name, slug, species, breed, age_months, size, sex, neutered, vaccinated, description, status, photo_urls[], cover_photo, submitted_by, submission_status, admin_feedback, adopted_at, created_at, updated_at
- **interest_forms**: id, animal_id (FK), name, phone, message, created_at
- **profiles**: id (FK auth.users), full_name, phone, role ('admin'|'user'), created_at, updated_at
- **adoption_forms**: id, email, whatsapp, full_name, social_media, address, age, marital_status, education_level, profession, animal_species, animal_sex, animal_age, animal_coat, interview_answers (JSONB), animal_id (FK nullable), status ('pendente'|'aprovado'|'rejeitado'), admin_notes, reviewed_at, created_at, updated_at
- **site_settings**: key (PK), value
- **analytics_sessions**: id (TEXT PK, client UUIDv4 in localStorage), user_id (FK auth.users nullable), ip_address (INET), user_agent, device_type ('mobile'|'tablet'|'desktop'|'bot'), browser, os, referrer, utm_source, utm_medium, utm_campaign, country, city, is_authenticated, first_seen_at, last_seen_at, ended_at
- **analytics_events**: id, session_id (FK analytics_sessions), user_id (FK auth.users nullable), event_type (enum), path, animal_id (FK animals nullable), form_step, duration_ms, metadata (JSONB), created_at. Enum values: page_view, pet_click, pet_view_detail, adoption_form_open, adoption_form_step, adoption_form_submit, adoption_form_abandon, account_signup_start, account_signup_complete, login, logout, donation_form_submit, outbound_click, error

### RLS Policies

- animals: anon SELECT (approved, not adopted OR adopted within 3 days); authenticated sees own + admin sees all
- interest_forms: anon/authenticated INSERT; admin SELECT/DELETE
- adoption_forms: anon/authenticated INSERT; admin SELECT/UPDATE/DELETE
- profiles: users read/update own; admin reads all
- analytics_sessions / analytics_events: anon/authenticated INSERT (sessions also UPDATE for upsert); admin SELECT/DELETE only
- storage.objects (pet-photos): public read; authenticated upload; admin delete
- **is_admin()**: security definer function — used everywhere for role checks (bypasses RLS)

## Conventions

- **Language**: UI text in Portuguese (pt-BR) with **correct accents always** (não, você, formulário, solicitação, descrição, espécie, raça, adoção, catálogo, disponível, etc). Database enum values (disponivel, adotado, femea, medio) do NOT use accents — they are internal keys. Code (variables, functions, comments) in English.
- **Route groups**: `(public)` for visitor-facing, `(admin)` for authenticated pages.
- **MUI in Server Components**: Never pass `component={Link}` to MUI. Wrap `<Link>` around MUI element instead.
- **Supabase queries**: Use type assertions (`as Animal | null`) for `.select("*").single()` results.
- **Server Actions**: All mutations go through Server Actions in `actions.ts` files colocated with the page.
- **Photo storage path**: `animals/{animal_id}/{timestamp}-{random}.{ext}` in `pet-photos` bucket.
- **Status values**: "disponivel" | "adotado" — adotado stays visible on public site for 3 days (grayed out), then hidden. Always visible in admin.
- **Adopted grace period**: When status changes to "adotado", `adopted_at` is set. Public queries include adopted animals where `adopted_at > now() - 3 days`.
- **Dynamic age**: `age_months` is the age at registration time. Display age is computed as `age_months + months_since(created_at)` via `computeCurrentAge()`.
- **ConfirmDialog**: Always use `src/components/ConfirmDialog.tsx` for confirmations. Never use native `confirm()`.
- **Auth role check**: Always use `supabase.rpc("is_admin")` instead of querying profiles table directly (RLS issue).
- **Profile creation**: Handled by database trigger `handle_new_user()` on `auth.users` INSERT. Pass `full_name` and `phone` via `signUp({ options: { data: {...} } })`. Login has a safety net that creates missing profiles.
- **Email confirmation**: Disabled in production Supabase dashboard. No SMTP configured.
- **Responsividade**: Todo componente DEVE funcionar em mobile (< 600px). Usar breakpoints responsivos (`sx={{ p: { xs: 2, sm: 4 } }}`). Tabelas devem ter `minWidth` + scroll horizontal. Stacks devem usar `direction={{ xs: "column", sm: "row" }}` quando apropriado. Sempre pensar mobile-first ao criar features.

## Self-Updating Instructions

**Claude must keep this CLAUDE.md up to date as the project evolves:**

1. **After adding new routes/pages**: Update the Architecture tree.
2. **After changing the stack** (adding/removing packages): Update the Technology Stack table.
3. **After discovering a new pattern/convention**: Add it to Conventions.
4. **After schema changes**: Update Database Tables section.
5. **After adding new components**: Update the Architecture tree.

When in doubt, update CLAUDE.md. This file is the single source of truth for the project's current state and conventions.
