import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, type, status, cover_art, genres, description, english_title, season, current_progress, total_progress, priority, source } = body;

    const result = await sql`
      UPDATE entries SET
        title = COALESCE(${title}, title),
        type = COALESCE(${type}, type),
        status = COALESCE(${status}, status),
        cover_art = COALESCE(${cover_art}, cover_art),
        genres = COALESCE(${genres}, genres),
        description = COALESCE(${description}, description),
        english_title = COALESCE(${english_title}, english_title),
        current_progress = COALESCE(${current_progress}, current_progress),
        total_progress = COALESCE(${total_progress}, total_progress),
        priority = COALESCE(${priority}, priority),
        source = COALESCE(${source}, source),
        updated_at = now()
        season = COALESCE(${season}, season),
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM entries WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}