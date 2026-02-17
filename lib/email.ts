import nodemailer from 'nodemailer';
import { supabase, Player, WeekendEvent, MatchBlock } from './supabase';
import { format, parseISO } from 'date-fns';

// Create Gmail transporter
export function createEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
}

// Generate unique RSVP token
function generateRSVPToken(playerId: string, weekendEventId: string, availability: string): string {
  const data = `${playerId}:${weekendEventId}:${availability}`;
  return Buffer.from(data).toString('base64url');
}

// Send availability request email
export async function sendAvailabilityRequest(
  player: Player,
  weekendEvent: WeekendEvent,
  matchBlocks: MatchBlock[]
) {
  const transporter = createEmailTransporter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Group match blocks by day
  const saturdayBlocks = matchBlocks.filter(b => b.day_of_week === 'Saturday');
  const sundayBlocks = matchBlocks.filter(b => b.day_of_week === 'Sunday');

  const saturdayDate = format(parseISO(weekendEvent.saturday_date), 'EEEE, MMMM d');
  const sundayDate = format(parseISO(weekendEvent.sunday_date), 'EEEE, MMMM d');

  // Build match times list
  const buildTimesList = (blocks: MatchBlock[]) => {
    return blocks
      .map(b => `  • ${b.start_time} - ${b.location}`)
      .join('\n');
  };

  const saturdayTimes = buildTimesList(saturdayBlocks);
  const sundayTimes = buildTimesList(sundayBlocks);

  // Generate RSVP links
  const bothLink = `${appUrl}/rsvp?token=${generateRSVPToken(player.id, weekendEvent.id, 'both')}`;
  const saturdayLink = `${appUrl}/rsvp?token=${generateRSVPToken(player.id, weekendEvent.id, 'saturday')}`;
  const sundayLink = `${appUrl}/rsvp?token=${generateRSVPToken(player.id, weekendEvent.id, 'sunday')}`;
  const noneLink = `${appUrl}/rsvp?token=${generateRSVPToken(player.id, weekendEvent.id, 'none')}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #004e89; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .match-times { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #ff6b35; }
        .buttons { margin: 30px 0; }
        .button { display: inline-block; padding: 15px 30px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; min-width: 200px; }
        .btn-both { background: #28a745; color: white; }
        .btn-saturday { background: #007bff; color: white; }
        .btn-sunday { background: #6f42c1; color: white; }
        .btn-none { background: #6c757d; color: white; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎾 Paddle Weekend: ${saturdayDate}</h1>
        </div>
        <div class="content">
          <p>Hi ${player.name.split(' ')[0]},</p>
          
          <p>Can you play paddle this weekend? Just click one button below — no forms, no login required.</p>

          <div class="match-times">
            <strong>📅 ${saturdayDate}</strong>
            <pre>${saturdayTimes}</pre>
          </div>

          <div class="match-times">
            <strong>📅 ${sundayDate}</strong>
            <pre>${sundayTimes}</pre>
          </div>

          <div class="buttons">
            <a href="${bothLink}" class="button btn-both">✓ Both Days</a><br/>
            <a href="${saturdayLink}" class="button btn-saturday">Saturday Only</a><br/>
            <a href="${sundayLink}" class="button btn-sunday">Sunday Only</a><br/>
            <a href="${noneLink}" class="button btn-none">Can't Play</a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Once you respond, you won't get any more reminder emails for this weekend.
          </p>
        </div>
        <div class="footer">
          <p>Questions? Just reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Paddle Scheduler" <${process.env.GMAIL_USER}>`,
      to: player.email,
      subject: `🎾 Can you play paddle ${saturdayDate}?`,
      html: emailHtml,
    });

    // Log the email
    await supabase.from('email_log').insert({
      player_id: player.id,
      weekend_event_id: weekendEvent.id,
      email_type: 'availability_request',
      success: true,
    });

    return true;
  } catch (error) {
    console.error(`Error sending email to ${player.email}:`, error);
    
    await supabase.from('email_log').insert({
      player_id: player.id,
      weekend_event_id: weekendEvent.id,
      email_type: 'availability_request',
      success: false,
    });

    return false;
  }
}

// Send match reminder
export async function sendMatchReminder(
  players: Player[],
  match: any,
  matchBlock: MatchBlock
) {
  const transporter = createEmailTransporter();
  const matchDate = format(parseISO(match.match_date), 'EEEE, MMMM d');

  const playerNames = players.map(p => p.name).join(', ');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .match-info { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 6px; }
        .match-info h3 { margin-top: 0; color: #004e89; }
        .match-info p { margin: 10px 0; font-size: 16px; }
        .highlight { color: #ff6b35; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎾 Match Reminder</h1>
        </div>
        <div class="content">
          <p>Your paddle match is tomorrow!</p>

          <div class="match-info">
            <h3>Match Details</h3>
            <p><strong>📅 Date:</strong> <span class="highlight">${matchDate}</span></p>
            <p><strong>🕐 Time:</strong> <span class="highlight">${matchBlock.start_time}</span></p>
            <p><strong>📍 Location:</strong> <span class="highlight">${matchBlock.location}</span></p>
            <p><strong>👥 Players:</strong> ${playerNames}</p>
          </div>

          <p>See you on the court!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const results = [];

  for (const player of players) {
    try {
      await transporter.sendMail({
        from: `"Paddle Scheduler" <${process.env.GMAIL_USER}>`,
        to: player.email,
        subject: `🎾 Match Tomorrow: ${matchBlock.start_time} at ${matchBlock.location}`,
        html: emailHtml,
      });

      await supabase.from('email_log').insert({
        player_id: player.id,
        weekend_event_id: match.weekend_event_id,
        email_type: 'match_reminder',
        success: true,
      });

      results.push({ email: player.email, success: true });
    } catch (error) {
      console.error(`Error sending reminder to ${player.email}:`, error);
      
      await supabase.from('email_log').insert({
        player_id: player.id,
        weekend_event_id: match.weekend_event_id,
        email_type: 'match_reminder',
        success: false,
      });

      results.push({ email: player.email, success: false });
    }
  }

  return results;
}
