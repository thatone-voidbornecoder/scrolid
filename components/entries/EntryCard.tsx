'use client';

import { Entry } from '@/types';
import { useRouter } from 'next/navigation';

interface Props {
  entry: Entry;
  onProgressUpdate: (id: string, newProgress: number) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  watching: 'var(--accent)',
  reading: 'var(--accent)',
  rewatching: '#a855f7',
  completed: '#4ade80',
  plan_to_watch: 'rgba(232,230,224,0.2)',
  dropped: '#f87171',
  rereading: '#a855f7',
  caught_up: '#38bdf8',
};

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  high: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  medium: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
  low: { bg: 'rgba(232,230,224,0.06)', color: 'rgba(232,230,224,0.3)' },
};

export default function EntryCard({ entry, onProgressUpdate, onDelete }: Props) {
  const progressPercent = entry.total_progress
    ? Math.round((entry.current_progress / entry.total_progress) * 100)
    : null;

  const isConsuming = entry.status === 'watching' || entry.status === 'reading' || entry.status === 'rewatching' || entry.status === 'caught_up' || entry.status === 'rereading';
  const isPlanning = entry.status === 'plan_to_watch';
  const progressLabel = entry.type === 'anime' ? 'ep' : 'ch';
  const router = useRouter();

  return (
    <div style={{
      background: '#161618',
      border: '0.5px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
      padding: '10px 12px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'border-color 0.2s',
    }}
      onClick={() => router.push(`/title/${encodeURIComponent(entry.title)}?type=${entry.type}`)}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(192,132,252,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      {entry.cover_art ? (
        <img
          src={entry.cover_art}
          alt={entry.title}
          style={{ width: '30px', height: '40px', borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '30px', height: '40px', borderRadius: '3px',
          background: 'linear-gradient(135deg, #1a1035, #3b1f6e)',
          flexShrink: 0
        }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px', fontWeight: 500, color: '#e8e6e0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '2px'
        }}>
          {entry.title}
        </div>

        {entry.format && entry.format !== 'TV' && (
                  <div style={{ fontSize: '9px', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '2px 5px', borderRadius: '3px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', display: 'inline-block', marginBottom: '2px' }}>
                    {entry.format.replace('_', ' ')}
                  </div>
                )}

        {entry.season && (
                  <div style={{ fontSize: '10px', color: 'rgba(232,230,224,0.4)', marginBottom: '2px' }}>
                    {entry.season}
                  </div>
                )}

        {entry.status === 'rewatching' && entry.rewatch_count > 0 && (
          <div style={{ fontSize: '10px', color: '#a855f7', marginBottom: '2px' }}>
            rewatch #{entry.rewatch_count}
          </div>
        )}

        
        {isConsuming && (
  <>
    {progressPercent !== null && (
      <div style={{
        height: '2px', background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px', marginBottom: '3px'
      }}>
        <div style={{
          width: `${progressPercent}%`, height: '100%',
          borderRadius: '2px', background: 'var(--accent)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    )}
    <div style={{ fontSize: '10px', color: 'rgba(232,230,224,0.3)', display: 'flex', justifyContent: 'space-between' }}>
      <span>{progressLabel} {entry.current_progress}</span>
      {entry.total_progress
        ? <span>/ {entry.total_progress}</span>
        : <span style={{ color: 'rgba(192,132,252,0.4)' }}>ongoing</span>
      }
    </div>
  </>
)}

        {!isConsuming && (
          <div style={{ fontSize: '10px', color: 'rgba(232,230,224,0.3)' }}>
            {entry.status === 'completed' ? 'completed' : entry.status === 'dropped' ? `dropped at ${progressLabel} ${entry.current_progress}` : entry.status.replace('_', ' ')}
          </div>
        )}
      </div>

      {isPlanning && entry.priority && PRIORITY_STYLES[entry.priority] && (
        <div style={{
          fontSize: '9px', letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '2px 5px', borderRadius: '3px', flexShrink: 0,
          background: PRIORITY_STYLES[entry.priority].bg,
          color: PRIORITY_STYLES[entry.priority].color,
        }}>
          {entry.priority}
        </div>
      )}

      <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: STATUS_COLORS[entry.status] || 'gray' }} />

      {isConsuming && (
        <button
          onClick={(e) => { e.stopPropagation(); onProgressUpdate(entry.id, entry.current_progress + 1); }}
          style={{
            background: 'rgba(192,132,252,0.1)',
            border: '0.5px solid rgba(192,132,252,0.2)',
            color: 'var(--accent)', borderRadius: '4px',
            width: '22px', height: '22px', fontSize: '16px',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          +
        </button>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
        style={{
          background: 'transparent', border: 'none',
          color: 'rgba(232,230,224,0.15)', fontSize: '14px',
          cursor: 'pointer', flexShrink: 0, padding: '0 2px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,230,224,0.15)')}
      >
        ×
      </button>
    </div>
  );
}