import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function fetchYouTubeByArtist(artistName: string, maxResults = 6, olderThanSixMonths = true) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const params: any = {
    part: "snippet",
    q: `${artistName} full movie`,
    type: "video",
    maxResults: String(maxResults),
    videoDuration: "long",
    videoEmbeddable: "true",
    key,
  };
  if (olderThanSixMonths) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    params.publishedBefore = cutoff.toISOString();
  }
  const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || [])
    .map((it: any) => {
      const vid = it.id?.videoId;
      if (!vid) return null;
      return {
        id: vid,
        title: it.snippet.title,
        thumbnail: it.snippet.thumbnails?.medium?.url,
        source: "youtube",
        publishedAt: it.snippet.publishedAt,
      };
    })
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { followedArtists: { include: { movies: true } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = user.plan ?? "FREE";
    const freeCutoff = new Date();
    freeCutoff.setMonth(freeCutoff.getMonth() - 6);

    const recommendations: any[] = [];

    for (const artist of user.followedArtists) {
      // DB movies: include based on user's plan
      if (artist.movies && artist.movies.length) {
        const dbMovies = artist.movies.filter((m: any) => {
          if (plan === "FREE") {
            // only allow YouTube-hosted movies older than 6 months for free users
            return (m.platform === "youtube" || m.youtubeId) && new Date(m.releaseDate || m.createdAt || 0) <= freeCutoff;
          }
          // PREMIUM or other plans see all DB movies
          return true;
        }).map((m: any) => ({ ...m, source: "db", artistName: artist.name }));
        recommendations.push(...dbMovies);
      }

      // YouTube fallback: free users require older-than-6-months, premium can get recent too
      const older = plan === "FREE";
      const youTube = await fetchYouTubeByArtist(artist.name, 4, older);
      recommendations.push(...youTube.map((y: any) => ({ ...y, artistName: artist.name })));
    }

    // dedupe by id/title
    const seen = new Set<string>();
    const deduped = recommendations.filter((r) => {
      const key = r.source === "db" ? `db:${r.id}` : `yt:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // sort by published/created date desc
    deduped.sort((a, b) => {
      const ta = new Date(a.publishedAt || a.releaseDate || a.createdAt || 0).getTime();
      const tb = new Date(b.publishedAt || b.releaseDate || b.createdAt || 0).getTime();
      return tb - ta;
    });

    return NextResponse.json(deduped.slice(0, 50));
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}