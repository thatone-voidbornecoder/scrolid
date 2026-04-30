'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Entry } from '@/types';

export default function StatsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/entries')
      .then(res => res.json())
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const completed = entries.filter(e => e.status === 'completed');
  const dropped = entries.filter(e => e.status === 'dropped');
  const watching = entries.filter(e => ['watching', 'reading', 'rewatching', 'rereading', 'caught_up'].includes(e.status));
  const planToWatch = entries.filter(e => e.status === 'plan_to_watch');

  const totalEpisodes = entries
  .filter(e => e.type === 'anime')
  .reduce((sum, e) => sum + (e.status === 'completed' && e.total_progress ? e.total_progress : e.current_progress), 0);
  const totalChapters = entries
  .filter(e => e.type !== 'anime')
  .reduce((sum, e) => sum + (e.status === 'completed' && e.total_progress ? e.total_progress : e.current_progress), 0);
  const totalHours = Math.round(
  entries
    .filter(e => e.type === 'anime')
    .reduce((sum, e) => {
      const mins = e.duration || 24;
      const progress = e.status === 'completed' && e.total_progress ? e.total_progress : e.current_progress;
      return sum + (mins * progress);
    }, 0) / 60
);
  const completionRate = entries.length > 0 ? Math.round((completed.length / entries.length) * 100) : 0;

  const avgDropPoint = dropped.length > 0
    ? Math.round(dropped.reduce((sum, e) => sum + e.current_progress, 0) / dropped.length)
    : null;

  const mostRewatched = entries.filter(e => e.rewatch_count > 0).sort((a, b) => b.rewatch_count - a.rewatch_count)[0];

  const genreCount: Record<string, number> = {};
  entries.forEach(e => e.genres?.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenre = topGenres[0]?.[1] || 1;

  const byType = {
    anime: entries.filter(e => e.type === 'anime').length,
    manga: entries.filter(e => e.type === 'manga').length,
    manhwa: entries.filter(e => e.type === 'manhwa').length,
  };

  const statusBreakdown = [
    { label: 'completed', count: completed.length, color: '#4ade80' },
    { label: 'watching', count: watching.length, color: 'var(--accent)' },
    { label: 'plan to watch', count: planToWatch.length, color: 'rgba(232,230,224,0.2)' },
    { label: 'dropped', count: dropped.length, color: '#f87171' },
  ].filter(s => s.count > 0);
  const maxStatus = statusBreakdown[0]?.count || 1;

  const recentlyCompleted = completed
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const totalDonut = byType.anime + byType.manga + byType.manhwa;
  const circumference = 2 * Math.PI * 38;
  const animeArc = (byType.anime / totalDonut) * circumference;
  const mangaArc = (byType.manga / totalDonut) * circumference;
  const manhwaArc = (byType.manhwa / totalDonut) * circumference;

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(232,230,224,0.35)', marginBottom: '14px',
  };

  const card: React.CSSProperties = {
    background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)',
    borderRadius: '10px', padding: '18px',
  };

  const cardTitle: React.CSSProperties = {
    fontSize: '11px', color: 'rgba(232,230,224,0.35)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px',
  };

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div onClick={() => router.push('/dashboard')} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', cursor: 'pointer' }}>
          scro<span style={{ color: 'var(--accent)' }}>lid</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(232,230,224,0.45)' }}>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>dashboard</span>
          <span style={{ color: '#e8e6e0' }}>stats</span>
        </nav>
        <div style={{ width: '80px' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>loading stats...</div>
      ) : (
        <div style={{ padding: '28px 32px' }}>
          <div style={sectionLabel}>overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
            {[
              { val: totalHours.toLocaleString(), unit: 'hrs', label: 'time watched' },
              { val: totalEpisodes.toLocaleString(), unit: 'eps', label: 'episodes watched' },
              { val: totalChapters.toLocaleString(), unit: 'ch', label: 'chapters read' },
              { val: completionRate, unit: '%', label: 'completion rate', accent: true },
            ].map((s, i) => (
              <div key={i} style={card}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, lineHeight: 1, marginBottom: '4px', color: s.accent ? 'var(--accent)' : '#e8e6e0' }}>
                  {s.val}<span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(232,230,224,0.35)', fontFamily: 'DM Sans, sans-serif', marginLeft: '2px' }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
            <div style={card}>
              <div style={cardTitle}>top genres</div>
              {topGenres.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'rgba(232,230,224,0.2)' }}>no genres yet</div>
              ) : topGenres.map(([genre, count]) => (
                <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(232,230,224,0.6)', width: '90px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{genre}</div>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden'}}>
                    <div style={{ width: `${Math.round((count / maxGenre) * 100)}%`, height: '100%', borderRadius: '3px', background: 'var(--accent)' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', width: '20px', textAlign: 'right' }}>{count}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={cardTitle}>by type</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
                  {totalDonut > 0 && <>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent)" strokeWidth="14"
                      strokeDasharray={`${animeArc} ${circumference - animeArc}`}
                      strokeDashoffset={-circumference * 0}
                      transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#38bdf8" strokeWidth="14"
                      strokeDasharray={`${mangaArc} ${circumference - mangaArc}`}
                      strokeDashoffset={-(animeArc)}
                      transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="14"
                      strokeDasharray={`${manhwaArc} ${circumference - manhwaArc}`}
                      strokeDashoffset={-(animeArc + mangaArc)}
                      transform="rotate(-90 50 50)" />
                  </>}
                  <text x="50" y="46" textAnchor="middle" fill="#e8e6e0" fontSize="14" fontWeight="700" fontFamily="Syne, sans-serif">{totalDonut}</text>
                  <text x="50" y="58" textAnchor="middle" fill="rgba(232,230,224,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">titles</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[{ label: 'anime', count: byType.anime, color: 'var(--accent)' }, { label: 'manga', count: byType.manga, color: '#38bdf8' }, { label: 'manhwa', count: byType.manhwa, color: '#4ade80' }].map(t => (
                    <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(232,230,224,0.6)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      {t.label} · {t.count}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={card}>
              <div style={cardTitle}>status breakdown</div>
              {statusBreakdown.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(232,230,224,0.6)', width: '90px', flexShrink: 0 }}>{s.label}</div>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((s.count / maxStatus) * 100)}%`, height: '100%', borderRadius: '3px', background: s.color }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', width: '20px', textAlign: 'right' }}>{s.count}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={cardTitle}>fun facts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'avg drop point', value: avgDropPoint ? `ep ${avgDropPoint}` : 'no drops!', color: avgDropPoint ? '#f87171' : '#4ade80' },
                  { label: 'most rewatched', value: mostRewatched ? mostRewatched.title : 'none yet', color: 'var(--accent)' },
                  { label: 'total dropped', value: `${dropped.length} titles`, color: '#f87171' },
                  { label: 'completion rate', value: `${completionRate}%`, color: 'var(--accent)' },
                ].map((f, i, arr) => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(232,230,224,0.4)' }}>{f.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: f.color, maxWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {recentlyCompleted.length > 0 && (
            <>
              <div style={sectionLabel}>recently completed</div>
              {recentlyCompleted.map(entry => (
                <div key={entry.id} onClick={() => router.push(`/title/${encodeURIComponent(entry.title)}?type=${entry.type}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  {entry.cover_art ? (
                    <img src={entry.cover_art} alt={entry.title} style={{ width: '32px', height: '44px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '32px', height: '44px', borderRadius: '4px', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8e6e0', marginBottom: '2px' }}>{entry.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)' }}>{entry.type} · {entry.current_progress} {entry.type === 'anime' ? 'eps' : 'ch'}</div>
                  </div>
                  <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>completed</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}