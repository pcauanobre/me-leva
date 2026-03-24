# Feature Research

**Domain:** Pet adoption catalog — independent animal rescuer, Brazil
**Researched:** 2026-03-24
**Confidence:** HIGH (core features), MEDIUM (differentiators), HIGH (anti-features)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that visitors assume exist on any adoption platform. Missing these = the platform feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Pet listing with photos | Primary reason to visit the site; no photo = no adoption | LOW | At least 1 photo required per listing; multi-photo preferred |
| Animal profile page | Users want full details before expressing interest | LOW | Name, species, breed, age, size, sex, neutered, vaccinated, description |
| Species/size/age filters | Every major platform (Viu Meu Pet, Adote Petz, Petfinder) offers this | MEDIUM | Filters for species, size, age, availability status |
| Adoption interest form | The conversion action — without this there is no flow | LOW | No account required; name, phone, message suffices for MVP |
| Mobile-responsive layout | Most Brazilian users browse from phones; non-responsive = unusable | LOW | CSS only, no native app needed |
| Availability status indicator | Visitors need to know what is still available before they get attached | LOW | Available / Urgent / Adopted; hide adopted from public listing |
| "About" institutional page | Builds trust with the rescuer; users want to know who they are trusting the animal with | LOW | Mission, rescuer background, how the process works |
| HTTPS / basic security signals | Users abandon forms on http:// sites; required for LGPD credibility | LOW | Handled by Vercel; no effort beyond deployment |
| Privacy policy page | Required by LGPD when collecting personal data (name, phone) | LOW | Static page; describes what data is collected, why, and for how long |

### Differentiators (Competitive Advantage)

Features that set this platform apart from Instagram or generic platforms like Viu Meu Pet. These align with the core value of giving the rescuer full autonomy.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Urgent status with visual prominence | Platforms like Petfinder show "urgent" tags that provoke faster action from users; Instagram has no equivalent | LOW | Special badge / color on card and profile; simple status field |
| No account required for adopter | Reduces drop-off; adopters on Instagram already share contact info in DMs without registration — matching that friction level | LOW | Form submits without auth; already planned |
| Admin panel without external dependency | Full control over listings — no dependence on Instagram or Viu Meu Pet moderation policies | MEDIUM | Core differentiator vs staying on Instagram |
| Interest inbox per animal | Admin sees all interest forms organized by animal, not as a messy DM thread | MEDIUM | Simple table in admin; replaces WhatsApp chaos |
| WhatsApp number never exposed | Privacy protection for rescuer — avoids spam, protects personal number | LOW | Contact is entirely via the interest form |
| Adopted animals auto-hidden | Prevents wasted interest form submissions; Instagram has no equivalent | LOW | Status = Adopted triggers removal from public listing |
| Honeypot spam protection (invisible) | Better UX than reCAPTCHA; adoption forms are low-stakes enough that honeypot + rate limiting is sufficient | LOW | Hidden field on form; no user friction |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem useful but create disproportionate complexity, legal risk, or operational burden for an independent rescuer running a zero-budget MVP.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User account system for adopters | "So we can follow up later" | Adds auth complexity, password recovery, LGPD data retention obligations; adopters won't create accounts for one-time use | Collect phone/name in form; rescuer contacts adopter directly |
| Real-time chat / messaging | "So adopter and rescuer can talk directly" | High infrastructure cost, moderation burden, notification system; completely outside a 3-week MVP scope | Interest form + offline contact by rescuer |
| Email notifications (automated) | "So I know when someone fills the form" | Requires email service integration (Resend/SendGrid), spam/deliverability concerns, added complexity | Admin checks inbox panel; email notifications are Phase 2 |
| WhatsApp direct link / button | "Users want to contact quickly via WhatsApp" | Exposes rescuer's personal number publicly, causes spam, exactly what the client explicitly wants to avoid | Interest form replaces WhatsApp contact entirely |
| Donation system | "Help fund the rescuer" | Payment gateway integration (Stripe/Pagar.me), financial regulations, operational complexity; mission is adoption not fundraising | Out of scope for this platform; rescuer can link to external donation page via "Sobre" |
| Instagram / social feed integration | "Show my Instagram posts automatically" | API auth, rate limits, Meta policy changes, fragile integration; defeats the purpose of becoming independent | Post photos directly to the admin panel |
| Petfinder / third-party syndication | "Reach more people on Petfinder" | Requires Petfinder organization account, API integration, data sync complexity | Not needed for MVP; single rescuer's local audience |
| Swipe / Tinder-style discovery | "Makes it fun to browse" | High front-end complexity, gamifies a serious decision, not appropriate for independent rescuer context | Clean card grid with filters is sufficient and more accessible |
| Behavior tracking / suspicious request flags | "Detect bad actors" | Surveillance complexity, LGPD implications for tracking, overkill for an independent rescuer | Honeypot on forms + manual admin review of suspicious submissions |
| Multi-admin / team roles | "What if I need help managing?" | Role-based access control adds significant auth complexity | Single admin email/password; Phase 2 if needed |

---

## Feature Dependencies

```
[Public Listing Page]
    └──requires──> [Animal Database Records]
                       └──requires──> [Admin: Create Animal]
                                          └──requires──> [Admin Auth (Login)]
                                          └──requires──> [Photo Upload (Supabase Storage)]

[Animal Profile Page]
    └──requires──> [Animal Database Records]
    └──requires──> [Photo Gallery]

[Interest Form Submission]
    └──requires──> [Animal Profile Page]
    └──requires──> [Honeypot Field]

[Admin: View Interest Forms]
    └──requires──> [Admin Auth (Login)]
    └──requires──> [Interest Form Submission] (data must exist)

[Status: Adopted → Auto-hide from Listing]
    └──requires──> [Admin: Edit Animal Status]
    └──requires──> [Listing filter logic]

[Privacy Policy Page]
    └──enhances──> [Interest Form] (LGPD consent reference)
    └──enhances──> [Sobre Page] (institutional trust)
```

### Dependency Notes

- **Admin Auth is the root gate:** Every admin feature (create, edit, delete animals, view forms) requires login to exist first. This must be Phase 1 of implementation.
- **Animal records gate everything public:** The public listing and profile pages have nothing to show until the admin can create animals. Database schema and admin CRUD come before public pages are meaningful.
- **Interest form requires a profile page:** The form is accessed from within an animal's profile. Profile page must exist before form is reachable.
- **Status logic enhances listing:** The auto-hide feature for adopted animals is a filter on the listing query, not a separate feature. It's nearly free once status field exists.
- **Honeypot is a form modifier, not a separate system:** It adds one hidden field to the interest form. Zero dependency overhead.
- **Privacy Policy is informational only:** Static page, no data dependency. Can be created any time before launch.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to replace Instagram and enable the rescuer to operate independently.

- [x] Admin login (Supabase Auth, email + password)
- [x] Admin: create/edit/delete animals with fields (name, species, breed, age, size, sex, neutered, vaccinated, description)
- [x] Admin: upload up to 5 photos per animal via Supabase Storage
- [x] Admin: set animal status (Available, Urgent, Adopted)
- [x] Admin: view interest form submissions per animal
- [x] Public listing page with cards (photo, name, species, status badge)
- [x] Public listing filters (species, size, age, status)
- [x] Individual animal profile page with photo gallery and full data
- [x] Interest form (name, phone, message) on animal profile, no account required
- [x] Honeypot field on interest form
- [x] Auto-hide adopted animals from public listing
- [x] "Sobre" (About) institutional page
- [x] Privacy policy page (LGPD compliance)
- [x] HTTPS via Vercel + RLS in Supabase

### Add After Validation (v1.x)

Features to add once the core platform is running and the rescuer is actively using it.

- [ ] Email notification to admin when a new interest form is submitted — trigger: rescuer complains about missing submissions
- [ ] Kanban-style adoption flow tracking (form received → interview → approved → adopted) — trigger: rescuer has enough volume to need tracking
- [ ] "Favoritar" / save animal list for adopters — trigger: user feedback shows return visits
- [ ] Success stories section (adopted animals with new family photos) — trigger: rescuer wants to show outcomes

### Future Consideration (v2+)

Features to defer until product-market fit with the rescuer's audience is confirmed.

- [ ] Instagram integration (auto-post new animals) — defer: rescuer is moving away from Instagram dependency
- [ ] Multi-admin / team roles — defer: single rescuer for now
- [ ] Foster family management (separate from adoption flow) — defer: complexity, different audience
- [ ] Donation system — defer: different product scope, financial/legal overhead
- [ ] Mobile app (PWA or native) — defer: responsive web-first is sufficient

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Admin CRUD for animals | HIGH | MEDIUM | P1 |
| Public listing with photos + filters | HIGH | LOW | P1 |
| Animal profile page | HIGH | LOW | P1 |
| Interest form (no account) | HIGH | LOW | P1 |
| Admin: view interest forms | HIGH | LOW | P1 |
| Status management (Available/Urgent/Adopted) | HIGH | LOW | P1 |
| Auto-hide adopted animals | HIGH | LOW | P1 |
| Admin auth (login) | HIGH | LOW | P1 |
| Photo upload (multi-photo per animal) | HIGH | MEDIUM | P1 |
| Honeypot spam protection | MEDIUM | LOW | P1 |
| Privacy policy page (LGPD) | MEDIUM | LOW | P1 |
| "Sobre" institutional page | MEDIUM | LOW | P1 |
| Email notification to admin | MEDIUM | MEDIUM | P2 |
| Kanban adoption flow | MEDIUM | HIGH | P2 |
| Favoritar animals | LOW | MEDIUM | P3 |
| Success stories section | LOW | LOW | P3 |
| Instagram integration | LOW | HIGH | P3 |
| Donation system | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Viu Meu Pet (BR) | Adote Petz (BR) | Petfinder (US) | Our Approach |
|---------|-----------------|-----------------|----------------|--------------|
| Public listing | Yes | Yes | Yes | Yes (MVP) |
| Filters (species/size/age) | Yes | Yes | Yes (advanced) | Yes (MVP, simplified) |
| Animal profile page | Yes | Yes | Yes | Yes (MVP) |
| Photo gallery per animal | Yes | Yes | Yes (many photos) | Yes (up to 5, MVP) |
| Interest form without account | Unclear | Yes (no account) | No (account required) | Yes (MVP) |
| Admin panel for rescuer | Campaign panel | Via Petz partner portal | Petfinder org account | Yes — fully owned (differentiator) |
| Urgent status badge | No | Partial | No | Yes (differentiator) |
| Auto-hide adopted | Unclear | Yes | Yes | Yes (MVP) |
| WhatsApp never exposed | No (typical pattern) | No | N/A | Yes (differentiator) |
| LGPD privacy policy | Yes | Yes | N/A | Yes (MVP) |
| Email notifications | Unknown | Unknown | Yes | Phase 2 |
| User accounts for adopters | No (most Brazilian platforms skip this) | No | Yes | Deliberately not built (anti-feature) |
| Social media integration | Yes (core feature) | Via Petz marketing | No | Phase 2 / deliberate deferral |

---

## Sources

- [Viu Meu Pet adoption platform](https://www.viumeupet.com.br/adocao) — Brazilian reference, confirmed features via WebFetch
- [Adote Petz — Maior rede de adoção no Brasil](https://www.adotepetz.com.br/) — Brazilian market leader for comparison
- [Petfinder — US reference platform](https://www.petfinder.com/) — Global benchmark for adoption features
- [CyberOptik — 20 Best Pet Adoption Websites of 2026](https://www.cyberoptik.net/blog/best-pet-adoption-websites/) — Aggregated feature survey (2026)
- [Honeypot vs CAPTCHA comparison — GeeTest 2026](https://www.geetest.com/en/article/captcha-vs-honeypot) — Anti-spam tradeoff analysis
- [3Zero Digital — Honeypot vs reCAPTCHA vs Turnstile 2025](https://www.3zerodigital.com/blog/how-to-protect-your-forms-from-spam-bots-honeypot-vs-google-recaptcha-vs-cloudflare-turnstile-2025-comparison) — Spam protection tradeoffs
- [LGPD / SERPRO — Privacy policy requirements](https://www.serpro.gov.br/lgpd/noticias/2019/elabora-politica-privacidade-aderente-lgpd-dados-pessoais) — LGPD obligations for collecting personal data
- [TechTudo — 'Tinder' de adoção de pets no Brasil](https://www.techtudo.com.br/listas/2023/08/vai-adotar-um-bichinho-conheca-o-tinder-da-adocao-de-pets-edapps.ghtml) — Brazilian market context
- [Morweb — Humane Society website design best practices](https://morweb.org/post/best-humane-society-website-design-practices) — UX standards for rescue organizations

---

*Feature research for: Pet adoption catalog — independent rescuer, Fortaleza, Brazil*
*Researched: 2026-03-24*
