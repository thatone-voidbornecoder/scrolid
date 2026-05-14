'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Entry, EntryStatus, EntryType } from '@/types';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const STATUS_COLORS: Record<string, string> = {
  watching: 'var(--accent)', reading: 'var(--accent)', rewatching: '#a855f7',
  rereading: '#a855f7', completed: '#4ade80', plan_to_watch: 'rgba(232,230,224,0.3)',
  dropped: '#f87171', caught_up: '#38bdf8',
};

const STATUS_LABEL: Record<string, string> = {
  watching: 'watching', reading: 'reading', rewatching: 'rewatching',
  rereading: 'rereading', completed: 'completed', plan_to_watch: 'plan to watch',
  dropped: 'dropped', caught_up: 'caught up',
};

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
  const [similar, setSimilar] = useState<any[]>([]);
  const [dominantColor, setDominantColor] = useState('#1a1035');
  const [priority, setPriority] = useState('medium');
  const [showEdit, setShowEdit] = useState(false);
  const [editStatus, setEditStatus] = useState<EntryStatus>('watching');
  const [editSeason, setEditSeason] = useState('');
  const [editTotal, setEditTotal] = useState<number | null>(null);
  const [editSource, setEditSource] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const decoded = decodeURIComponent(id);
      setTitle(decoded);
      fetchData(decoded);
      checkExisting(decoded);
      fetchSimilar(decoded);
    });
  }, []);

  const fetchData = async (t: string) => {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(t)}&type=${type}`);
    const results = await res.json();
    if (Array.isArray(results) && results.length > 0) {
      setData(results[0]);
      if (results[0].cover_art) extractColor(results[0].cover_art);
    }
  } catch {}
  finally { setLoading(false); }
};

  const extractColor = async (imageUrl: string) => {
    try {
      const res = await fetch(`/api/dominant-color?url=${encodeURIComponent(imageUrl)}`);
      const data = await res.json();
      console.log('dominant color:', data.color);
      setDominantColor(data.color);
    } catch {}
};

  const checkExisting = async (t: string) => {
    try {
      const res = await fetch('/api/entries');
      const entries: Entry[] = await res.json();
      if (Array.isArray(entries)) {
        const found = entries.find(e => e.title.toLowerCase() === t.toLowerCase() && e.type === type);
        if (found) setExistingEntry(found);
      }
    } catch {}
  };

  const fetchSimilar = async (t: string) => {
  try {
    const res = await fetch(`/api/similar?q=${encodeURIComponent(t)}&type=${type}`);
    const data = await res.json();
    if (Array.isArray(data)) setSimilar(data);
  } catch {}
};

  const handleSaveEdit = async () => {
    if (!existingEntry) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/entries/${existingEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          season: editSeason || null,
          total_progress: editTotal || null,
          source: editSource || null,
          priority: (editStatus === 'plan_to_watch' || editStatus === 'plan_to_read') ? 'medium' : null,
        }),
      });
      const updated = await res.json();
      setExistingEntry(updated);
      setShowEdit(false);
    } catch {}
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!data) return;
    setAdding(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title, type, status,
          cover_art: data.cover_art, genres: data.genres,
          description: data.description || null,
          english_title: data.english_title || null,
          current_progress: 0, total_progress: data.total_progress || null,
          priority: (status === 'plan_to_watch' || status === 'plan_to_read') ? priority : null,
          format: data.format || null, duration: data.duration || null,
        }),
      });
      const newEntry = await res.json();
      setExistingEntry(newEntry);
      setShowAdd(false);
    } catch {}
    finally { setAdding(false); }
  };

  useEffect(() => {
  if (existingEntry) {
    setEditStatus(existingEntry.status);
    setEditSeason(existingEntry.season || '');
    setEditTotal(existingEntry.total_progress || null);
    setEditSource(existingEntry.source || '');
  }
}, [existingEntry]);

  const progressPercent = existingEntry?.total_progress
    ? Math.round((existingEntry.current_progress / existingEntry.total_progress) * 100)
    : null;

  const isConsuming = existingEntry && ['watching', 'reading', 'rewatching', 'rereading', 'caught_up'].includes(existingEntry.status);
  const progressLabel = type === 'anime' ? 'episode' : 'chapter';

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`:root { --accent: #c084fc; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div onClick={() => router.push('/dashboard')} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', cursor: 'pointer' }}>
          scro<span style={{ color: 'var(--accent)' }}>lid</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 14px', color: 'rgba(232,230,224,0.6)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← back
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>loading...</div>
      ) : (
        <>
          {/* hero banner */}
          <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
            {/* blurred bg */}
            <div style={{
              position: 'absolute', inset: 0,
              background: data?.cover_art
                ? `url(${data.cover_art}) center/cover no-repeat`
                : `linear-gradient(135deg, ${dominantColor}, #0d0d0f)`,
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
              opacity: 0.4,
            }} />
            {/* gradient overlay */}
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: `linear-gradient(to right, #0d0d0f 35%, transparent 70%), linear-gradient(to top, #0d0d0f 0%, ${dominantColor}22 100%)` 
            }} />
            {/* cover art */}
            {data?.cover_art && (
              <img src={data.cover_art} alt={title} style={{ position: 'absolute', right: '32px', bottom: '0px', width: '120px', height: '168px', borderRadius: '8px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)', zIndex: 2 }} />
            )}
            {/* text content */}
            <div style={{ position: 'absolute', inset: 0, padding: '24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 }}>
              <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {type}{type === 'anime' && data?.format && data.format !== 'TV' ? ` · ${data.format.replace('_', ' ')}` : ''}
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, lineHeight: 1.1, marginBottom: '4px', maxWidth: '60%' }}>
                {data?.title || title}
              </div>
              {data?.english_title && data.english_title !== data.title && (
                <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.4)', marginBottom: '8px' }}>{data.english_title}</div>
              )}
              {data?.genres && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {data.genres.slice(0, 4).map((g: string) => (
                    <span key={g} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(192,132,252,0.15)', color: 'var(--accent)', border: '0.5px solid rgba(192,132,252,0.2)' }}>{g}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* body */}
          <div style={{ padding: '14px 32px 28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxWidth: '860px' }}>

            {/* progress card */}
            <div style={{ background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.3)', marginBottom: '12px' }}>
                {existingEntry ? 'your progress' : 'add to list'}
              </div>

              {existingEntry ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[existingEntry.status] }} />
                      <span style={{ fontSize: '13px', color: 'rgba(232,230,224,0.6)' }}>
                        {STATUS_LABEL[existingEntry.status]}{existingEntry.season ? ` · ${existingEntry.season}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowEdit(!showEdit)}
                      style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: 'rgba(232,230,224,0.4)', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {showEdit ? 'cancel' : 'edit'}
                    </button>
                  </div>

                  {isConsuming && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="number"
                          min={0}
                          max={existingEntry.total_progress || undefined}
                          defaultValue={existingEntry.current_progress}
                          onBlur={async (e) => {
                            const newProgress = Number(e.target.value);
                            if (newProgress === existingEntry.current_progress) return;
                            await fetch(`/api/entries/${existingEntry.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ current_progress: newProgress }),
                            });
                            setExistingEntry({ ...existingEntry, current_progress: newProgress });
                          }}
                          style={{
                            background: 'transparent', border: 'none',
                            borderBottom: '0.5px solid rgba(255,255,255,0.15)',
                            color: '#e8e6e0', fontSize: '36px', fontWeight: 800,
                            fontFamily: 'Syne, sans-serif', width: '100px', outline: 'none',
                          }}
                        />
                        {existingEntry.total_progress && (
                          <span style={{ fontSize: '14px', color: 'rgba(232,230,224,0.3)' }}>/ {existingEntry.total_progress} {progressLabel}s</span>
                        )}
                      </div>
                      {progressPercent !== null && (
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '10px' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: '2px', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
                        </div>
                      )}
                    </>
                  )}

                  {!isConsuming && (
                    <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.4)' }}>
                      {existingEntry.status === 'completed' ? `finished · ${existingEntry.current_progress} ${progressLabel}s` : STATUS_LABEL[existingEntry.status]}
                    </div>
                  )}

                  {showEdit && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as EntryStatus)}
                        style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                      >
                        <option value="watching">watching</option>
                        <option value="reading">reading</option>
                        <option value="rewatching">rewatching</option>
                        <option value="rereading">rereading</option>
                        <option value="completed">completed</option>
                        <option value="plan_to_watch">plan to watch</option>
                        <option value="plan_to_read">plan to read</option>
                        <option value="dropped">dropped</option>
                        <option value="caught_up">caught up</option>
                      </select>

                      <input
                        type="text"
                        value={editSeason}
                        onChange={e => setEditSeason(e.target.value)}
                        placeholder="season (e.g. Season 2)"
                        style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                      />

                      <input
                        type="number"
                        value={editTotal || ''}
                        onChange={e => setEditTotal(Number(e.target.value))}
                        placeholder="total episodes/chapters"
                        style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                      />

                      <input
                        type="text"
                        value={editSource}
                        onChange={e => setEditSource(e.target.value)}
                        placeholder="source (optional)"
                        style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                      />

                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '10px', color: '#0d0d0f', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        {saving ? 'saving...' : 'save changes'}
                      </button>
                    </div>
                  )}
                </>

              ) : showAdd ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as EntryStatus)}
                    style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                  >
                    <option value="watching">watching</option>
                    <option value="reading">reading</option>
                    <option value="rewatching">rewatching</option>
                    <option value="completed">completed</option>
                    <option value="plan_to_watch">plan to watch</option>
                    <option value="plan_to_read">plan to read</option>
                    <option value="dropped">dropped</option>
                    <option value="caught_up">caught up</option>
                    <option value="rereading">rereading</option>
                  </select>
                  {(status === 'plan_to_watch' || status === 'plan_to_read') && (
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    style={{ background: '#0d0d0f', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#e8e6e0', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                  >
                    <option value="high">high priority</option>
                    <option value="medium">medium priority</option>
                    <option value="low">low priority</option>
                  </select>
)}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleAdd} disabled={adding} style={{ flex: 1, background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '10px', color: '#0d0d0f', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {adding ? 'adding...' : '+ add'}
                    </button>
                    <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'rgba(232,230,224,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAdd(true)} style={{ width: '100%', background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '12px', color: '#0d0d0f', fontWeight: 500, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + add to list
                </button>
              )}
            </div>

            {/* details card */}
            <div style={{ background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.3)', marginBottom: '12px' }}>details</div>
              {[
                { label: 'format', value: data?.format ? data.format.replace('_', ' ') : '—' },
                { label: type === 'anime' ? 'episodes' : 'chapters', value: data?.total_progress || 'ongoing' },
                { label: 'duration', value: data?.duration ? `${data.duration} min` : '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)' }}>{row.label}</span>
                  <span style={{ fontSize: '12px', color: '#e8e6e0', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* description */}
            {data?.description && (
              <div style={{ gridColumn: 'span 2', background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.3)', marginBottom: '10px' }}>description</div>
                <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.55)', lineHeight: 1.7 }}>
                  {stripHtml(data.description)}
                </div>
              </div>
            )}
            {/*similar titles*/}
            {similar.length > 0 && (
              <div style={{ gridColumn: 'span 2', background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.3)', marginBottom: '14px' }}>
                  similar titles
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                  {similar.slice(0, 6).map((item, i) => (
                    <div
                      key={i}
                      onClick={() => router.push(`/title/${encodeURIComponent(item.title)}?type=${item.type === 'manga' && type === 'manhwa' ? 'manhwa' : item.type}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.cover_art ? (
                        <img src={item.cover_art} alt={item.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }} />
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '2/3', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)', borderRadius: '6px', marginBottom: '6px' }} />
                      )}
                      <div style={{ fontSize: '11px', color: '#e8e6e0', fontWeight: 500, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(232,230,224,0.3)', marginTop: '2px' }}>
                        {item.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}