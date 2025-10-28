import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { planLimits } from "@/lib/limits";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const watchSessionId = searchParams.get("watchSessionId")!;

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });

  const limit = user?.plan === "FREE"
    ? planLimits.FREE.maxChatMessagesVisible
    : user?.plan === "PREMIUM"
      ? planLimits.PREMIUM.maxChatMessagesVisible
      : planLimits.VIP.maxChatMessagesVisible;

  const messages = await db.chatMessage.findMany({
    where: { sessionId: watchSessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, username: true, image: true } } },
  });

  // return oldest->newest for UI
  return NextResponse.json(messages.reverse());
}
