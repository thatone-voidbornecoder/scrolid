'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResult, EntryType } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'anime') as EntryType;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!query) return;
  setLoading(true);
  fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        console.error('Search API error:', data);
        setResults([]);
      }
      setLoading(false);
    })
    .catch(() => { setResults([]); setLoading(false); });
}, [query, type]);

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div
          onClick={() => router.push('/dashboard')}
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', cursor: 'pointer' }}
        >
          scro<span style={{ color: 'var(--accent)' }}>lid</span>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.4)' }}>
          results for <span style={{ color: '#e8e6e0' }}>"{query}"</span> · {type}
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', padding: '7px 14px', color: 'rgba(232,230,224,0.6)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← back
        </button>
      </div>

      <div style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>
            searching...
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(232,230,224,0.3)', padding: '48px 0', fontSize: '13px' }}>
            no results found for "{query}"
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {results.map((result, i) => (
              <div
                key={i}
                onClick={() => router.push(`/title/${encodeURIComponent(result.title)}?type=${type}&idx=${i}`)}
                style={{
                  background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '14px', display: 'flex', gap: '14px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {result.cover_art ? (
                  <img src={result.cover_art} alt={result.title} style={{ width: '60px', height: '84px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '84px', borderRadius: '6px', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {type}
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                    {result.title}
                  </div>
                  {result.genres && (
                    <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', marginBottom: '6px' }}>
                      {result.genres.slice(0, 3).join(' · ')}
                    </div>
                  )}
                  {result.total_progress && (
                    <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.25)' }}>
                      {type === 'anime' ? `${result.total_progress} eps` : `${result.total_progress} chapters`}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '18px', color: 'rgba(232,230,224,0.15)', alignSelf: 'center' }}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}