import { google } from 'googleapis';
import { supabase } from './supabase';

// Initialize Google Sheets API
export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Sync players from Google Sheets to database
export async function syncPlayersFromSheet() {
  try {
    const sheets = await getGoogleSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Read from Sheet1 (adjust range based on your sheet structure)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:C', // Assuming columns: Name, Email, Phone (skip header row)
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return [];
    }

    const players = [];
    
    for (const row of rows) {
      const [name, email, phone] = row;
      
      if (!name || !email) continue; // Skip incomplete rows

      // Upsert player (insert or update if exists)
      const { data, error } = await supabase
        .from('players')
        .upsert(
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
          },
          {
            onConflict: 'email',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error(`Error upserting player ${email}:`, error);
      } else {
        players.push(data);
      }
    }

    console.log(`Synced ${players.length} players from Google Sheets`);
    return players;
  } catch (error) {
    console.error('Error syncing from Google Sheets:', error);
    throw error;
  }
}

// Get all players from database
export async function getAllPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}
