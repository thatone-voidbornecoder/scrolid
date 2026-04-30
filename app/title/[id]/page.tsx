'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Entry, EntryStatus, EntryType } from '@/types';

export default function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get('type') || 'anime') as EntryType;

  const [title, setTitle] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<EntryStatus>('watching');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const decoded = decodeURIComponent(id);
      setTitle(decoded);
      fetchData(decoded);
      checkExisting(decoded);
    });
  }, []);

  const fetchData = async (t: string) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(t)}&type=${type}`);
      const results = await res.json();
      if (results.length > 0) setData(results[0]);
    } catch {}
    finally { setLoading(false); }
  };

  const checkExisting = async (t: string) => {
    try {
      const res = await fetch('/api/entries');
      const entries: Entry[] = await res.json();
      const found = entries.find(e => e.title.toLowerCase() === t.toLowerCase());
      if (found) setExistingEntry(found);
    } catch {}
  };

  const handleAdd = async () => {
    if (!data) return;
    setAdding(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          type,
          status,
          cover_art: data.cover_art,
          genres: data.genres,
          description: data.description || null,
          english_title: data.english_title || null,
          current_progress: 0,
          total_progress: data.total_progress || null,
          priority: null,
          source: null,
          rewatch_count: 0,
          season: null,
        }),
      });
      const newEntry = await res.json();
      setExistingEntry(newEntry);
      setShowAdd(false);
    } catch {}
    finally { setAdding(false); }
  };

  const STATUS_LABEL: Record<string, string> = {
    watching: 'watching', reading: 'reading', rewatching: 'rewatching',
    completed: 'completed', plan_to_watch: 'plan to watch',
    dropped: 'dropped', caught_up: 'caught up',
  };

  const STATUS_COLOR: Record<string, string> = {
    watching: 'var(--accent)', reading: 'var(--accent)', rewatching: '#a855f7',
    completed: '#4ade80', plan_to_watch: 'rgba(232,230,224,0.3)',
    dropped: '#f87171', caught_up: '#38bdf8',
  };

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div onClick={() => router.push('/dashboard')} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', cursor: 'pointer' }}>
          scro<span style={{ color: 'var(--accent)' }}>lid</span>
        </div>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', padding: '7px 14px', color: 'rgba(232,230,224,0.6)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← back
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>
          loading...
        </div>
      ) : (
        <div style={{ padding: '40px 32px', display: 'flex', gap: '40px', maxWidth: '900px' }}>
          {/* cover */}
          <div style={{ flexShrink: 0 }}>
            {data?.cover_art ? (
              <img src={data.cover_art} alt={title} style={{ width: '180px', height: '250px', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '180px', height: '250px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)' }} />
            )}
          </div>

          {/* info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {type}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px' }}>
              {data?.title || title}
            </div>
            {data?.english_title && data.english_title !== data.title && (
              <div style={{ fontSize: '14px', color: 'rgba(232,230,224,0.4)', marginBottom: '12px' }}>
                {data.english_title}
              </div>
            )}

            {/* genres */}
            {data?.genres && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {data.genres.map((g: string) => (
                  <span key={g} style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                    background: 'rgba(192,132,252,0.1)', color: 'var(--accent)',
                    border: '0.5px solid rgba(192,132,252,0.2)',
                  }}>{g}</span>
                ))}
              </div>
            )}

            {data?.total_progress && (
              <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.4)', marginBottom: '16px' }}>
                {type === 'anime' ? `${data.total_progress} episodes` : `${data.total_progress} chapters`}
              </div>
            )}

            {/* list status or add button */}
            {existingEntry ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#161618', border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 16px', marginBottom: '20px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLOR[existingEntry.status] }} />
                <span style={{ fontSize: '13px', color: 'rgba(232,230,224,0.7)' }}>
                  in your list · {STATUS_LABEL[existingEntry.status]}
                </span>
                {existingEntry.current_progress > 0 && (
                  <span style={{ fontSize: '12px', color: 'rgba(232,230,224,0.3)' }}>
                    · {type === 'anime' ? 'ep' : 'ch'} {existingEntry.current_progress}
                    {existingEntry.total_progress ? ` / ${existingEntry.total_progress}` : ''}
                  </span>
                )}
              </div>
            ) : showAdd ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as EntryStatus)}
                  style={{
                    background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0',
                    fontSize: '13px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="watching">watching</option>
                  <option value="reading">reading</option>
                  <option value="plan_to_watch">plan to watch</option>
                  <option value="completed">completed</option>
                  <option value="dropped">dropped</option>
                  <option value="caught_up">caught up</option>
                  <option value="rereading">rereading</option>
                </select>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  style={{
                    background: 'var(--accent)', border: 'none', borderRadius: '8px',
                    padding: '8px 16px', color: '#0d0d0f', fontWeight: 500,
                    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {adding ? 'adding...' : '+ add to list'}
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'rgba(232,230,224,0.3)', fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: 'var(--accent)', border: 'none', borderRadius: '8px',
                  padding: '10px 20px', color: '#0d0d0f', fontWeight: 500,
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  marginBottom: '20px', display: 'block',
                }}
              >
                + add to list
              </button>
            )}

            {/* description */}
            {data?.description && (
              <div style={{
                background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '16px',
              }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '8px' }}>
                  description
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.6)', lineHeight: 1.7 }}>
                  {data.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}