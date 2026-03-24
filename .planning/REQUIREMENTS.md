# Requirements: Me Leva

**Defined:** 2026-03-24
**Core Value:** Conectar animais resgatados a adotantes de forma organizada, com autonomia total da protetora

## v1 Requirements

Requirements for initial release (MVP). Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Next.js project initialized with App Router, Tailwind v4, and shadcn/ui
- [x] **FOUND-02**: Supabase project configured with PostgreSQL, Auth, and Storage
- [x] **FOUND-03**: Database schema created with `animals` and `interest_forms` tables
- [x] **FOUND-04**: Row Level Security (RLS) policies applied to all tables and storage bucket
- [x] **FOUND-05**: Supabase client utilities created for server and client contexts using `@supabase/ssr`

### Authentication

- [ ] **AUTH-01**: Admin can log in with email and password via Supabase Auth
- [ ] **AUTH-02**: Admin session persists across browser refresh
- [ ] **AUTH-03**: Admin routes are protected by `getUser()` validation (not just middleware)
- [ ] **AUTH-04**: Unauthenticated users are redirected to login page when accessing admin routes

### Animal Management (Admin)

- [ ] **ANIM-01**: Admin can create an animal with all required fields (nome, especie, raca, idade, porte, sexo, castrado, vacinado, descricao, status)
- [ ] **ANIM-02**: Admin can upload up to 5 photos per animal via Supabase Storage
- [ ] **ANIM-03**: Admin can edit any animal's data and photos
- [ ] **ANIM-04**: Admin can delete an animal (including orphaned Storage files)
- [ ] **ANIM-05**: Admin can change animal status (Disponivel, Urgente, Adotado)
- [ ] **ANIM-06**: Admin can view a list of all animals with status indicators

### Public Listing

- [ ] **LIST-01**: Public listing page displays all non-adopted animals in card format (photo, nome, especie, status)
- [ ] **LIST-02**: Users can filter animals by especie, porte, idade, and status
- [ ] **LIST-03**: Adopted animals are automatically hidden from public listing via RLS
- [ ] **LIST-04**: Listing page is server-rendered for SEO
- [ ] **LIST-05**: Urgent animals display a visually prominent badge

### Animal Profile

- [ ] **PROF-01**: Individual animal page shows full data and photo gallery
- [ ] **PROF-02**: Animal profile includes a button/link to the interest form
- [ ] **PROF-03**: Animal profile page has proper SEO metadata

### Interest Form

- [ ] **FORM-01**: Adopter can submit interest form (nome, telefone, mensagem) without creating an account
- [ ] **FORM-02**: Form includes honeypot field for spam protection
- [ ] **FORM-03**: Form includes LGPD consent checkbox linking to privacy policy
- [ ] **FORM-04**: Form data is validated client-side and server-side with shared Zod schema
- [ ] **FORM-05**: Admin can view all interest form submissions organized by animal

### Static Pages

- [ ] **PAGE-01**: "Sobre" institutional page with info about the protetora
- [ ] **PAGE-02**: Privacy policy page compliant with LGPD (data collected, purpose, retention)

### Security & Infrastructure

- [ ] **SEC-01**: HTTPS enforced via Vercel deployment
- [ ] **SEC-02**: WhatsApp number of protetora never exposed on public site
- [ ] **SEC-03**: Keep-alive mechanism configured to prevent Supabase free-tier pausing
- [x] **SEC-04**: `next/image` configured with Supabase `remotePatterns`

### Visual Identity

- [ ] **UI-01**: Responsive mobile-first layout
- [ ] **UI-02**: Color scheme based on roxo/rosa brand identity
- [x] **UI-03**: Consistent design system using shadcn/ui components

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: ONG receives email notification on new interest form submission
- **NOTF-02**: Configurable notification preferences

### Adoption Workflow

- **FLOW-01**: Kanban-style visual board for adoption process stages
- **FLOW-02**: Adoption history tracking per animal

### User Accounts

- **USER-01**: Adopter can create account with email verification
- **USER-02**: Adopter can track their interest form submissions
- **USER-03**: Rate limiting / suspicious behavior detection

### Integrations

- **INTG-01**: Auto-post to Instagram when new animal is registered
- **INTG-02**: Multi-admin roles with different permission levels

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | High complexity, MVP uses interest form + offline contact |
| Donation system | Payment integration out of scope; rescuer can link externally |
| Mobile app | Web-first; responsive design covers mobile use |
| OAuth / social login | Email+password sufficient for single admin |
| Swipe/Tinder interface | Over-engineered for an independent rescuer; card grid is sufficient |
| Petfinder syndication | API complexity; single local audience doesn't need it |
| WhatsApp direct button | Client explicitly wants number hidden from public |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| ANIM-01 | Phase 2 | Pending |
| ANIM-02 | Phase 2 | Pending |
| ANIM-03 | Phase 2 | Pending |
| ANIM-04 | Phase 2 | Pending |
| ANIM-05 | Phase 2 | Pending |
| ANIM-06 | Phase 2 | Pending |
| LIST-01 | Phase 3 | Pending |
| LIST-02 | Phase 3 | Pending |
| LIST-03 | Phase 3 | Pending |
| LIST-04 | Phase 3 | Pending |
| LIST-05 | Phase 3 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| PROF-03 | Phase 3 | Pending |
| FORM-01 | Phase 4 | Pending |
| FORM-02 | Phase 4 | Pending |
| FORM-03 | Phase 4 | Pending |
| FORM-04 | Phase 4 | Pending |
| FORM-05 | Phase 4 | Pending |
| PAGE-01 | Phase 5 | Pending |
| PAGE-02 | Phase 5 | Pending |
| SEC-01 | Phase 5 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 5 | Pending |
| SEC-04 | Phase 1 | Complete |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initial definition*
