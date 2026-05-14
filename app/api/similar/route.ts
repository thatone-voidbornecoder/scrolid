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
        Page(perPage: 1) {
          media(search: $search, type: $type) {
            recommendations(perPage: 6) {
              nodes {
                mediaRecommendation {
                  title { romaji english }
                  coverImage { large }
                  genres
                  type
                  format
                }
              }
            }
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
    const recommendations = data?.data?.Page?.media?.[0]?.recommendations?.nodes
      ?.filter((n: any) => n.mediaRecommendation)
      ?.map((n: any) => ({
        title: n.mediaRecommendation.title.romaji,
        english_title: n.mediaRecommendation.title.english,
        cover_art: n.mediaRecommendation.coverImage?.large || null,
        genres: n.mediaRecommendation.genres || [],
        type: n.mediaRecommendation.type?.toLowerCase() || type,
        format: n.mediaRecommendation.format || null,
      })) || [];

    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}