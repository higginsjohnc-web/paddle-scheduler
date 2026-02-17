'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Player = { id: string; name: string; email: string; phone?: string };
type MatchBlock = { id: string; day_of_week: 'Saturday' | 'Sunday'; start_time: string; location: string };
type WeekendEvent = { id: string; saturday_date: string; sunday_date: string; status: string };

type Tab = 'players' | 'match-blocks' | 'weekends';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: '#6c757d',
    invites_sent: '#007bff',
    completed: '#28a745',
  };
  return (
    <span style={{
      background: colors[status] ?? '#6c757d',
      color: 'white',
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
    }}>{status.replace('_', ' ')}</span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchBlocks, setMatchBlocks] = useState<MatchBlock[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<WeekendEvent[]>([]);

  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Match block form
  const [mbDay, setMbDay] = useState<'Saturday' | 'Sunday'>('Saturday');
  const [mbTime, setMbTime] = useState('09:00');
  const [mbLocation, setMbLocation] = useState('');

  // Weekend form
  const [weSat, setWeSat] = useState('');
  const [weSun, setWeSun] = useState('');

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadPlayers = useCallback(async () => {
    const res = await fetch('/api/players');
    if (res.ok) setPlayers(await res.json());
  }, []);

  const loadMatchBlocks = useCallback(async () => {
    const res = await fetch('/api/match-blocks');
    if (res.ok) setMatchBlocks(await res.json());
  }, []);

  const loadWeekendEvents = useCallback(async () => {
    const res = await fetch('/api/weekend-events');
    if (res.ok) setWeekendEvents(await res.json());
  }, []);

  useEffect(() => {
    loadPlayers();
    loadMatchBlocks();
    loadWeekendEvents();
  }, [loadPlayers, loadMatchBlocks, loadWeekendEvents]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const syncPlayers = async () => {
    setSyncing(true);
    const res = await fetch('/api/admin/sync-players', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showMsg('success', `✅ Synced ${data.count} players from Google Sheets`);
      loadPlayers();
    } else {
      showMsg('error', `❌ Sync failed: ${data.error ?? 'Unknown error'}`);
    }
    setSyncing(false);
  };

  const addMatchBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/match-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week: mbDay, start_time: mbTime, location: mbLocation }),
    });
    const data = await res.json();
    if (data.success) {
      showMsg('success', '✅ Match block added');
      setMbLocation('');
      loadMatchBlocks();
    } else {
      showMsg('error', `❌ ${data.error}`);
    }
  };

  const deleteMatchBlock = async (id: string) => {
    if (!confirm('Delete this match block?')) return;
    const res = await fetch('/api/match-blocks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { showMsg('success', '✅ Match block deleted'); loadMatchBlocks(); }
  };

  const createWeekend = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/weekend-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saturday_date: weSat, sunday_date: weSun }),
    });
    const data = await res.json();
    if (data.success) {
      showMsg('success', '✅ Weekend event created');
      setWeSat(''); setWeSun('');
      loadWeekendEvents();
    } else {
      showMsg('error', `❌ ${data.error}`);
    }
  };

  const sendInvites = async (weekendEventId: string) => {
    setSending(weekendEventId);
    const res = await fetch('/api/availability/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekendEventId }),
    });
    const data = await res.json();
    if (data.success) {
      showMsg('success', `✅ Sent ${data.sent} invites (${data.failed} failed)`);
      loadWeekendEvents();
    } else {
      showMsg('error', `❌ ${data.error}`);
    }
    setSending(null);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const s = {
    page: { minHeight: '100vh', background: '#f0f2f5', padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } as const,
    inner: { maxWidth: 1100, margin: '0 auto' } as const,
    header: { marginBottom: 30 } as const,
    h1: { fontSize: 32, color: '#004e89', marginBottom: 4 } as const,
    sub: { color: '#6c757d', fontSize: 16 } as const,
    tabs: { display: 'flex', gap: 8, marginBottom: 24 } as const,
    card: { background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: 20 } as const,
    h2: { fontSize: 20, color: '#004e89', marginBottom: 16 } as const,
    btn: (color = '#004e89') => ({ background: color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 } as const),
    btnSm: (color = '#dc3545') => ({ background: color, color: 'white', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 } as const),
    input: { width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' as const },
    label: { display: 'block', fontWeight: 600, marginBottom: 6, color: '#495057', fontSize: 14 } as const,
    formRow: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'flex-end' },
    th: { textAlign: 'left' as const, padding: '10px 12px', background: '#f8f9fa', color: '#495057', fontWeight: 600, fontSize: 13, borderBottom: '2px solid #dee2e6' },
    td: { padding: '10px 12px', borderBottom: '1px solid #f0f2f5', fontSize: 14 },
  };

  const tabStyle = (t: Tab) => ({
    ...s.btn(tab === t ? '#ff6b35' : '#e9ecef'),
    color: tab === t ? 'white' : '#495057',
  });

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <h1 style={s.h1}>🎾 Paddle Scheduler</h1>
          <p style={s.sub}>Manage your weekend paddle schedule</p>
        </div>

        {message && (
          <div style={{
            padding: '12px 18px', borderRadius: 8, marginBottom: 16, fontWeight: 500,
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}>{message.text}</div>
        )}

        <div style={s.tabs}>
          <button style={tabStyle('players')} onClick={() => setTab('players')}>👥 Players ({players.length})</button>
          <button style={tabStyle('match-blocks')} onClick={() => setTab('match-blocks')}>⏰ Match Blocks ({matchBlocks.length})</button>
          <button style={tabStyle('weekends')} onClick={() => setTab('weekends')}>📅 Weekends ({weekendEvents.length})</button>
        </div>

        {/* ── Players ── */}
        {tab === 'players' && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ ...s.h2, margin: 0 }}>Players</h2>
              <button style={s.btn()} onClick={syncPlayers} disabled={syncing}>
                {syncing ? '⏳ Syncing…' : '🔄 Sync from Google Sheets'}
              </button>
            </div>
            {players.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: 40 }}>
                No players yet — click "Sync from Google Sheets" to import your list.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id}>
                      <td style={s.td}>{p.name}</td>
                      <td style={s.td}>{p.email}</td>
                      <td style={{ ...s.td, color: '#6c757d' }}>{p.phone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Match Blocks ── */}
        {tab === 'match-blocks' && (
          <>
            <div style={s.card}>
              <h2 style={s.h2}>Add Match Block</h2>
              <form onSubmit={addMatchBlock}>
                <div style={s.formRow}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={s.label}>Day</label>
                    <select style={s.input} value={mbDay} onChange={e => setMbDay(e.target.value as 'Saturday' | 'Sunday')}>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={s.label}>Start Time</label>
                    <input style={s.input} type="time" value={mbTime} onChange={e => setMbTime(e.target.value)} required />
                  </div>
                  <div style={{ flex: 2, minWidth: 200 }}>
                    <label style={s.label}>Location</label>
                    <input style={s.input} type="text" placeholder="e.g. Court 1" value={mbLocation} onChange={e => setMbLocation(e.target.value)} required />
                  </div>
                  <button type="submit" style={s.btn('#28a745')}>Add Block</button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <h2 style={s.h2}>Existing Match Blocks</h2>
              {matchBlocks.length === 0 ? (
                <p style={{ color: '#6c757d', textAlign: 'center', padding: 30 }}>No match blocks yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Day</th>
                      <th style={s.th}>Time</th>
                      <th style={s.th}>Location</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchBlocks.map(b => (
                      <tr key={b.id}>
                        <td style={s.td}>{b.day_of_week}</td>
                        <td style={s.td}>{b.start_time}</td>
                        <td style={s.td}>{b.location}</td>
                        <td style={s.td}><button style={s.btnSm()} onClick={() => deleteMatchBlock(b.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Weekends ── */}
        {tab === 'weekends' && (
          <>
            <div style={s.card}>
              <h2 style={s.h2}>Create Weekend Event</h2>
              <form onSubmit={createWeekend}>
                <div style={s.formRow}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={s.label}>Saturday Date</label>
                    <input style={s.input} type="date" value={weSat} onChange={e => setWeSat(e.target.value)} required />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={s.label}>Sunday Date</label>
                    <input style={s.input} type="date" value={weSun} onChange={e => setWeSun(e.target.value)} required />
                  </div>
                  <button type="submit" style={s.btn('#f7b801')}>Create Weekend</button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <h2 style={s.h2}>Weekend Events</h2>
              {weekendEvents.length === 0 ? (
                <p style={{ color: '#6c757d', textAlign: 'center', padding: 30 }}>No weekend events yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Saturday</th>
                      <th style={s.th}>Sunday</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekendEvents.map(e => (
                      <tr key={e.id}>
                        <td style={s.td}>{fmtDate(e.saturday_date)}</td>
                        <td style={s.td}>{fmtDate(e.sunday_date)}</td>
                        <td style={s.td}><StatusBadge status={e.status} /></td>
                        <td style={s.td}>
                          <button
                            style={s.btnSm('#ff6b35')}
                            onClick={() => sendInvites(e.id)}
                            disabled={sending === e.id}
                          >
                            {sending === e.id ? '⏳ Sending…' : '📧 Send Invites'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
