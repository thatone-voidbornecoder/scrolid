import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'anime';

  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  try {
    const mediaType = type === 'anime' ? 'ANIME' : 'MANGA';

    const graphqlQuery = `
      query ($search: String, $type: MediaType) {
        Page(perPage: 6) {
          media(search: $search, type: $type) {
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            episodes
            chapters
            genres
            description(asHtml: false)
            type
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: graphqlQuery, variables: { search: query, type: mediaType } }),
    });

    const data = await res.json();
    const media = data?.data?.Page?.media;

    if (!media || !Array.isArray(media)) {
      return NextResponse.json({ error: 'AniList API error', details: data }, { status: 500 });
    }

    const results = media.map((item: any) => ({
      title: item.title.romaji,
      english_title: item.title.english || null,
      cover_art: item.coverImage?.large || null,
      total_progress: type === 'anime' ? item.episodes : item.chapters,
      genres: item.genres || [],
      description: item.description || null,
      type: type,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
  }
}