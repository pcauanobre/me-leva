# Pitfalls Research

**Domain:** Pet adoption / listing platform — Next.js + Supabase + Vercel
**Researched:** 2026-03-24
**Confidence:** HIGH (most claims verified against official Supabase and Next.js docs + community issue trackers)

---

## Critical Pitfalls

### Pitfall 1: RLS Enabled but No Policies — Silent Empty Results

**What goes wrong:**
Table has RLS enabled but no policies exist. Every query returns an empty result set with no error. The app appears broken in a way that looks like a data or query bug, not a security configuration bug.

**Why it happens:**
Supabase Dashboard's "Enable RLS" toggle is one action, and writing policies is a separate action. Developers often enable RLS when creating tables and defer writing policies — then spend hours debugging "why is my data not showing up."

**How to avoid:**
Enable RLS and write the policies in the same migration. For `pets` table: a SELECT policy allowing `true` for the anon role (public reads), and INSERT/UPDATE/DELETE policies requiring `auth.uid()` is not null (admin only). For `interest_forms` table: INSERT for anon, SELECT/DELETE for authenticated admin only. Treat policy writing as part of schema creation, not a later step.

**Warning signs:**
- Public listing page shows 0 pets immediately after first insert
- Supabase Dashboard shows rows exist, but client SDK returns empty array
- No error thrown — just `data: []`

**Phase to address:** Database schema + RLS setup phase (foundation phase)

---

### Pitfall 2: RLS Tested in Dashboard SQL Editor (Superuser Bypass)

**What goes wrong:**
Developer writes RLS policies, tests queries in Supabase Dashboard SQL Editor, sees correct results, ships. In production, real users (anon role) see nothing because the SQL Editor runs as `postgres` superuser and bypasses all RLS.

**Why it happens:**
The SQL Editor does not simulate a specific Postgres role — it runs as the superuser. This is a documented behavior but not prominently surfaced. The false positive makes developers believe policies are working.

**How to avoid:**
Test RLS using the Supabase client SDK in a test page or script, explicitly using the anon key and no auth token. Alternatively, use `SET ROLE anon; SELECT ...;` in the SQL Editor to simulate the correct role. Supabase also provides a "Table Editor > RLS Simulator" option in newer versions of the dashboard.

**Warning signs:**
- Policies "work" in the dashboard but fail in the browser
- Admin queries work but public pages return empty data

**Phase to address:** Database schema + RLS setup phase

---

### Pitfall 3: Supabase Free Tier Project Pausing After 7 Days of Inactivity

**What goes wrong:**
The free tier pauses projects that have no activity for 7 consecutive days. When paused, all database and storage requests return errors. Resuming takes 30–60 seconds after first access. For a real-world protetora with sporadic admin usage, the site goes down without warning.

**Why it happens:**
Free tier resource constraint. Supabase emails warnings, but if the protetora doesn't check email or doesn't understand the message, the site goes dead. The site could be effectively "down" for the first adopter who visits on a low-traffic period.

**How to avoid:**
Set up a GitHub Actions or Vercel cron job that hits a lightweight API route (`/api/ping`) which performs a simple `SELECT 1` query against Supabase every 5–6 days. This keeps the project active without manual intervention. Alternatively, set up a free UptimeRobot monitor pinging the site every 5 minutes — this achieves the same effect as a side benefit. Do NOT upgrade to Pro just to solve this; the workaround is trivial.

**Warning signs:**
- Cold start errors: `FetchError: Failed to fetch` or 503 responses
- First visitor of the day sees an error screen

**Phase to address:** Deployment / production readiness phase

---

### Pitfall 4: `getSession()` Used for Auth Checks in Server Code

**What goes wrong:**
`supabase.auth.getSession()` returns whatever session is stored in the cookie without revalidating with the Supabase Auth server. A tampered or expired session cookie could pass server-side checks. Admin routes protected only by `getSession()` are not truly secure.

**Why it happens:**
`getSession()` is the intuitive call — it reads the session synchronously. `getUser()` is less prominent in docs and adds a network round-trip. Developers optimize for DX and use `getSession()` everywhere, including server-side guards.

**How to avoid:**
In server components and Server Actions, always use `supabase.auth.getUser()` to validate the session. Reserve `getSession()` only for the client side where the server's JWT revalidation is not needed. The Supabase SSR guide explicitly documents this distinction.

**Warning signs:**
- Admin panel accessible despite expired or malformed token
- Security audit flags unvalidated JWT claims

**Phase to address:** Admin auth implementation phase

---

### Pitfall 5: Middleware-Only Auth Protection (CVE-2025-29927 Risk)

**What goes wrong:**
Admin routes are protected solely by Next.js middleware that checks for a session cookie. An attacker can inject the `x-middleware-subrequest` header to bypass middleware entirely and access admin routes without credentials. This is CVE-2025-29927, disclosed March 2025.

**Why it happens:**
Middleware feels like the natural place to protect routes — centralized, clean. Most tutorials stop there. The underlying mechanism (middleware runs before the route, headers are passable) creates the bypass surface.

**How to avoid:**
1. Keep Next.js at 15.2.3+ (patches the vulnerability).
2. Even after patching, never rely solely on middleware. In every Server Action and server component on the admin path, call `supabase.auth.getUser()` and redirect to login if unauthenticated. Middleware is a first filter, not the final guard.

**Warning signs:**
- Next.js version below 15.2.3
- Admin server components that do not independently check auth

**Phase to address:** Admin auth implementation phase

---

### Pitfall 6: Supabase Storage Bucket Not Configured for Public Read

**What goes wrong:**
Pet images are uploaded to a private bucket. The `next/image` component renders broken images on the public listing. The developer sees images fine in the Dashboard (authenticated), but every visitor sees placeholders.

**Why it happens:**
Buckets are private by default. The upload succeeds and the URL looks valid. The RLS policy may allow INSERT but not SELECT for the anon role. The developer never tests the public view while logged out.

**How to avoid:**
Create the storage bucket as **public** (or add a permissive SELECT policy for the anon role on `storage.objects`). Public pet listing images are not sensitive — public read is appropriate. Test by opening pet image URLs in an incognito window before deployment.

**Warning signs:**
- Images load in Supabase Dashboard but not on the public site
- 400 or 403 errors on image URLs when not logged in

**Phase to address:** Image upload and storage phase

---

### Pitfall 7: Orphaned Storage Files When Pets Are Deleted

**What goes wrong:**
When a pet record is deleted from the database, the image files in Supabase Storage are not deleted automatically. Over time, storage accumulates orphaned files that count toward the 1 GB free tier limit.

**Why it happens:**
Supabase Storage is a separate system from PostgreSQL. Deleting a row in the `pets` table has no automatic cascade effect on files. Postgres `ON DELETE CASCADE` does not extend to the Storage layer.

**How to avoid:**
When implementing the delete-pet admin action, explicitly call `supabase.storage.from('pets').remove([...filePaths])` before or alongside deleting the database row. Store the file paths as a column in the `pets` table so the deletion logic can find all associated files. Alternatively, use a Postgres trigger that calls a Supabase Edge Function to clean up storage — but for MVP, inline deletion in the server action is simpler and sufficient.

**Warning signs:**
- Storage usage growing after pets are marked as adopted or deleted
- Files visible in Storage Dashboard with no corresponding database record

**Phase to address:** Image upload and storage phase, and admin CRUD phase

---

### Pitfall 8: Next.js `<Image>` Failing for Supabase Storage URLs

**What goes wrong:**
Using `next/image` with Supabase Storage URLs throws: `Invalid src ... hostname ... is not configured under images in your next.config.js`. Images render broken even though the URL is valid.

**Why it happens:**
Next.js validates remote image hostnames at build time to prevent abuse of the image optimization pipeline. Supabase Storage hosts on `*.supabase.co` subdomains. Developers forget to add the `remotePatterns` config.

**How to avoid:**
Add to `next.config.ts`:
```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
},
```
Use `*` wildcard for the project-specific subdomain so it works across environments (local, staging, production). Verify in development before deploying.

**Warning signs:**
- `next/image` throws hostname configuration error in development
- `<img>` works but `<Image>` does not

**Phase to address:** Image upload and storage phase

---

### Pitfall 9: Supabase Module-Level Client Initialization in Server Code

**What goes wrong:**
The Supabase client is initialized once at module level (outside the request handler). This causes the same client instance — with the same cookies/auth state — to be shared across multiple concurrent requests. One user's session leaks into another's request.

**Why it happens:**
JavaScript module caching means a variable defined at the top of a module is initialized once. In serverless functions (Vercel), each cold start creates a new module, but warm instances share module state across requests.

**How to avoid:**
Always initialize the Supabase SSR client inside the route handler, server component, or Server Action — never at module level. The `@supabase/ssr` helper `createServerClient` is designed to be called per-request with the `cookies()` from Next.js.

**Warning signs:**
- Intermittent auth bleed where admin actions affect public data unexpectedly
- Users seeing each other's data (rare but possible at scale)

**Phase to address:** Admin auth implementation phase, foundational setup

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing image paths as a free-text string instead of an array column | Simpler schema | Cannot query individual paths; deletion becomes string parsing | Never for this project — use `text[]` from the start |
| Skipping form input validation in Server Actions (relying on HTML required) | Faster to write | Bot or direct HTTP POST bypasses client validation; malformed data in DB | Never — always validate on server side |
| Using the anon key for admin operations in the client | One less key to manage | Any user has the same permissions as admin if RLS is misconfigured | Never — use service role only in server-side code |
| Disabling RLS during development "to move faster" | Removes friction | Easy to forget to re-enable; policies never tested; ships wide-open | Never — write basic policies from day one |
| Using `<img>` instead of `next/image` for pet photos | Avoids `remotePatterns` config | No lazy loading, no responsive sizes, no WebP conversion; CLS on listing page | Only acceptable for the admin dashboard's internal preview thumbnails |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Storage upload | Passing a `File` object from a browser form directly to a Server Action via `FormData` | Use `formData.get('file') as File`, then pass the `File` to `supabase.storage.from().upload()` on the server. In Pages Router, disable bodyParser; in App Router, Server Actions handle FormData natively. |
| Supabase Auth + Next.js middleware | Importing `createClient` from `@supabase/supabase-js` in middleware | Use `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`. The base client does not work correctly in Edge Runtime. |
| Next.js `<Image>` + Supabase public URLs | Using the raw storage URL without configuring `remotePatterns` | Add `*.supabase.co` to `remotePatterns` in `next.config.ts` (see Pitfall 8 above). |
| Supabase Storage file delete | Running `DELETE FROM storage.objects WHERE ...` via SQL | Use `supabase.storage.from(bucket).remove([path])` via the SDK. SQL deletes orphan the S3 object; the SDK delete removes both metadata and the actual file. |
| Vercel + Supabase environment variables | Using the same Supabase URL/keys in all Vercel environments | Set separate Supabase projects (or at minimum separate anon keys) for Preview vs Production. Otherwise preview deployments can corrupt production data. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Serving full-resolution pet photos to the public listing | Listing page loads slowly; high Supabase egress consumption; approaching 5 GB free bandwidth limit | Use Supabase Image Transformation (`?width=400&quality=80`) for thumbnails on the listing grid; full-res only on individual pet profiles | Day one if photos are >500 KB each; 5 animals with 5 photos = 25 MB per listing page load |
| N+1 query on interest forms (fetching forms per animal in a loop) | Admin dashboard slows as form count grows | Fetch all forms in one query with `pet_id` filter or JOIN, not one query per animal | After ~50 form submissions |
| Fetching all pets without pagination on the public listing | Page becomes slow as catalog grows; JS bundle grows with large data | Add `range()` or `limit()` to queries. Even MVP should paginate at 20 per page. | After ~200 pets in the catalog |
| Not setting `loading="lazy"` (or using `next/image` which does it automatically) on pet photos | All 20 cards' images load simultaneously on page load | Use `next/image` with `sizes` prop; it lazy-loads below-the-fold images automatically | Immediately visible on any listing page with more than 3 visible cards |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing the Supabase service role key in client-side code | Any visitor gains unrestricted database access, bypassing all RLS | Service role key must ONLY be in server-side environment variables (`SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_`). Audit `.env` and `next.config.ts` before deploying. |
| Honeypot field hidden with `display:none` inline style | Sophisticated bots detect inline `display:none` and skip the field; honeypot is ineffective | Hide with a CSS class in a stylesheet, not inline. Use a plausible field name like `website` or `contact_alt`, not `honeypot`. |
| Missing server-side validation on the interest form | Malformed or oversized payloads stored in DB; potential injection | Validate with Zod in the Server Action: name max 100 chars, phone pattern match, message max 1000 chars. Reject anything that doesn't conform. |
| Admin login rate limiting not configured | Brute-force attack against the admin email/password | Supabase Auth has configurable rate limits in the Dashboard under Authentication > Rate Limits. Verify defaults are not set to "unlimited". |
| Storage bucket for pet images not restricted on write (anyone can upload) | Public can upload arbitrary files to the bucket, consuming free-tier storage | Add an RLS policy on `storage.objects` restricting INSERT/UPDATE/DELETE to `auth.uid() IS NOT NULL` (admin sessions only). Public SELECT is fine; public write is not. |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during photo upload in admin | Admin thinks upload is stuck; re-submits; creates duplicates | Show a spinner or progress indicator during upload. Disable the submit button while uploading. |
| Adopted pets still appear in public listing (status not filtered) | Adopters get excited about unavailable animals; damages trust | Filter `WHERE status != 'adopted'` by default on the public listing. Only show adopted animals if there is an explicit "success stories" section in scope. |
| No confirmation before deleting a pet record or its photos | Accidental data loss by the protetora | Show a confirmation dialog ("Are you sure? This will delete all photos permanently.") before destructive actions in the admin. |
| Form submission gives no feedback | Adopter submits form, sees blank page or nothing; re-submits multiple times, creating duplicate entries | Show a clear success state ("Formulario enviado! Entraremos em contato em breve.") and disable the form after submission. |
| Interest form collected with no phone format validation | Protetora receives malformed phone numbers (e.g., "123") and cannot contact adopter | Validate Brazilian phone number format (10–11 digits). A simple regex is sufficient for MVP. |

---

## LGPD-Specific Pitfalls

### Pitfall: Privacy Policy Exists but Data Collection Is Not Aligned

**What goes wrong:**
The Privacy Policy page is written but doesn't match what data is actually collected. The interest form collects name + phone + message — these are personal data under LGPD. If the policy doesn't explicitly state the purpose (connecting adopters with the protetora), the legal basis (consent or legitimate interest), and the data controller's identity, the policy is technically non-compliant.

**How to avoid:**
Privacy Policy must include: (1) what data is collected (name, phone, message), (2) purpose (process adoption interest), (3) legal basis (consent), (4) data retention period (e.g., "kept while the adoption process is active"), (5) contact to exercise rights (email of the protetora), (6) whether data is shared (not shared with third parties). Keep it in plain Portuguese — LGPD requires transparency to the data subject.

**Phase to address:** Privacy policy page implementation phase

### Pitfall: No Visible Consent Mechanism on the Interest Form

**What goes wrong:**
The form is submitted without explicit consent. LGPD requires consent to be "free, informed, unambiguous." Implying consent by form submission is not sufficient under a strict reading of the law.

**How to avoid:**
Add a checkbox near the submit button: "Li e aceito a Politica de Privacidade." Link to the privacy policy. This satisfies the written consent requirement. For MVP, this is a low-effort addition with significant legal protection.

**Phase to address:** Interest form implementation phase

---

## "Looks Done But Isn't" Checklist

- [ ] **RLS policies:** Dashboard shows RLS enabled — verify policies exist AND test with the anon key from a logged-out browser tab, not the Dashboard SQL editor
- [ ] **Image display:** Pet images load in the admin (authenticated) — verify they also load on the public listing in an incognito window
- [ ] **Admin route protection:** Middleware redirects work — verify that direct Server Action calls without a session also return 401/redirect, not data
- [ ] **Storage cleanup:** Pet delete removes the database row — verify the corresponding Storage files are also removed (check Storage bucket in Dashboard after deletion)
- [ ] **Supabase project health:** App deploys successfully — verify the free-tier ping cron is live and the project won't pause after a quiet weekend
- [ ] **Interest form deduplication:** Form shows success state — verify that rapid double-submit doesn't create two rows in the database
- [ ] **LGPD checkbox:** Privacy policy page exists — verify the interest form has a visible consent checkbox linking to it
- [ ] **`next/image` config:** Pet images render in development — verify `remotePatterns` covers the production Supabase project URL, not just local

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS misconfiguration (public data exposed) | LOW | Enable RLS, add correct policies, redeploy. No data migration needed. |
| Orphaned storage files accumulated | LOW | List all files in Storage bucket, query pets table for known paths, diff to find orphans, call `remove()` on orphans via script or Edge Function. |
| Admin route compromise (session bypass) | HIGH | Rotate Supabase anon + service role keys immediately. Audit logs for unauthorized writes. Update Next.js to 15.2.3+. Add per-endpoint auth checks. |
| Supabase project paused in production | LOW | Resume via Dashboard (30–60 sec). Then set up keep-alive cron immediately. |
| Wrong `next.config.ts` `remotePatterns` (images broken in prod) | LOW | Add correct hostname pattern, redeploy. Vercel deployment is seconds. |
| Adopted pets visible on public listing | LOW | Add `status` filter to the public listing query, redeploy. |
| Privacy Policy non-compliant under LGPD | MEDIUM | Rewrite policy page to include required elements. Add consent checkbox to form. No data migration, but requires legal review if a complaint is filed. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS enabled but no policies (silent empty results) | Database schema phase | Test public listing as anon user before marking phase complete |
| RLS tested in Dashboard SQL Editor only | Database schema phase | Add test step: verify queries with SDK using anon key |
| Free-tier project pausing | Deployment / production hardening phase | Confirm keep-alive cron is running and project stays active over 7+ days |
| `getSession()` in server auth checks | Admin auth phase | Code review: grep for `getSession` in server components and Server Actions |
| Middleware-only auth (CVE-2025-29927) | Admin auth phase | Verify Next.js >= 15.2.3; verify server components independently check `getUser()` |
| Storage bucket private by default (broken public images) | Image upload phase | Incognito browser test of public listing page |
| Orphaned storage files on pet deletion | Admin CRUD phase | Test: create pet with photos, delete pet, verify Storage bucket is empty |
| `next/image` hostname not configured | Image upload phase | Deploy to Vercel preview; confirm images render without hostname error |
| Module-level Supabase client initialization | Foundation / setup phase | Code review: ensure `createServerClient` is called inside handlers |
| Honeypot field visible or named obviously | Interest form phase | Inspect form HTML; test autofill behavior |
| Missing LGPD consent on interest form | Interest form + privacy policy phase | Confirm checkbox + policy link present in form before launch |
| No server-side validation on interest form | Interest form phase | Send a Server Action request directly with curl containing oversized payload |

---

## Sources

- [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Access Control docs](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage: Delete Objects docs](https://supabase.com/docs/guides/storage/management/delete-objects)
- [Supabase Auth: Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Troubleshooting: Next.js Auth issues](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- [Supabase Storage file limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Next.js Data Security guide](https://nextjs.org/docs/app/guides/data-security)
- [Next.js images remotePatterns config](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)
- [CVE-2025-29927: Next.js Middleware Authorization Bypass — ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass)
- [GitHub issue: orphaned storage objects on db reset](https://github.com/supabase/cli/issues/3252)
- [GitHub discussion: orphaned storage objects](https://github.com/orgs/supabase/discussions/34254)
- [Supabase free tier pausing — community guide](https://shadhujan.medium.com/how-to-keep-supabase-free-tier-projects-active-d60fd4a17263)
- [Supabase RLS: Complete Guide 2026](https://vibeappscanner.com/supabase-row-level-security)
- [LGPD compliance guide — SecurePrivacy](https://secureprivacy.ai/blog/lgpd-compliance-requirements)
- [LGPD compliance for websites — Lawwwing](https://lawwwing.com/en/is-your-website-lgpd-compliant-a-guide-for-digital-businesses-in-brazil/)
- [Honeypot implementation guide — FormShield](https://formshield.dev/blog/form-honeypot-implementation-guide)
- [Next.js server action security — Arcjet](https://blog.arcjet.com/next-js-server-action-security/)

---
*Pitfalls research for: pet adoption / listing platform (Next.js + Supabase + Vercel)*
*Researched: 2026-03-24*
