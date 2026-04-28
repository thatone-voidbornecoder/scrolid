'use client';

import { useState, useEffect } from 'react';

const PRESET_COLORS = [
  { label: 'purple', value: '#c084fc' },
  { label: 'blue', value: '#60a5fa' },
  { label: 'green', value: '#4ade80' },
  { label: 'red', value: '#f87171' },
  { label: 'orange', value: '#fb923c' },
  { label: 'pink', value: '#f472b6' },
  { label: 'teal', value: '#2dd4bf' },
  { label: 'yellow', value: '#facc15' },
];

export default function ColorPicker() {
  const [accentColor, setAccentColor] = useState('#c084fc');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('scrolid-accent');
    if (saved) {
      setAccentColor(saved);
      document.documentElement.style.setProperty('--accent', saved);
    }
  }, []);

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('scrolid-accent', color);
    document.documentElement.style.setProperty('--accent', color);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: accentColor, border: '2px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', flexShrink: 0,
        }}
        title="change accent color"
      />

      {open && (
        <div style={{
          position: 'absolute', top: '36px', right: 0,
          background: '#161618', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '14px', zIndex: 100, width: '200px',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(232,230,224,0.35)', marginBottom: '10px' }}>
            accent color
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {PRESET_COLORS.map(preset => (
              <button
                key={preset.value}
                onClick={() => { handleColorChange(preset.value); setOpen(false); }}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: preset.value, cursor: 'pointer',
                  border: accentColor === preset.value ? '2px solid white' : '2px solid transparent',
                }}
                title={preset.label}
              />
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(232,230,224,0.35)', marginBottom: '6px' }}>custom</div>
            <input
              type="color"
              value={accentColor}
              onChange={e => handleColorChange(e.target.value)}
              style={{ width: '100%', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }}
            />
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}