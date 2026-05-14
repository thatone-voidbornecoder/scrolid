import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // find JPEG/PNG pixel data and sample colors
    let r = 0, g = 0, b = 0, count = 0;
    const step = Math.floor(bytes.length / 200);
    
    for (let i = 0; i < bytes.length - 2; i += step) {
      const rv = bytes[i];
      const gv = bytes[i + 1];
      const bv = bytes[i + 2];
      if (rv > 20 || gv > 20 || bv > 20) {
        r += rv;
        g += gv;
        b += bv;
        count++;
      }
    }

    if (count === 0) return NextResponse.json({ color: '#1a1035' });

    r = Math.round((r / count) * 0.35);
    g = Math.round((g / count) * 0.35);
    b = Math.round((b / count) * 0.35);

    return NextResponse.json({ color: `rgb(${r},${g},${b})` });
  } catch {
    return NextResponse.json({ color: '#1a1035' });
  }
}