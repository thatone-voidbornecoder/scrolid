import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    const userId = users[0]?.id;
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const entries = await sql`
      SELECT * FROM entries WHERE user_id = ${userId}
      ORDER BY sort_order ASC, created_at DESC
    `;
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    const userId = users[0]?.id;
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { title, type, status, cover_art, genres, description, english_title, season, current_progress, total_progress, priority, source, rewatch_count, format, duration } = body;

    const result = await sql`
      INSERT INTO entries (user_id, title, type, status, cover_art, genres, description, english_title, season, current_progress, total_progress, priority, source, rewatch_count, format, duration)
      VALUES (${userId}, ${title}, ${type}, ${status}, ${cover_art}, ${genres}, ${description}, ${english_title}, ${season}, ${current_progress}, ${total_progress}, ${priority}, ${source}, ${rewatch_count}, ${format}, ${duration})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}