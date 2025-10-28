import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { planLimits } from "@/lib/limits";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { videoId, platform, releaseDate } = await req.json() as {
    videoId: string; platform: string; releaseDate?: string; // ISO string for YouTube movie release
  };

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, plan: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Enforce platform + age for FREE
  if (user.plan === "FREE") {
    const limits = planLimits.FREE;
    if (platform !== limits.allowedPlatform) {
      return NextResponse.json({ error: "Free plan supports YouTube movies only." }, { status: 403 });
    }
    if (releaseDate) {
      const d = new Date(releaseDate);
      const cutoff = addDays(new Date(), -limits.minAgeDays);
      if (d > cutoff) {
        return NextResponse.json({ error: "Free plan: movie must be at least 1 year old." }, { status: 403 });
      }
    }
    const activeHosted = await db.watchSession.count({
      where: { hostUserId: user.id, isActive: true },
    });
    if (activeHosted >= limits.maxHostedSessions) {
      return NextResponse.json({ error: "Free plan can host up to 3 active watch parties." }, { status: 403 });
    }
  }

  const ws = await db.watchSession.create({
    data: {
      hostUserId: user.id,
      videoId,
      platform,
      scheduledTime: releaseDate ? new Date(releaseDate) : new Date(),
    },
  });
  return NextResponse.json({ id: ws.id });
}
