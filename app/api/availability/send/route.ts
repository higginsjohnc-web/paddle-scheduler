import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPlayers } from '@/lib/sheets';
import { sendAvailabilityRequest } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { weekendEventId } = await request.json();

    if (!weekendEventId) {
      return NextResponse.json(
        { error: 'Weekend event ID required' },
        { status: 400 }
      );
    }

    // Get weekend event
    const { data: weekendEvent, error: eventError } = await supabase
      .from('weekend_events')
      .select('*')
      .eq('id', weekendEventId)
      .single();

    if (eventError || !weekendEvent) {
      return NextResponse.json(
        { error: 'Weekend event not found' },
        { status: 404 }
      );
    }

    // Get match blocks
    const { data: matchBlocks, error: blocksError } = await supabase
      .from('match_blocks')
      .select('*')
      .order('day_of_week')
      .order('start_time');

    if (blocksError) {
      return NextResponse.json(
        { error: 'Failed to fetch match blocks' },
        { status: 500 }
      );
    }

    // Get all players
    const players = await getAllPlayers();

    // Get players who already responded
    const { data: responses } = await supabase
      .from('player_availability')
      .select('player_id')
      .eq('weekend_event_id', weekendEventId);

    const respondedPlayerIds = new Set(responses?.map(r => r.player_id) || []);

    // Send emails to players who haven't responded
    const results = [];
    for (const player of players) {
      if (!respondedPlayerIds.has(player.id)) {
        const success = await sendAvailabilityRequest(
          player,
          weekendEvent,
          matchBlocks
        );
        results.push({ email: player.email, success });
      }
    }

    // Update event status
    await supabase
      .from('weekend_events')
      .update({ status: 'invites_sent' })
      .eq('id', weekendEventId);

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      total: results.length,
    });
  } catch (error) {
    console.error('Error sending availability requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
