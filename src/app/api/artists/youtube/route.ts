import { NextRequest, NextResponse } from "next/server";
import { fetchYouTubeArtists } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "movie actor";
  const max = Number(searchParams.get("max") || 20);
  const artists = await fetchYouTubeArtists(q, max);
  return NextResponse.json(artists);
}