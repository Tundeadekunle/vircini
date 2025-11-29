import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    try {
        // Fetch notifications of type SESSION_INVITE
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
                type: "SESSION_INVITE",
                // isRead: false // Optional: only show unread?
            },
            orderBy: { createdAt: "desc" },
        });

        // Enrich with videoId from session if possible
        // We can do this in a loop or just return data and let frontend handle (or link to session)
        // But frontend needs videoId to build the URL /watch/[videoId]

        const enriched = await Promise.all(notifications.map(async (n) => {
            const data = n.data as any;
            if (data && data.sessionId) {
                const session = await prisma.watchSession.findUnique({
                    where: { id: data.sessionId },
                    select: { videoId: true }
                });
                if (session) {
                    return { ...n, data: { ...data, videoId: session.videoId } };
                }
            }
            return n;
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
