import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subYears } from "date-fns";

// export async function GET() {
//   const cutoff = subYears(new Date(), 1);
//   const movies = await db.movie.findMany({
//     where: {
//       platform: "youtube",
//       releaseDate: { lte: cutoff },
//     },
//     orderBy: { releaseDate: "desc" },
//     take: 50,
//   });
//   return NextResponse.json(movies);
// }





// import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fetchYouTubeByArtist(artistName: string, maxResults = 6) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 6);
  const params = new URLSearchParams({
    part: "snippet",
    q: `${artistName} full movie`,
    type: "video",
    maxResults: String(maxResults),
    videoDuration: "long",
    videoEmbeddable: "true",
    publishedBefore: cutoff.toISOString(),
    key,
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((it: any) => ({
    id: it.id.videoId,
    title: it.snippet.title,
    thumbnail: it.snippet.thumbnails?.medium?.url,
    source: "youtube",
    publishedAt: it.snippet.publishedAt,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // get followed artists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { followedArtists: { include: { movies: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // collect movies from DB first
  let recommendations: any[] = [];
  for (const artist of user.followedArtists) {
    if (artist.movies && artist.movies.length) {
      recommendations.push(...artist.movies.map((m) => ({ ...m, source: "db", artistName: artist.name })));
    } else {
      // fallback: query YouTube
      const youTube = await fetchYouTubeByArtist(artist.name, 4);
      recommendations.push(...youTube.map((y:any) => ({ ...y, artistName: artist.name })));
    }
  }

  // dedupe and sort (recent first)
  const seen = new Set();
  const deduped = recommendations.filter((r) => {
    const key = r.id || r.youtubeId || r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a,b) => (new Date(b.publishedAt || b.createdAt || 0).getTime()) - (new Date(a.publishedAt || a.createdAt || 0).getTime()));

  return NextResponse.json(deduped.slice(0, 50));
}