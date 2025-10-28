import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") || searchParams.get("country");
  const q = searchParams.get("q");

  const where: any = {};
  if (industry) where.country = industry;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const artists = await prisma.artist.findMany({
    where,
    include: { movies: { select: { id: true, title: true } } },
    orderBy: { name: "asc" },
    take: 200,
  });
  return NextResponse.json(artists);
}

// Follow/unfollow handled in separate endpoints below (POST/DELETE)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, artistId } = body;
  if (!userId || !artistId) return NextResponse.json({ error: "userId and artistId required" }, { status: 400 });
  await prisma.user.update({
    where: { id: userId },
    data: { followedArtists: { connect: { id: artistId } } },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { userId, artistId } = body;
  if (!userId || !artistId) return NextResponse.json({ error: "userId and artistId required" }, { status: 400 });
  await prisma.user.update({
    where: { id: userId },
    data: { followedArtists: { disconnect: { id: artistId } } },
  });
  return NextResponse.json({ ok: true });
}