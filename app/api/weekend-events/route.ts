import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('weekend_events')
      .select('*')
      .order('saturday_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weekend events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { saturday_date, sunday_date } = await request.json();

    if (!saturday_date || !sunday_date) {
      return NextResponse.json(
        { error: 'Both saturday_date and sunday_date are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('weekend_events')
      .insert({ saturday_date, sunday_date, status: 'draft' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A weekend event for those dates already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating weekend event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
