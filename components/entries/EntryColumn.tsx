'use client';

import { Entry, EntryType } from '@/types';
import EntryCard from './EntryCard';

interface Props {
  type: EntryType;
  entries: Entry[];
  onProgressUpdate: (id: string, newProgress: number) => void;
  onDelete: (id: string) => void;
  onRandomPick: (type: EntryType, mode: 'plan' | 'active') => void;
  sortBy: 'default' | 'alphabetical' | 'recent' | 'progress';
}

export default function EntryColumn({ type, entries, onProgressUpdate, onDelete, onRandomPick, sortBy }: Props) {
  const planToWatch = entries.filter(e => e.status === 'plan_to_watch' || e.status === 'plan_to_read');
  const active = entries.filter(e => ['watching', 'reading', 'rewatching', 'rereading', 'caught_up'].includes(e.status));
  const rest = entries.filter(e => ['completed', 'dropped'].includes(e.status));

  console.log('sortBy:', sortBy);
  const sorted = (() => {
    switch (sortBy) {
      case 'alphabetical':
        return [...entries].sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
        return [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'progress':
        return [...entries].sort((a, b) => {
          const completedStatuses = ['completed', 'dropped'];
          const aCompleted = completedStatuses.includes(a.status);
          const bCompleted = completedStatuses.includes(b.status);
          if (aCompleted && !bCompleted) return 1;
          if (!aCompleted && bCompleted) return -1;
          const aPercent = a.total_progress ? a.current_progress / a.total_progress : 0;
          const bPercent = b.total_progress ? b.current_progress / b.total_progress : 0;
          return bPercent - aPercent;
        });
      default:
        return [...active, ...planToWatch, ...rest];
    }
  })();

  return (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div style={{ fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 700, color: '#e8e6e0' }}>
        {type}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.3)' }}>
        {entries.length} titles
      </div>
    </div>

    <div className="column-scroll" style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto', paddingRight: '4px' }}>
      {sorted.map(entry => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onProgressUpdate={onProgressUpdate}
          onDelete={onDelete}
        />
      ))}

      {entries.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          fontSize: '12px', color: 'rgba(232,230,224,0.2)',
          border: '0.5px dashed rgba(255,255,255,0.06)',
          borderRadius: '8px'
        }}>
          nothing here yet
        </div>
      )}
    </div>

    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      {planToWatch.length > 0 && (
        <button
          onClick={() => onRandomPick(type, 'plan')}
          style={{
            background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '10px 16px',
            color: 'rgba(232,230,224,0.5)', fontFamily: 'sans-serif',
            fontSize: '12px', cursor: 'pointer', flex: 1, textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,230,224,0.5)'; }}
        >
          🎲 next up
        </button>
      )}
      {active.length > 1 && (
        <button
          onClick={() => onRandomPick(type, 'active')}
          style={{
            background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '10px 16px',
            color: 'rgba(232,230,224,0.5)', fontFamily: 'sans-serif',
            fontSize: '12px', cursor: 'pointer', flex: 1, textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,230,224,0.5)'; }}
        >
          🎲 what now
        </button>
      )}
    </div>
  </div>
  );
}