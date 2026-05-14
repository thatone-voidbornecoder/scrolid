'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTrending(data); })
      .catch(() => {});
  }, []);

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`:root { --accent: #c084fc; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          scro<span style={{ color: 'var(--accent)' }}>lid</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/auth/login')}
            style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 20px', color: 'rgba(232,230,224,0.7)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            sign in
          </button>
          <button
            onClick={() => router.push('/auth/register')}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '8px 20px', color: '#0d0d0f', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            get started
          </button>
        </div>
      </div>

      {/* hero */}
      <div style={{ textAlign: 'center', padding: '80px 32px 60px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>
          your personal anime & manga tracker
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '56px', fontWeight: 800, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-1px' }}>
          every arc,<br />accounted for.
        </div>
        <div style={{ fontSize: '16px', color: 'rgba(232,230,224,0.45)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          track what you're watching, reading, and planning. built for the obsessed.
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/auth/register')}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '10px', padding: '14px 32px', color: '#0d0d0f', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            start tracking free
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 32px', color: 'rgba(232,230,224,0.7)', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            sign in
          </button>
        </div>
      </div>

      {/* trending */}
      {trending.length > 0 && (
        <div style={{ padding: '0 32px 60px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '16px' }}>
            trending right now
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {trending.slice(0, 10).map((item, i) => (
              <div key={i} style={{ cursor: 'pointer' }} onClick={() => router.push('/auth/register')}>
                {item.cover_art ? (
                  <img src={item.cover_art} alt={item.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '2/3', background: 'linear-gradient(135deg, #1a1035, #3b1f6e)', borderRadius: '8px', marginBottom: '8px' }} />
                )}
                <div style={{ fontSize: '12px', color: '#e8e6e0', fontWeight: 500, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(232,230,224,0.3)', marginTop: '2px' }}>
                  {item.genres?.slice(0, 2).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* features */}
      <div style={{ padding: '40px 32px 80px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '32px', textAlign: 'center' }}>
          everything you need
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {[
            { emoji: '📺', title: 'track everything', desc: 'anime, manga, and manhwa all in one place' },
            { emoji: '📊', title: 'detailed stats', desc: 'hours watched, chapters read, completion rate' },
            { emoji: '🎲', title: 'random pick', desc: 'can\'t decide? let scrolid choose for you' },
            { emoji: '🔍', title: 'smart search', desc: 'find anything with auto-filled metadata' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#161618', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{f.emoji}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(232,230,224,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '0.5px solid rgba(255,255,255,0.06)', fontSize: '12px', color: 'rgba(232,230,224,0.2)' }}>
        scrolid · every arc, accounted for.
      </div>
    </main>
  );
}