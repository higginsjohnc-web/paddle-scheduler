# 🎾 Paddle Scheduler - Quick Reference Card

## For the Organizer (You!)

### Weekly Workflow

**Monday or Tuesday**
1. Log into admin dashboard
2. Click "Create New Weekend Event"
3. Set Saturday and Sunday dates
4. Click "Send Availability Requests"
5. Emails go out to everyone

**Wednesday - Friday**
- Check who responded (real-time dashboard)
- Assign players to match blocks based on availability
- System automatically sends reminders to non-responders daily

**Friday Evening**
- System automatically sends match reminders (day before)
- Each player gets: date, time, location, who they're playing with

**Weekend**
- Play paddle!
- No "what time?" texts
- Everyone knows where to be

---

## For Players

### How to RSVP (They'll see this in email)

1. Get email with subject "Can you play paddle [date]?"
2. Click ONE button:
   - ✅ **Both Days** - Playing Saturday AND Sunday
   - 🔵 **Saturday Only** - Only available Saturday
   - 🟣 **Sunday Only** - Only available Sunday  
   - ⚫ **Can't Play** - Not available this weekend

3. See confirmation page - done!

**Notes for players:**
- No login needed
- No app to download
- No forms to fill out
- Just one click
- Once you respond, reminder emails stop
- If you change your mind, click a different button - it updates automatically

---

## Email Schedule

### Initial Request
**When**: You trigger it (typically Monday/Tuesday)
**Who**: All players
**What**: "Can you play this weekend?" with 4 RSVP buttons

### Reminder Emails
**When**: Automatic, daily at 9 AM on weekdays
**Who**: Only players who haven't responded yet
**What**: Same email, gentle reminder
**Stops**: Immediately when player responds

### Match Reminders
**When**: Automatic, day before match
**Who**: Only players assigned to matches
**What**: Match details (date, time, location, partners)

---

## Admin Dashboard Quick Actions

### Sync Players
- **What**: Pulls latest from Google Sheets
- **When**: Before sending invites, or when list changes
- **How**: Click "Sync from Google Sheets"

### Create Weekend Event
- **What**: Sets up new weekend schedule
- **When**: Weekly, typically Monday
- **How**: Enter Saturday and Sunday dates

### Send Invites
- **What**: Blasts RSVP emails to all players
- **When**: After creating weekend event
- **How**: Click "Send Availability Requests"

### View Responses
- **What**: See who's in/out in real-time
- **When**: Throughout the week
- **How**: Click on weekend event

### Assign Matches
- **What**: Put players in time slots
- **When**: Mid-week once responses are in
- **How**: Drag-and-drop or manual assignment

---

## Match Block Setup (One-Time)

Match blocks are your time slots. Example setup:

**Saturday Blocks:**
- 9:00 AM - Court 1
- 9:00 AM - Court 2
- 10:30 AM - Court 1
- 10:30 AM - Court 2
- 12:00 PM - Court 1
- 12:00 PM - Court 2

**Sunday Blocks:**
- 9:00 AM - Court 1
- 10:30 AM - Court 1
- 12:00 PM - Court 1

Create these once, reuse every weekend.

---

## Troubleshooting for Organizers

**"Player didn't get email"**
- Check spam folder
- Verify email address in Google Sheets
- Re-sync players from Sheets
- Check email log in Supabase

**"Someone clicked wrong button"**
- They can just click the right button
- Latest response always wins
- Or you can manually update in Supabase

**"Need to cancel a match"**
- Just delete the match in dashboard
- Or reassign players
- Send manual email if needed

**"Want to add a player mid-week"**
- Add to Google Sheets
- Click "Sync from Google Sheets"
- Manually send them invite (API call)

---

## Cost Reminders

**Totally Free:**
- Vercel hosting
- Supabase database (500MB free)
- Gmail (500 emails/day)
- Google Sheets API
- Cron job service

**Only cost:**
- Your time (~5 min/week once set up)
- Domain name if you want one (~$12/year)

---

## Key Files

```
paddle-scheduler/
├── README.md              # Full documentation
├── SETUP-CHECKLIST.md     # Step-by-step setup
├── supabase-schema.sql    # Database setup
├── .env.example           # Configuration template
├── app/
│   ├── page.tsx           # Admin dashboard
│   ├── rsvp/page.tsx      # Player RSVP page
│   └── api/               # Backend endpoints
├── lib/
│   ├── supabase.ts        # Database client
│   ├── email.ts           # Email sending
│   └── sheets.ts          # Google Sheets sync
```

---

## Support & Help

**For setup help:**
- Read SETUP-CHECKLIST.md
- Check README.md
- Look at Supabase logs
- Check Vercel deployment logs

**For feature requests:**
- Open GitHub issue
- Or just modify the code yourself!

**For bugs:**
- Check browser console
- Check Vercel logs
- Check email_log table in Supabase

---

## Tips for Success

1. **Send invites early** - Monday/Tuesday gives people time
2. **Don't overthink scheduling** - Just get people playing
3. **Trust the automation** - Reminders work, let them run
4. **Keep match blocks simple** - Don't over-complicate time slots
5. **Update Google Sheets regularly** - Keep emails current
6. **Let it run itself** - That's the whole point!

---

## What Players Love

✅ One-click RSVP (no thinking required)
✅ No app to download
✅ No password to remember
✅ Reminder stops after they respond
✅ Match reminder day before
✅ No "what time?" questions

## What You'll Love

✅ No manual spreadsheet updates
✅ No chasing people for responses  
✅ No "did everyone get the reminder?" panic
✅ 5 minutes of work per week
✅ Looks professional and organized
✅ Actually works consistently

---

**Bottom Line:**
Set it up once. Use it every week. Never go back to spreadsheets.

🎾 Happy scheduling!
