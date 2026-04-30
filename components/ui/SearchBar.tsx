'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntryType } from '@/types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<EntryType>('anime');
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={type}
        onChange={e => setType(e.target.value as EntryType)}
        style={{
          background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '8px 12px', color: 'rgba(232,230,224,0.7)',
          fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
        }}
      >
        <option value="anime">anime</option>
        <option value="manga">manga</option>
        <option value="manhwa">manhwa</option>
      </select>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="search any title..."
          style={{
            background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 14px', color: '#e8e6e0',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none',
            width: '240px', transition: 'border-color 0.2s, width 0.2s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'rgba(192,132,252,0.4)';
            e.currentTarget.style.width = '320px';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.width = '240px';
          }}
        />
      </div>
      <button
        onClick={handleSearch}
        style={{
          background: 'var(--accent)', border: 'none', borderRadius: '8px',
          padding: '8px 14px', color: '#0d0d0f', fontWeight: 500,
          fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        search
      </button>
    </div>
  );
}