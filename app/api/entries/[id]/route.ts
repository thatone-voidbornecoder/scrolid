import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

const DEMO_USER_ID = '771655de-2d16-4ee8-b517-01c93d75447a';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    const userId = users[0]?.id;
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { id } = await params;

    // confirm this entry actually belongs to the logged-in user
    const owned = await sql`SELECT id FROM entries WHERE id = ${id} AND user_id = ${userId}`;
    if (owned.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, status, cover_art, genres, description, english_title, season, current_progress, total_progress, priority, source, rewatch_count, format, duration } = body;

    const result = await sql`
      UPDATE entries SET
        title = COALESCE(${title}, title),
        type = COALESCE(${type}, type),
        status = COALESCE(${status}, status),
        cover_art = COALESCE(${cover_art}, cover_art),
        genres = COALESCE(${genres}, genres),
        description = COALESCE(${description}, description),
        english_title = COALESCE(${english_title}, english_title),
        season = COALESCE(${season}, season),
        current_progress = COALESCE(${current_progress}, current_progress),
        total_progress = COALESCE(${total_progress}, total_progress),
        priority = COALESCE(${priority}, priority),
        source = COALESCE(${source}, source),
        rewatch_count = COALESCE(${rewatch_count}, rewatch_count),
        format = COALESCE(${format}, format),
        duration = COALESCE(${duration}, duration),
        updated_at = now()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    const userId = users[0]?.id;
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 });


    const { id } = await params;
    await sql`DELETE FROM entries WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}