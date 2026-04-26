import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const entries = await sql`SELECT * FROM entries ORDER BY sort_order ASC, created_at DESC`;
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, status, cover_art, genres, description, current_progress, total_progress, priority, source } = body;

    const result = await sql`
      INSERT INTO entries (title, type, status, cover_art, genres, description, current_progress, total_progress, priority, source)
      VALUES (${title}, ${type}, ${status}, ${cover_art}, ${genres}, ${description}, ${current_progress}, ${total_progress}, ${priority}, ${source})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}