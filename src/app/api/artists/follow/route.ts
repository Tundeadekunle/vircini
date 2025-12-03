import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, channelId, name, thumbnail } = body;
    if (!userId || !(channelId || name)) {
      return NextResponse.json({ error: "userId and channelId or name required" }, { status: 400 });
    }

    // create or find artist
    let artist = null;
    if (channelId) {
      artist = await prisma.artist.findFirst({ where: { youtubeChannel: channelId } });
    }
    if (!artist) {
      artist = await prisma.artist.findFirst({ where: { name } });
    }
    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name,
          youtubeChannel: channelId ?? undefined
        },
      });
    }

    // connect follow (idempotent)
    await prisma.user.update({
      where: { id: userId },
      data: { followedArtists: { connect: { id: artist.id } } },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { followedArtists: { select: { id: true, name: true, youtubeChannel: true } } },
    });

    return NextResponse.json({ ok: true, artist, followedArtists: user?.followedArtists ?? [] });
  } catch (err) {
    console.error("Artists follow POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, artistId } = body;
    if (!userId || !artistId) {
      return NextResponse.json({ error: "userId and artistId required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { followedArtists: { disconnect: { id: artistId } } },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { followedArtists: { select: { id: true, name: true, youtubeChannel: true } } },
    });

    return NextResponse.json({ ok: true, unfollowedArtistId: artistId, followedArtists: user?.followedArtists ?? [] });
  } catch (err) {
    console.error("Artists follow DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
