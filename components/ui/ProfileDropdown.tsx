'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  name?: string | null;
  email?: string | null;
}

export default function ProfileDropdown({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initial = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : '?';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent)', border: 'none',
          color: '#0d0d0f', fontWeight: 700, fontSize: '14px',
          cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '40px', right: 0,
          background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '8px', zIndex: 100, width: '200px',
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8e6e0', marginBottom: '2px' }}>
              {name || 'anonymous'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)' }}>
              {email}
            </div>
          </div>

          {[
            { label: '⚙️ settings', action: () => { router.push('/settings'); setOpen(false); } },
            { label: '📊 stats', action: () => { router.push('/stats'); setOpen(false); } },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: 'rgba(232,230,224,0.6)', fontSize: '13px',
                padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
                borderRadius: '6px', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </button>
          ))}

          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', marginTop: '4px', paddingTop: '4px' }}>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: '#f87171', fontSize: '13px',
                padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
                borderRadius: '6px', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🚪 sign out
            </button>
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}