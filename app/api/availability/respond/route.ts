import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Decode token
    let playerId: string, weekendEventId: string, availability: string;
    
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      [playerId, weekendEventId, availability] = decoded.split(':');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Validate availability value
    if (!['both', 'saturday', 'sunday', 'none'].includes(availability)) {
      return NextResponse.json({ error: 'Invalid availability option' }, { status: 400 });
    }

    // Get player info
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('name')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Record availability (upsert in case they change their mind)
    const { error: upsertError } = await supabase
      .from('player_availability')
      .upsert(
        {
          weekend_event_id: weekendEventId,
          player_id: playerId,
          availability: availability,
          responded_at: new Date().toISOString(),
        },
        {
          onConflict: 'weekend_event_id,player_id',
        }
      );

    if (upsertError) {
      console.error('Error recording availability:', upsertError);
      return NextResponse.json(
        { error: 'Failed to record response' },
        { status: 500 }
      );
    }

    // Create response message
    const messages = {
      both: `Thanks ${player.name.split(' ')[0]}! We've got you down for both days. See you on the court! 🎾`,
      saturday: `Thanks ${player.name.split(' ')[0]}! We've got you down for Saturday only. See you there! 🎾`,
      sunday: `Thanks ${player.name.split(' ')[0]}! We've got you down for Sunday only. See you there! 🎾`,
      none: `Thanks for letting us know, ${player.name.split(' ')[0]}. Hope to see you next time! 👋`,
    };

    return NextResponse.json({
      success: true,
      message: messages[availability as keyof typeof messages],
    });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
