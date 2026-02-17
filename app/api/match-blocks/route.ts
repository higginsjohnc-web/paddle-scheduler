import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('match_blocks')
      .select('*')
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching match blocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { day_of_week, start_time, location } = await request.json();

    if (!day_of_week || !start_time || !location) {
      return NextResponse.json({ error: 'Missing required fields: day_of_week, start_time, location' }, { status: 400 });
    }

    if (!['Saturday', 'Sunday'].includes(day_of_week)) {
      return NextResponse.json({ error: 'day_of_week must be Saturday or Sunday' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('match_blocks')
      .insert({ day_of_week, start_time, location })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating match block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('match_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting match block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
