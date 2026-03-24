# Roadmap: Me Leva

## Overview

Five phases that build a pet adoption platform from the ground up. Phase 1 lays the secure foundation — project scaffolding, database schema with RLS, and admin authentication. Phase 2 gives the admin the ability to manage animals and photos. Phase 3 opens the public-facing catalog with filtering and individual animal profiles. Phase 4 closes the adoption loop with the interest form and admin inbox. Phase 5 adds static institutional pages and production hardening before launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js + Supabase project configured with database schema, RLS policies, and working admin authentication
- [ ] **Phase 2: Admin Panel** - Admin can create, edit, delete, and manage animals with multi-photo upload and status control
- [ ] **Phase 3: Public Site** - Public animal listing with filters and individual animal profile pages, server-rendered for SEO
- [ ] **Phase 4: Interest Form** - Adopters can submit interest forms without an account; admin can view all submissions organized by animal
- [ ] **Phase 5: Static Pages + Launch** - Institutional and privacy policy pages complete; production hardening verified for go-live

## Phase Details

### Phase 1: Foundation
**Goal**: The secure technical foundation exists — project runs locally, database schema with RLS is live, and admin can log in and access protected routes
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, SEC-02, SEC-04, UI-03
**Success Criteria** (what must be TRUE):
  1. Admin can navigate to `/login`, enter email and password, and land on the admin dashboard
  2. Admin session persists after a full browser refresh without re-login
  3. Navigating directly to any `/admin/*` URL while logged out redirects to `/login`
  4. Supabase anon key queries against `animals` and `interest_forms` return only allowed rows (RLS verified from a logged-out browser, not the Dashboard SQL editor)
  5. WhatsApp number of the protetora appears nowhere in any public-facing page or source code
**Plans:** 2/3 plans executed

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 16 project with Tailwind v4, shadcn/ui, Supabase client utilities, and next.config.ts
- [x] 01-02-PLAN.md — Database schema (animals, animal_photos, interest_forms) with RLS policies and TypeScript types
- [x] 01-03-PLAN.md — Auth flow: proxy.ts, login page, admin layout with getUser() check, and dashboard

**UI hint**: yes

### Phase 2: Admin Panel
**Goal**: Admin can fully manage the animal catalog — create, edit, delete animals with all fields and up to 5 photos, and change adoption status
**Depends on**: Phase 1
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06
**Success Criteria** (what must be TRUE):
  1. Admin can create a new animal by filling all required fields (nome, especie, raca, idade, porte, sexo, castrado, vacinado, descricao, status) and the animal appears in the admin list
  2. Admin can upload up to 5 photos during animal creation or editing, and photos are visible on the admin detail view
  3. Admin can change an animal's status to Disponivel, Urgente, or Adotado from the list or detail view
  4. Admin can delete an animal and no orphaned files remain in Supabase Storage afterward
  5. Admin list view shows all animals with a status indicator for each
**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Zod schema, server actions, slug utility, sidebar fix, dashboard stats
- [ ] 02-02-PLAN.md — Animal list page with table, status badges, pagination, and inline actions
- [ ] 02-03-PLAN.md — Animal form with photo upload, create and edit pages

**UI hint**: yes

### Phase 3: Public Site
**Goal**: The public-facing catalog is live — visitors can browse animals, filter by multiple criteria, and view a full individual animal profile
**Depends on**: Phase 2
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, PROF-01, PROF-02, PROF-03, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. Visitor can see a grid of animal cards (photo, nome, especie, status) at the public listing URL without logging in
  2. Visitor can filter the listing by especie, porte, idade, and status and the results update without a full page reload
  3. Animals with status Adotado do not appear in the public listing under any circumstance
  4. Animals with status Urgente display a visually prominent badge in the listing
  5. Visitor can open an individual animal page and see the full photo gallery, all data fields, and a link to the interest form; the page has proper SEO metadata visible in the HTML head
**Plans**: TBD
**UI hint**: yes

### Phase 4: Interest Form
**Goal**: Adopters can express interest in a specific animal without creating an account; the protetora can see all submissions organized by animal in the admin panel
**Depends on**: Phase 3
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05
**Success Criteria** (what must be TRUE):
  1. Visitor can submit the interest form (nome, telefone, mensagem) from an animal profile page without registering or logging in
  2. Submitting a form with the honeypot field populated silently fails — no submission is stored and no error is shown to the visitor
  3. Visitor cannot submit the form without checking the LGPD consent checkbox; the checkbox links to the privacy policy page
  4. A form submission with invalid data (e.g., missing nome, invalid phone) is rejected with visible field-level errors before reaching the server
  5. Admin can open the submissions view and see all interest forms grouped by animal, including nome, telefone, and mensagem for each
**Plans**: TBD
**UI hint**: yes

### Phase 5: Static Pages + Launch
**Goal**: The platform is ready for public launch — institutional and LGPD pages exist, production infrastructure is verified, and the Supabase keep-alive mechanism prevents free-tier pausing
**Depends on**: Phase 4
**Requirements**: PAGE-01, PAGE-02, SEC-01, SEC-03
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate to the "Sobre" page and read information about the protetora
  2. Visitor can navigate to the privacy policy page and find the data collected, its purpose, and retention period (LGPD compliance)
  3. The deployed site loads over HTTPS with no mixed-content warnings
  4. After 7 days of zero admin activity, the Supabase project does not pause (keep-alive mechanism confirmed active)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/3 | In Progress|  |
| 2. Admin Panel | 0/3 | Not started | - |
| 3. Public Site | 0/? | Not started | - |
| 4. Interest Form | 0/? | Not started | - |
| 5. Static Pages + Launch | 0/? | Not started | - |
