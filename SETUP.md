# 🚀 Quick Setup Checklist

Follow these steps in order. Should take ~15 minutes.

## ☐ Step 1: Install Dependencies (2 min)

```bash
cd paddle-scheduler
npm install
npm run setup-db
```

Expected output: "✅ Database created successfully"

---

## ☐ Step 2: Gmail App Password (3 min)

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already on)
3. Go to https://myaccount.google.com/apppasswords
4. Create new app password:
   - App: Mail
   - Device: "Paddle Scheduler"
5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

---

## ☐ Step 3: Google Sheets Service Account (5 min)

### Create Service Account

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google Sheets API:
   - APIs & Services → Library
   - Search "Google Sheets API" → Enable
4. Create Service Account:
   - APIs & Services → Credentials
   - Create Credentials → Service Account
   - Name: "paddle-scheduler"
   - Create → Skip optional steps → Done
5. Create JSON key:
   - Click on the service account
   - Keys tab → Add Key → Create new key
   - JSON format → Download

### Share Your Google Sheet

1. Open your player Google Sheet
2. Click Share button
3. Add the service account email (from the JSON, looks like `paddle-scheduler@PROJECT-ID.iam.gserviceaccount.com`)
4. Give "Viewer" permission

---

## ☐ Step 4: Configure Environment (3 min)

```bash
cp .env.example .env.local
```

Edit `.env.local` with these values:

```env
# From Step 2
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# From your Google Sheet URL
GOOGLE_SHEETS_ID=1KNodLoJXUj_mMyJx__XdzC__HkcjgVk303zaWZuUGvs

# From the JSON file you downloaded
GOOGLE_SERVICE_ACCOUNT_EMAIL=paddle-scheduler@your-project.iam.gserviceaccount.com

# Copy the ENTIRE private_key value from JSON (keep the \n characters!)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Your config
BASE_URL=http://localhost:3000
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Paddle Tennis Scheduler
```

**Finding values in the JSON file:**
```json
{
  "client_email": "← Use this for GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "private_key": "← Copy this ENTIRE value (including \n) for GOOGLE_PRIVATE_KEY"
}
```

---

## ☐ Step 5: Verify Your Google Sheet (1 min)

Your Google Sheet should look like this:

| Name        | Email              |
|-------------|-------------------|
| John Doe    | john@example.com  |
| Jane Smith  | jane@example.com  |

- Row 1 = Headers
- Column A = Name
- Column B = Email

---

## ☐ Step 6: Test It! (1 min)

```bash
npm run dev
```

1. Open http://localhost:3000
2. Go to "Players" tab
3. Click "Sync Players from Google Sheets"
4. You should see your players!

---

## ☐ Step 7: Add Match Blocks (2 min)

1. Go to "Match Blocks" tab
2. Add your time slots, for example:
   - Saturday, 9:00 AM, Court 1
   - Saturday, 10:30 AM, Court 1
   - Sunday, 9:00 AM, Court 1
   - Sunday, 10:30 AM, Court 1

---

## ☐ Step 8: Send Test Email (1 min)

1. Go to "Availability" tab
2. Select a weekend date
3. Click "Send Initial Emails"
4. Check your inbox (including spam!)

If you see the email with 4 buttons → **SUCCESS!** 🎉

---

## 🆘 Troubleshooting

### Email not sending?
- ❌ Check: Gmail App Password is exactly 16 characters (remove spaces)
- ❌ Check: 2-Step Verification is ON in your Google account
- ❌ Check: GMAIL_USER and FROM_EMAIL match

### Google Sheets sync failing?
- ❌ Check: Service account email has access to your sheet
- ❌ Check: GOOGLE_PRIVATE_KEY includes `-----BEGIN PRIVATE KEY-----` and `\n` characters
- ❌ Check: Sheet ID is from the URL between `/d/` and `/edit`
- ❌ Check: Google Sheets API is enabled in Cloud Console

### Players not showing?
- ❌ Check: Sheet format matches exactly (Name in column A, Email in column B)
- ❌ Check: First row is headers, data starts in row 2

---

## 🎯 Next Steps

Once everything works:
1. Set up match blocks for your actual schedule
2. Send availability emails on Monday
3. Send reminders during the week
4. Build your weekend schedule
5. Send match reminders on Friday

## 🚀 Deploy to Vercel (Free Hosting)

```bash
npm i -g vercel
vercel login
vercel
```

Then add all environment variables in Vercel dashboard.

---

**Need help?** Check the full README.md for detailed troubleshooting.

**Working?** Enjoy never managing spreadsheets again! 🎾
