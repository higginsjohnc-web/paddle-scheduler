import { NextRequest, NextResponse } from 'next/server';
import { syncPlayersFromSheet } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const players = await syncPlayersFromSheet();

    return NextResponse.json({
      success: true,
      count: players.length,
      players: players,
    });
  } catch (error) {
    console.error('Error syncing players:', error);
    return NextResponse.json(
      { error: 'Failed to sync players', details: String(error) },
      { status: 500 }
    );
  }
}
