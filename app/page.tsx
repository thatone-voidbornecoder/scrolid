'use client';

import { useState, useEffect } from 'react';
import { Entry, EntryType } from '@/types';
import EntryColumn from '@/components/entries/EntryColumn';
import AddEntryModal from '@/components/entries/AddEntryModal';

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [randomPick, setRandomPick] = useState<Entry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_progress: newProgress }),
      });
      setEntries(prev => prev.map(e => e.id === id ? { ...e, current_progress: newProgress } : e));
    } catch {
      console.error('Failed to update progress');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      console.error('Failed to delete entry');
    }
  };

  const handleAdd = (newEntry: Entry) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleRandomPick = (type: EntryType) => {
    const pool = entries.filter(e => e.type === type && e.status === 'plan_to_watch');
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomPick(pick);
  };

  const activeEntries = entries.filter(e =>
    ['watching', 'reading', 'rewatching', 'caught_up'].includes(e.status)
  );

  const totalCompleted = entries.filter(e => e.status === 'completed').length;
  const totalEpisodes = entries.filter(e => e.type === 'anime').reduce((sum, e) => sum + e.current_progress, 0);
  const totalChapters = entries.filter(e => e.type !== 'anime').reduce((sum, e) => sum + e.current_progress, 0);

  const byType = (type: EntryType) => entries.filter(e => e.type === type);

  return (
    <main style={{
      background: '#0d0d0f', minHeight: '100vh',
      color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          scro<span style={{ color: '#c084fc' }}>lid</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(232,230,224,0.45)' }}>
          <span style={{ color: '#e8e6e0' }}>dashboard</span>
          <span style={{ cursor: 'pointer' }}>stats</span>
        </nav>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#c084fc', border: 'none', borderRadius: '6px',
            padding: '7px 14px', color: '#0d0d0f', fontWeight: 500,
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + add entry
        </button>
      </div>

      {/* stats bar */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        {[
          { label: 'total tracked', value: entries.length, unit: 'titles' },
          { label: 'completed', value: totalCompleted, unit: 'titles' },
          { label: 'eps watched', value: totalEpisodes.toLocaleString(), unit: 'eps' },
          { label: 'chapters read', value: totalChapters.toLocaleString(), unit: 'ch' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, padding: '16px 32px',
            borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '4px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700 }}>
              {stat.value} <span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(232,230,224,0.4)', fontFamily: 'DM Sans, sans-serif' }}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* now consuming */}
        {activeEntries.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '14px' }}>
              now consuming
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {activeEntries.map(entry => (
                <div key={entry.id} style={{
                  background: '#161618', border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px',
                }}>
                  {entry.cover_art ? (
                    <img src={entry.cover_art} alt={entry.title} style={{ width: '44px', height: '60px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '44px', height: '60px', borderRadius: '5px', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: '#c084fc', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {entry.type}
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.title}
                    </div>
                    {entry.status === 'rewatching' && entry.rewatch_count > 0 && (
                      <div style={{ fontSize: '10px', color: '#a855f7', marginBottom: '4px' }}>rewatch #{entry.rewatch_count}</div>
                    )}
                    {entry.total_progress && (
                      <>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '5px' }}>
                          <div style={{ width: `${Math.round((entry.current_progress / entry.total_progress) * 100)}%`, height: '100%', borderRadius: '2px', background: '#c084fc', transition: 'width 0.3s ease' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{entry.type === 'anime' ? 'ep' : 'ch'} {entry.current_progress}</span>
                          <span>/ {entry.total_progress}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleProgressUpdate(entry.id, entry.current_progress + 1)}
                    style={{
                      background: 'rgba(192,132,252,0.1)', border: '0.5px solid rgba(192,132,252,0.2)',
                      color: '#c084fc', borderRadius: '4px', width: '22px', height: '22px',
                      fontSize: '16px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start',
                    }}
                  >+</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* columns */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>
            loading your list...
          </div>
        ) : (
          <>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '14px' }}>
              your list
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {(['anime', 'manga', 'manhwa'] as EntryType[]).map(type => (
                <EntryColumn
                  key={type}
                  type={type}
                  entries={byType(type)}
                  onProgressUpdate={handleProgressUpdate}
                  onDelete={handleDelete}
                  onRandomPick={handleRandomPick}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* random pick modal */}
      {randomPick && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}
          onClick={() => setRandomPick(null)}
        >
          <div style={{
            background: '#0d0d0f', border: '0.5px solid rgba(192,132,252,0.3)',
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            maxWidth: '320px', width: '90%',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '16px' }}>
              your next watch
            </div>
            {randomPick.cover_art && (
              <img src={randomPick.cover_art} alt={randomPick.title} style={{ width: '80px', height: '112px', borderRadius: '8px', objectFit: 'cover', marginBottom: '16px' }} />
            )}
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {randomPick.title}
            </div>
            {randomPick.genres && (
              <div style={{ fontSize: '12px', color: 'rgba(232,230,224,0.4)', marginBottom: '24px' }}>
                {randomPick.genres.slice(0, 3).join(', ')}
              </div>
            )}
            <button
              onClick={() => setRandomPick(null)}
              style={{
                background: '#c084fc', border: 'none', borderRadius: '8px',
                padding: '10px 24px', color: '#0d0d0f', fontWeight: 500,
                fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              nice, let's go
            </button>
          </div>
        </div>
      )}

      {showModal && <AddEntryModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </main>
  );
}