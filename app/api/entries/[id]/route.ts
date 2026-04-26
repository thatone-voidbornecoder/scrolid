import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, type, status, cover_art, genres, current_progress, total_progress, priority, source } = body;

    const result = await sql`
      UPDATE entries SET
        title = COALESCE(${title}, title),
        type = COALESCE(${type}, type),
        status = COALESCE(${status}, status),
        cover_art = COALESCE(${cover_art}, cover_art),
        genres = COALESCE(${genres}, genres),
        current_progress = COALESCE(${current_progress}, current_progress),
        total_progress = COALESCE(${total_progress}, total_progress),
        priority = COALESCE(${priority}, priority),
        source = COALESCE(${source}, source),
        updated_at = now()
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM entries WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}