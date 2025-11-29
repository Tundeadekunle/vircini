import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    // 1. Get user's followed artists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        followedArtists: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followedArtistIds = user.followedArtists.map((a) => a.id);
    if (followedArtistIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Find existing friends and pending requests to exclude
    const friendIds1 = await prisma.friend.findMany({
      where: { userId: userId },
      select: { friendId: true },
    });
    const friendIds2 = await prisma.friend.findMany({
      where: { friendId: userId },
      select: { userId: true },
    });
    
    const existingFriendIds = new Set([
        ...friendIds1.map(f => f.friendId), 
        ...friendIds2.map(f => f.userId),
        userId // exclude self
    ]);

    const sentRequests = await prisma.friendRequest.findMany({
        where: { fromUserId: userId },
        select: { toUserId: true }
    });
    const receivedRequests = await prisma.friendRequest.findMany({
        where: { toUserId: userId },
        select: { fromUserId: true }
    });

    const pendingIds = new Set([
        ...sentRequests.map(r => r.toUserId),
        ...receivedRequests.map(r => r.fromUserId)
    ]);

    const excludeIds = Array.from(new Set([...existingFriendIds, ...pendingIds]));

    // 3. Find users who follow at least one of the same artists
    const recommendedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        followedArtists: {
          some: {
            id: { in: followedArtistIds },
          },
        },
      },
      select: {
        id: true,
        username: true,
        image: true,
        followedArtists: {
            where: { id: { in: followedArtistIds } },
            select: { name: true }
        }
      },
      take: 10,
    });

    const results = recommendedUsers.map(u => ({
        id: u.id,
        username: u.username,
        image: u.image,
        commonArtists: u.followedArtists.map(a => a.name)
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching friend recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
