# Generate Logic

3D interactive Cloud & DevOps learning platform for the
[Generate Logic YouTube channel](https://www.youtube.com/@GENERATELOGIC).

*Learn. Build. Automate. Deploy.*

## What is built (Phase 1)

- Homepage with a Three.js 3D infrastructure model (VPC → containers → control plane, data packets,
  floating particles, mouse tilt), orbiting technology badges, typing terminal chips and flowing network lines
- Text and scroll animations on every section (Framer Motion), scroll progress bar, card/button hover effects
- **YouTube auto-sync**: every public playlist on the channel appears on the site automatically
  (refreshed every hour, or instantly via `/api/youtube/refresh`)
- Playlist pages with an embedded player and lesson list
- Learning-path pages per technology (`/learn/docker`, `/learn/kubernetes`, …)
- Responsive layout with mobile menu, reduced-motion support, SEO metadata, security headers
- Full database schema for the next phases (users, progress, bookmarks, notes, admin…)
- Docker image + health check, docker-compose for local PostgreSQL

## What is built (Phase 2 — accounts)

- Sign up with name, email and password (+ confirm), with email verification
- Sign in with email/password or **Continue with Google**
- Forgot password → email link → set a new password (link valid 1 hour)
- Passwords hashed (scrypt) by Better Auth — never stored in plain text
- Secure, signed session cookies (7 days); rate limits on sign-in / sign-up / reset
- Roles: the `ADMIN_EMAIL` account becomes **Admin** once its email is verified; everyone else is a Student
- Disabled accounts cannot sign in
- `/dashboard` — personal dashboard with live stats from the database (only your own data)
- `/admin` — admin-only overview: user counts and recent registrations
- Navbar shows your name, avatar and a menu (Dashboard / Admin / Sign out)

## What is built (Phase 4 — learning progress)

- YouTube playlists and videos are copied into the database (Playlist + Lesson rows), re-synced hourly,
  or instantly with **Sync YouTube now** on `/admin`. Each playlist is placed in its technology's learning path.
- Playlist page: **Mark as complete** per lesson (auto-moves to the next one), progress bar,
  Previous / Next, **Save playlist**, resume at the first unfinished lesson, `?lesson=N` links
- Completing a lesson enrolls the student in that learning path and records activity
- Dashboard: **Continue learning**, **My playlists**, **Completed**, **Recent activity**, live streak and progress %
- Admin: lessons in database, total completions, sync button (logged in the audit log)

## Launch readiness

- `/privacy` — Privacy Policy written for what the site actually does (DPDP Act 2023 aware)
- `/terms` — Terms & Conditions
- `/dashboard/settings` — change name, remove photo, change password (signs out other devices),
  sign out of other devices, **delete account** (password or recent sign-in + typing DELETE;
  all personal data is removed through database cascades)

Have the Privacy Policy and Terms reviewed by someone qualified before launch, and keep them in sync with the code.

Notes / Projects / Blog pages still show "coming soon".

## Run it locally

Requirements: **Node.js 20+** and (for the database, from Phase 2) **Docker**.

```bash
npm install
cp .env.example .env.local      # then fill in YOUTUBE_API_KEY (see below)
npm run dev                     # open http://localhost:3000
```

Without a YouTube key the site still runs; the playlist section shows "coming soon" cards.

### Get the YouTube API key (free, ~5 minutes)

1. Open <https://console.cloud.google.com/> and create a project, e.g. `generate-logic`.
2. **APIs & Services → Library** → search **YouTube Data API v3** → **Enable**.
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Click the new key → **API restrictions → Restrict key → YouTube Data API v3** → Save.
5. Put it in `.env.local` as `YOUTUBE_API_KEY=...`.

The key is only used on the server and is never sent to the browser. The free quota
(10,000 units/day) is far more than the hourly sync needs.

### Force a sync right after publishing a playlist

```bash
curl -X POST https://<your-domain>/api/youtube/refresh \
  -H "Authorization: Bearer <REVALIDATE_SECRET>"
```

### Technology logos

Put official SVG logos in `public/logos/` (file names listed in `public/logos/README.md`).
Until a file is present, a text badge such as "K8s" is shown.

## Database & accounts setup (Phase 2)

1. Fill `.env.local` — every variable is explained in `.env.example`
   (Neon `DATABASE_URL` + `DIRECT_URL`, `AUTH_SECRET`, Google keys, `ADMIN_EMAIL`, Resend key).
2. Allow Prisma's install scripts (newer npm asks first), then install:
   ```bash
   npm install
   npm install-scripts approve prisma @prisma/client @prisma/engines
   npx prisma generate
   ```
3. Create the tables in Neon:
   ```bash
   npm run db:migrate -- --name init
   ```
4. `npm run dev`, open <http://localhost:3000/sign-up> and create your account with `ADMIN_EMAIL`.
5. Browse the data: `npm run db:studio` (or Neon console → Tables).

Without `RESEND_API_KEY`, verification / reset links are printed in the terminal instead of emailed.
Until `generatelogic.in` is verified in Resend, emails only reach the address you signed up to Resend with.

Local PostgreSQL instead of Neon: `docker compose up -d db` and use the URL from `docker-compose.yml` for both
`DATABASE_URL` and `DIRECT_URL`.

## Production build

```bash
npm run build && npm start
# or as a container
docker build -t generate-logic .
docker run -p 3000:3000 --env-file .env.local generate-logic
```

## Project structure

```
src/
  app/                    routes (App Router)
    page.tsx              homepage
    playlists/            all playlists + /playlists/[id] player
    learn/[slug]/         learning path per technology
    api/health            health check for Docker / load balancer
    api/youtube/refresh   force YouTube sync
    api/auth/[...all]     Better Auth (sign-in, sign-up, Google, verify, reset)
    sign-in, sign-up, forgot-password, reset-password
    dashboard/            personal dashboard (protected)
    admin/                admin overview (admins only)
  middleware.ts           redirects signed-out users away from /dashboard and /admin
  components/
    home/                 homepage sections + HeroScene (Three.js)
    layout/               navbar, footer, scroll progress
    playlist/             embedded player
    ui/                   Reveal (scroll animation), TechBadge, headings
  lib/
    youtube.ts            YouTube Data API auto-sync
    data.ts               technologies, roadmaps
    site.ts               site name, contact, links
    db.ts                 Prisma client
    auth.ts               Better Auth config (roles, Google, emails, rate limits)
    auth-client.ts        browser auth helpers
    session.ts            requireUser / requireAdmin for protected pages
    email.ts              verification + reset emails via Resend
    stats.ts              dashboard numbers (always filtered by user id)
prisma/schema.prisma      database schema
```

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Design, homepage, 3D, YouTube auto-sync | ✅ done |
| 2 | Sign up / sign in (email + Google), roles | ✅ done |
| 3 | Database, migrations, ownership checks | ✅ done (with Phase 2) |
| 4 | Lessons in the database, progress tracking, saved playlists | ✅ done |
| 5 | PDF notes on S3 | |
| 6 | Personal dashboard (progress, bookmarks, streaks) | |
| 7 | Admin dashboard | |
| 8 | Command library, project hub, quizzes | |
| 9 | AWS deployment (Terraform, CI/CD, monitoring) | |
