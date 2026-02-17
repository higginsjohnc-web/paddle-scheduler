import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPlayers } from '@/lib/sheets';
import { sendAvailabilityRequest, sendMatchReminder } from '@/lib/email';
import { addDays, parseISO, format, isBefore, isAfter, startOfDay } from 'date-fns';

// This endpoint should be called by a cron service (e.g., cron-job.org or Vercel Cron)
// Configure it to run daily at 9am

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    const dayOfWeek = format(today, 'EEEE');

    let remindersSent = 0;
    let availabilityRemindersSent = 0;

    // Task 1: Send match reminders (day before match)
    const tomorrow = addDays(today, 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    const { data: matchesTomorrow } = await supabase
      .from('matches')
      .select(`
        *,
        match_blocks (*)
      `)
      .eq('match_date', tomorrowStr)
      .eq('reminder_sent', false);

    if (matchesTomorrow && matchesTomorrow.length > 0) {
      for (const match of matchesTomorrow) {
        // Get all players in this match
        const playerIds = [
          match.player1_id,
          match.player2_id,
          match.player3_id,
          match.player4_id,
        ].filter(Boolean);

        if (playerIds.length > 0) {
          const { data: players } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);

          if (players && players.length > 0) {
            await sendMatchReminder(players, match, match.match_blocks);
            
            // Mark reminder as sent
            await supabase
              .from('matches')
              .update({ reminder_sent: true })
              .eq('id', match.id);

            remindersSent++;
          }
        }
      }
    }

    // Task 2: Send availability reminders (for upcoming weekends)
    // Only send on weekdays (Monday-Friday)
    if (!['Saturday', 'Sunday'].includes(dayOfWeek)) {
      // Get weekend events that are coming up (within next 7 days) and haven't been completed
      const nextWeek = addDays(today, 7);
      const nextWeekStr = format(nextWeek, 'yyyy-MM-dd');

      const { data: upcomingWeekends } = await supabase
        .from('weekend_events')
        .select('*')
        .gte('saturday_date', todayStr)
        .lte('saturday_date', nextWeekStr)
        .neq('status', 'completed');

      if (upcomingWeekends && upcomingWeekends.length > 0) {
        for (const weekendEvent of upcomingWeekends) {
          // Get match blocks
          const { data: matchBlocks } = await supabase
            .from('match_blocks')
            .select('*')
            .order('day_of_week')
            .order('start_time');

          // Get all players
          const players = await getAllPlayers();

          // Get players who already responded
          const { data: responses } = await supabase
            .from('player_availability')
            .select('player_id')
            .eq('weekend_event_id', weekendEvent.id);

          const respondedPlayerIds = new Set(responses?.map(r => r.player_id) || []);

          // Get players who were already sent a reminder today
          const { data: todaysEmails } = await supabase
            .from('email_log')
            .select('player_id')
            .eq('weekend_event_id', weekendEvent.id)
            .eq('email_type', 'reminder_availability')
            .gte('sent_at', todayStr);

          const sentTodayPlayerIds = new Set(todaysEmails?.map(e => e.player_id) || []);

          // Send reminders to players who haven't responded and weren't reminded today
          for (const player of players) {
            if (!respondedPlayerIds.has(player.id) && !sentTodayPlayerIds.has(player.id)) {
              const success = await sendAvailabilityRequest(
                player,
                weekendEvent,
                matchBlocks || []
              );

              if (success) {
                // Update email log to reflect this is a reminder
                await supabase
                  .from('email_log')
                  .update({ email_type: 'reminder_availability' })
                  .eq('player_id', player.id)
                  .eq('weekend_event_id', weekendEvent.id)
                  .order('sent_at', { ascending: false })
                  .limit(1);

                availabilityRemindersSent++;
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      matchRemindersSent: remindersSent,
      availabilityRemindersSent: availabilityRemindersSent,
      date: todayStr,
      dayOfWeek: dayOfWeek,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
