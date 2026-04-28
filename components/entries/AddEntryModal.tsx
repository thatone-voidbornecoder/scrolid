'use client';

import { useState } from 'react';
import { EntryType, EntryStatus, SearchResult } from '@/types';

interface Props {
  onClose: () => void;
  onAdd: (entry: any) => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  background: '#0d0d0f',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '24px',
  width: '520px',
  maxHeight: '80vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputStyle: React.CSSProperties = {
  background: '#161618',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#e8e6e0',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(232,230,224,0.35)',
  marginBottom: '6px',
  display: 'block',
};

export default function AddEntryModal({ onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [startingProgress, setStartingProgress] = useState(0);
  const [type, setType] = useState<EntryType>('anime');
  const [status, setStatus] = useState<EntryStatus>('watching');
  const [priority, setPriority] = useState('medium');
  const [source, setSource] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [showDesc, setShowDesc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [season, setSeason] = useState('');
  const [editableTotal, setEditableTotal] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSelected(null);
    setResults([]);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      setResults(data);
    } catch {
      console.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editableTitle || selected.title,
          type,
          status,
          cover_art: selected.cover_art,
          genres: selected.genres,
          description: (selected as any).description || null,
          current_progress: startingProgress,
          total_progress: editableTotal || null,
          priority: status === 'plan_to_watch' ? priority : null,
          source: source || null,
          rewatch_count: 0,
          season: season || null,
        }),
      });
      const newEntry = await res.json();
      onAdd(newEntry);
      onClose();
    } catch {
      console.error('Failed to add entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'sans-serif', fontSize: '16px', fontWeight: 700, color: '#e8e6e0' }}>
            add entry
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(232,230,224,0.4)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>type</label>
            <select style={selectStyle} value={type} onChange={e => setType(e.target.value as EntryType)}>
              <option value="anime">anime</option>
              <option value="manga">manga</option>
              <option value="manhwa">manhwa</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>status</label>
            <select style={selectStyle} value={status} onChange={e => setStatus(e.target.value as EntryStatus)}>
              <option value="watching">watching</option>
              <option value="reading">reading</option>
              <option value="rewatching">rewatching</option>
              <option value="completed">completed</option>
              <option value="plan_to_watch">plan to watch</option>
              <option value="dropped">dropped</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>search title</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              style={inputStyle}
              placeholder={`search for an ${type}...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              style={{
                background: '#c084fc', border: 'none', borderRadius: '8px',
                padding: '10px 16px', color: '#0d0d0f', fontWeight: 500,
                fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              {searching ? '...' : 'search'}
            </button>
          </div>
        </div>

        {results.length > 0 && !selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyle}>select a result</label>
            {results.map((r, i) => (
              <div
                key={i}
                onClick={() => { setSelected(r); setEditableTitle(r.title); setEditableTotal(r.total_progress || null); }}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'center',
                  background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '10px', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {r.cover_art && (
                  <img src={r.cover_art} alt={r.title} style={{ width: '36px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8e6e0' }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', marginTop: '2px' }}>
                    {r.total_progress ? `${r.type === 'anime' ? 'eps' : 'chapters'}: ${r.total_progress}` : 'ongoing'} · {r.genres?.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div style={{
            background: '#161618', border: '0.5px solid rgba(192,132,252,0.2)',
            borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px'
          }}>
            {selected.cover_art && (
              <img src={selected.cover_art} alt={selected.title} style={{ width: '50px', height: '70px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid rgba(255,255,255,0.15)',
                  color: '#e8e6e0',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  width: '100%',
                  outline: 'none',
                  marginBottom: '4px',
                  paddingBottom: '2px',
                }}
                value={editableTitle}
                onChange={e => setEditableTitle(e.target.value)}
                placeholder="edit title..."
              />
              <input
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid rgba(255,255,255,0.1)',
                  color: 'rgba(232,230,224,0.6)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  width: '100%',
                  outline: 'none',
                  marginBottom: '6px',
                  paddingBottom: '2px',
                }}
                value={season}
                onChange={e => setSeason(e.target.value)}
                placeholder="season (optional, e.g. Season 2)"
              />
              <input
                type="number"
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: '0.5px solid rgba(255,255,255,0.1)',
                  color: 'rgba(232,230,224,0.6)', fontSize: '12px',
                  fontFamily: 'inherit', width: '100%', outline: 'none',
                  marginBottom: '6px', paddingBottom: '2px',
                }}
                value={editableTotal || ''}
                onChange={e => setEditableTotal(Number(e.target.value))}
                placeholder="total episodes/chapters (optional)"
              />
              <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', marginBottom: '6px' }}>
                {selected.genres?.slice(0, 3).join(', ')}
              </div>
              {(selected as any).description && (
                <>
                  <div
                    onClick={() => setShowDesc(!showDesc)}
                    style={{ fontSize: '11px', color: '#c084fc', cursor: 'pointer', marginBottom: '4px' }}
                  >
                    {showDesc ? 'hide description ↑' : 'show description ↓'}
                  </div>
                  {showDesc && (
                    <div style={{
                      fontSize: '11px', color: 'rgba(232,230,224,0.5)',
                      lineHeight: '1.6', maxHeight: '80px', overflowY: 'auto'
                    }}>
                      {(selected as any).description}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(232,230,224,0.3)', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '4px' }}
              >
                ← change
              </button>
            </div>
          </div>
        )}

        {status === 'plan_to_watch' && (
          <div>
            <label style={labelStyle}>priority</label>
            <select style={selectStyle} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
          </div>
        )}

        {(status === 'watching' || status === 'reading' || status === 'rewatching') && (
          <div>
            <label style={labelStyle}>starting progress ({type === 'anime' ? 'episode' : 'chapter'})</label>
            <input
              type="number"
              min={0}
              style={inputStyle}
              placeholder="0"
              value={startingProgress}
              onChange={e => setStartingProgress(Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <label style={labelStyle}>source (optional)</label>
          <input
            style={inputStyle}
            placeholder="where are you watching/reading?"
            value={source}
            onChange={e => setSource(e.target.value)}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!selected || submitting}
          style={{
            background: selected ? '#c084fc' : 'rgba(192,132,252,0.2)',
            border: 'none', borderRadius: '8px', padding: '12px',
            color: selected ? '#0d0d0f' : 'rgba(232,230,224,0.3)',
            fontWeight: 500, fontSize: '14px', cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          {submitting ? 'adding...' : '+ add to list'}
        </button>
      </div>
    </div>
  );
}