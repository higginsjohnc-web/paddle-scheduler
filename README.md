# 🎾 Paddle Tennis Scheduler

A free, self-hosted scheduling system for weekend paddle groups. Eliminates group-chat chaos and spreadsheet hell.

## How It Works

1. **Monday** — Send one email to all players with 4 big RSVP buttons *(Both Days, Saturday, Sunday, Can't Play)*
2. **Tue–Fri** — System auto-reminds only non-responders daily
3. **Mid-week** — Use the dashboard to assign players to match blocks
4. **Friday** — System sends day-before match reminders automatically
5. **Weekend** — Everyone shows up. No "what time again?" texts.

> **Total cost: $0–$12/year** (free Vercel domain is free; custom domain ~$12/year)

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/paddle-scheduler.git
cd paddle-scheduler
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev                   # open http://localhost:3000
```

See **[SETUP.md](SETUP.md)** for a step-by-step guide (~15 minutes).

## Tech Stack

| Layer | Tool | Cost |
|-------|------|------|
| Framework | Next.js 14 (App Router) | Free |
| Database | Supabase (PostgreSQL) | Free |
| Email | Gmail + Nodemailer | Free |
| Player list | Google Sheets API | Free |
| Hosting | Vercel | Free |
| Cron jobs | cron-job.org | Free |

## Project Structure

```
paddle-scheduler/
├── app/
│   ├── page.tsx                          # Admin dashboard
│   ├── rsvp/page.tsx                     # Player RSVP confirmation page
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── admin/sync-players/route.ts   # POST  – sync players from Google Sheets
│       ├── players/route.ts              # GET   – list all players
│       ├── match-blocks/route.ts         # GET/POST/DELETE – manage time slots
│       ├── weekend-events/route.ts       # GET/POST – manage weekend events
│       ├── availability/
│       │   ├── send/route.ts             # POST  – send RSVP emails to all players
│       │   └── respond/route.ts          # POST  – record a player's RSVP (via token)
│       └── cron/
│           └── daily-reminders/route.ts  # GET   – automated daily reminders (cron-protected)
├── lib/
│   ├── supabase.ts                       # Supabase client + shared types
│   ├── email.ts                          # Email sending helpers
│   └── sheets.ts                         # Google Sheets sync logic
├── docs/
│   ├── supabase-schema.sql               # Run this in Supabase SQL Editor
│   └── HOW-IT-WORKS.html                 # Visual explainer
├── .env.example                          # Env var template (copy → .env.local)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── SETUP.md                              # Step-by-step setup guide
└── SETUP-CHECKLIST.md                   # Printable checklist
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/sync-players` | Sync players from Google Sheets |
| `GET` | `/api/players` | List all players |
| `GET/POST/DELETE` | `/api/match-blocks` | Manage time slots |
| `GET/POST` | `/api/weekend-events` | Manage weekend events |
| `POST` | `/api/availability/send` | Send RSVP emails to all players |
| `POST` | `/api/availability/respond` | Record a player RSVP (token-based) |
| `GET` | `/api/cron/daily-reminders` | Run daily reminders (requires `Authorization: Bearer $CRON_SECRET`) |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values. See [SETUP.md](SETUP.md) for how to obtain each one.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GMAIL_USER
GMAIL_APP_PASSWORD
GOOGLE_SHEETS_PRIVATE_KEY
GOOGLE_SHEETS_CLIENT_EMAIL
GOOGLE_SHEET_ID
NEXT_PUBLIC_APP_URL
CRON_SECRET
```

## Deploying to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel && vercel

# Option B: Import from GitHub at vercel.com
# (recommended — enables auto-deploys on push)
```

Add all environment variables in the Vercel dashboard, then update `NEXT_PUBLIC_APP_URL` to your production URL.

## Setting Up Automated Reminders

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create a new cron job pointing to `https://YOUR-APP.vercel.app/api/cron/daily-reminders`
3. Schedule: every weekday at 9:00 AM
4. Add request header: `Authorization: Bearer YOUR_CRON_SECRET`

## Database Setup

Run `docs/supabase-schema.sql` in your Supabase project's SQL Editor.
Tables created: `players`, `match_blocks`, `weekend_events`, `player_availability`, `matches`, `email_log`.

## Contributing

Issues and PRs welcome. This is a small personal-use project — keep PRs focused.

## License

MIT
