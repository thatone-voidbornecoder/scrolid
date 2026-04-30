'use client';

import { Entry, EntryType } from '@/types';
import EntryCard from './EntryCard';

interface Props {
  type: EntryType;
  entries: Entry[];
  onProgressUpdate: (id: string, newProgress: number) => void;
  onDelete: (id: string) => void;
  onRandomPick: (type: EntryType, mode: 'plan' | 'active') => void;
}

export default function EntryColumn({ type, entries, onProgressUpdate, onDelete, onRandomPick }: Props) {
  const planToWatch = entries.filter(e => e.status === 'plan_to_watch');
  const active = entries.filter(e => ['watching', 'reading', 'rewatching'].includes(e.status));
  const rest = entries.filter(e => ['completed', 'dropped'].includes(e.status));

  const sorted = [...active, ...planToWatch, ...rest];

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

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
      {planToWatch.length > 0 && (
        <button
          onClick={() => onRandomPick(type, 'plan')}
          style={{
            background: '#161618',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '10px 16px',
            color: 'rgba(232,230,224,0.5)',
            fontFamily: 'sans-serif', fontSize: '12px',
            cursor: 'pointer', flex: 1,
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(232,230,224,0.5)';
          }}
        >
          🎲 next up
        </button>
     )}
      {active.length > 1 && (
        <button
          onClick={() => onRandomPick(type, 'active')}
          style={{
            background: '#161618',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '10px 16px',
            color: 'rgba(232,230,224,0.5)',
            fontFamily: 'sans-serif', fontSize: '12px',
            cursor: 'pointer', flex: 1,
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(232,230,224,0.5)';
          }}
        >
          🎲 what now
        </button>
  )}
</div>
    </div>
  );
}