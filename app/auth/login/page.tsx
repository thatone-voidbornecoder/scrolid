'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '12px 14px', color: '#e8e6e0',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', width: '100%',
    boxSizing: 'border-box',
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
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>welcome back</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', display: 'block', marginBottom: '6px' }}>email</label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', display: 'block', marginBottom: '6px' }}>password</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                background: '#c084fc', border: 'none', borderRadius: '8px',
                padding: '12px', color: '#0d0d0f', fontWeight: 500,
                fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'signing in...' : 'sign in'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(232,230,224,0.4)' }}>
            don't have an account?{' '}
            <span
              onClick={() => router.push('/auth/register')}
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
            >
              sign up
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}