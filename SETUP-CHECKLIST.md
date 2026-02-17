# 🎾 Paddle Scheduler Setup Checklist

Follow this checklist to get your paddle scheduler up and running in about 30 minutes.

## ✅ Prerequisites

- [ ] Google account (for Gmail and Sheets)
- [ ] GitHub account (for deploying to Vercel)
- [ ] Your player list in Google Sheets

---

## Step 1: Supabase Setup (5 minutes)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "Start your project" and sign up
- [ ] Create a new project (choose any name, make sure you remember your database password)
- [ ] Wait for project to finish setting up (~2 minutes)
- [ ] Go to **Settings** → **API**
- [ ] Copy and save:
  - [ ] **Project URL** (looks like: `https://xxxxx.supabase.co`)
  - [ ] **anon public key** (starts with `eyJ...`)
- [ ] Go to **SQL Editor**
- [ ] Click "New query"
- [ ] Paste contents of `supabase-schema.sql` file
- [ ] Click "Run"
- [ ] Verify tables were created (check "Table Editor" sidebar)

---

## Step 2: Gmail App Password (5 minutes)

- [ ] Go to [myaccount.google.com](https://myaccount.google.com)
- [ ] Click **Security** in left sidebar
- [ ] Scroll down to "Signing in to Google"
- [ ] Enable **2-Step Verification** (if not already enabled)
  - [ ] Follow prompts to set up with phone
- [ ] After 2FA is enabled, go back to Security
- [ ] Click **App passwords** (at bottom of 2-Step Verification section)
- [ ] Select app: **Mail**
- [ ] Select device: **Other** (type "Paddle Scheduler")
- [ ] Click **Generate**
- [ ] Copy the 16-character password and save it
  - [ ] **IMPORTANT**: You won't see this again!

---

## Step 3: Google Sheets API (10 minutes)

### 3A: Create Service Account

- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Click "Select a project" → "New Project"
- [ ] Name it "Paddle Scheduler" → Create
- [ ] Wait for project creation
- [ ] Make sure your new project is selected (top left)
- [ ] Click the hamburger menu (☰) → **APIs & Services** → **Library**
- [ ] Search for "Google Sheets API"
- [ ] Click on it → Click **Enable**
- [ ] Click hamburger menu → **APIs & Services** → **Credentials**
- [ ] Click **+ Create Credentials** → **Service Account**
- [ ] Name it "paddle-scheduler" → Create and Continue
- [ ] Skip optional steps (click Done)

### 3B: Generate Key

- [ ] Click on the service account you just created
- [ ] Go to **Keys** tab
- [ ] Click **Add Key** → **Create new key**
- [ ] Choose **JSON** → Create
- [ ] File downloads automatically - open it in a text editor
- [ ] Copy and save:
  - [ ] `client_email` (looks like: `paddle-scheduler@...iam.gserviceaccount.com`)
  - [ ] `private_key` (everything from `"-----BEGIN` to `END PRIVATE KEY-----\n"` including the quotes)

### 3C: Share Your Google Sheet

- [ ] Open your player list Google Sheet
- [ ] Note the Sheet ID from URL:
  - URL: `https://docs.google.com/spreadsheets/d/`**1KNodLoJXUj_mMyJx__XdzC__HkcjgVk303zaWZuUGvs**`/edit`
  - Sheet ID is the bold part
  - [ ] Copy and save Sheet ID
- [ ] Click **Share** button (top right)
- [ ] Paste your service account email (`...@...iam.gserviceaccount.com`)
- [ ] Set permission to **Viewer**
- [ ] Uncheck "Notify people"
- [ ] Click **Share**

### 3D: Verify Sheet Format

Your sheet should have these columns (Row 1 is headers):

| A (Name) | B (Email) | C (Phone - optional) |
|----------|-----------|----------------------|
| John Doe | john@example.com | 555-1234 |
| Jane Smith | jane@example.com | |

- [ ] Column A: Player names
- [ ] Column B: Email addresses
- [ ] Column C: Phone numbers (optional)
- [ ] Row 1 has headers (will be skipped during sync)

---

## Step 4: Local Development (5 minutes)

- [ ] Open terminal in project folder
- [ ] Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- [ ] Open `.env.local` in text editor
- [ ] Fill in all values:

```bash
# Supabase (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Gmail (from Step 2)
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # Remove spaces: abcdefghijklmnop

# Google Sheets (from Step 3)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=paddle-scheduler@....iam.gserviceaccount.com
GOOGLE_SHEET_ID=1KNodLoJXUj_mMyJx__XdzC__HkcjgVk303zaWZuUGvs

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=make_up_a_random_password_here
```

- [ ] Save `.env.local`
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Start dev server:
  ```bash
  npm run dev
  ```
- [ ] Open browser to [http://localhost:3000](http://localhost:3000)
- [ ] You should see the admin dashboard!

---

## Step 5: Test Locally (5 minutes)

- [ ] Click "Sync from Google Sheets"
- [ ] Verify players appear (check browser console or Supabase table editor)
- [ ] Create a test match block in Supabase:
  ```sql
  INSERT INTO match_blocks (day_of_week, start_time, location)
  VALUES ('Saturday', '09:00', 'Court 1');
  ```
- [ ] Create a test weekend event:
  ```sql
  INSERT INTO weekend_events (saturday_date, sunday_date, status)
  VALUES ('2025-03-01', '2025-03-02', 'draft');
  ```

### Optional: Test Email Sending

⚠️ **Warning**: This will send real emails to your players!

- [ ] In Supabase, get the `weekend_event_id` from the weekend you created
- [ ] Use an API testing tool (Postman, curl, or browser console):
  ```javascript
  fetch('http://localhost:3000/api/availability/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekendEventId: 'paste-id-here' })
  })
  ```
- [ ] Check your email inbox for the availability request
- [ ] Click one of the RSVP buttons
- [ ] Verify response is recorded in Supabase

---

## Step 6: Deploy to Vercel (5 minutes)

- [ ] Push code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/paddle-scheduler.git
  git push -u origin main
  ```
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your repository
- [ ] Configure project:
  - [ ] Framework Preset: **Next.js**
  - [ ] Click "Environment Variables"
  - [ ] Add ALL variables from `.env.local` (copy-paste them)
  - [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://paddle-scheduler.vercel.app`)
- [ ] Click **Deploy**
- [ ] Wait 2-3 minutes for deployment
- [ ] Click "Visit" to see your live site!

---

## Step 7: Set Up Automated Reminders (5 minutes)

- [ ] Go to [cron-job.org](https://cron-job.org)
- [ ] Sign up for free account
- [ ] Click "Create cronjob"
- [ ] Configure:
  - [ ] **Title**: "Paddle Scheduler Daily Reminders"
  - [ ] **URL**: `https://YOUR-APP.vercel.app/api/cron/daily-reminders`
  - [ ] **Schedule**: 
    - Type: Every day
    - Time: 09:00 (9 AM)
  - [ ] Click "Create"
- [ ] Edit the cronjob
- [ ] Go to **Request** tab
- [ ] Add header:
  - [ ] **Header name**: `Authorization`
  - [ ] **Value**: `Bearer YOUR_CRON_SECRET` (use the same secret from `.env.local`)
- [ ] Save
- [ ] Test it: Click "Run" to manually trigger
- [ ] Check execution history to verify it worked

---

## 🎉 You're Done!

### Quick Test Checklist

- [ ] Visit your Vercel URL
- [ ] Sync players works
- [ ] Can see players in Supabase
- [ ] Created a weekend event in database
- [ ] Sent test email (received and clicked button)
- [ ] RSVP was recorded in database
- [ ] Cron job runs successfully

### Next Steps

1. **Create Match Blocks**: Add your actual time slots to the database
2. **Create This Weekend's Event**: Set Saturday/Sunday dates
3. **Send Availability Requests**: Blast out the emails!
4. **Build Schedule**: Assign players to matches based on responses
5. **Let It Run**: Automated reminders handle the rest!

---

## Troubleshooting

### Common Issues

**"Error syncing players"**
- Check service account email has access to sheet
- Verify private key is formatted correctly (include `\n`)
- Make sure Sheet ID is correct

**"Email sending failed"**
- Verify Gmail app password (16 characters, no spaces)
- Check that 2FA is enabled on Google account
- Make sure `GMAIL_USER` is your full email address

**"Database error"**
- Verify Supabase URL and key are correct
- Check that schema SQL was run successfully
- Look at Supabase logs for details

**"Cron job failing"**
- Verify Authorization header is set correctly
- Check that `CRON_SECRET` matches in both Vercel and cron-job.org
- Look at cron-job.org execution history for error details

### Need Help?

- Check the README.md for more details
- Look at Supabase logs (Logs & Reports in sidebar)
- Check Vercel deployment logs
- Test endpoints manually with curl or Postman

---

**Time to completion: ~30-40 minutes**

Once it's running, you'll never go back to spreadsheets! 🎾
