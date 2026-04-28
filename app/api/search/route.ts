import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'anime';

  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  try {
    if (type === 'anime') {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=6`);
      const data = await res.json();
      const results = data.data.map((item: any) => ({
        title: item.title,
        cover_art: item.images.jpg.large_image_url,
        total_progress: item.episodes,
        genres: item.genres.map((g: any) => g.name),
        description: item.synopsis || null,
        english_title: item.title_english || null,
        type: 'anime'
      }));
      return NextResponse.json(results);

    } else {
      const res = await fetch(`https://api.jikan.moe/v4/manga?q=${query}&limit=6`);
      const data = await res.json();
      const results = data.data.map((item: any) => ({
        title: item.title,
        cover_art: item.images.jpg.large_image_url,
        total_progress: item.chapters,
        genres: item.genres.map((g: any) => g.name),
        description: item.synopsis || null,
        english_title: item.title_english || null,
        type: type
      }));
      return NextResponse.json(results);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}