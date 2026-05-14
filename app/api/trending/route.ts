import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      query {
        Page(perPage: 10) {
          media(sort: TRENDING_DESC, type: ANIME) {
            title { romaji }
            coverImage { large }
            genres
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const results = data?.data?.Page?.media?.map((item: any) => ({
      title: item.title.romaji,
      cover_art: item.coverImage?.large || null,
      genres: item.genres || [],
    })) || [];

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}