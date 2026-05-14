'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) return;
    if (password !== confirm) { setError('passwords do not match'); return; }
    if (password.length < 8) { setError('password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'registration failed');
        setLoading(false);
        return;
      }

      router.push('/auth/login?registered=true');
    } catch {
      setError('something went wrong');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '12px 14px', color: '#e8e6e0',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'rgba(232,230,224,0.35)', display: 'block', marginBottom: '6px',
  };

  return (
    <main style={{ background: '#0d0d0f', minHeight: '100vh', color: '#e8e6e0', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            scro<span style={{ color: 'var(--accent)' }}>lid</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(232,230,224,0.4)' }}>every arc, accounted for.</div>
        </div>

        <div style={{ background: '#161618', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>create account</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>name (optional)</label>
              <input
                type="text"
                style={inputStyle}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="your name"
              />
            </div>
            <div>
              <label style={labelStyle}>email</label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label style={labelStyle}>password</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="at least 8 characters"
              />
            </div>
            <div>
              <label style={labelStyle}>confirm password</label>
              <input
                type="password"
                style={inputStyle}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                background: '#c084fc', border: 'none', borderRadius: '8px',
                padding: '12px', color: '#0d0d0f', fontWeight: 500,
                fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'creating account...' : 'create account'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(232,230,224,0.4)' }}>
            already have an account?{' '}
            <span
              onClick={() => router.push('/auth/login')}
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
            >
              sign in
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}