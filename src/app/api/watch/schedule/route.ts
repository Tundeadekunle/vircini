import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { userId, movieId, videoId, platform, scheduledTime, inviteeIds, title } = await request.json();

        if (!userId || !scheduledTime || (!movieId && !videoId)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the session
        // Note: Using a simple token generation here. In a real app, might want something more robust.
        const sessionToken = uuidv4();

        const session = await prisma.watchSession.create({
            data: {
                hostUserId: userId,
                movieId: movieId || null,
                videoId: videoId || (movieId ? undefined : "unknown"), // Fallback if no videoId provided for custom
                platform: platform || "youtube",
                scheduledTime: new Date(scheduledTime),
                sessionToken: sessionToken,
                isActive: true,
            },
        });

        // Add host as participant
        await prisma.sessionParticipant.create({
            data: {
                sessionId: session.id,
                userId: userId,
                isHost: true,
            },
        });

        // Send notifications to invitees
        if (inviteeIds && inviteeIds.length > 0) {
            // Create notifications
            await prisma.notification.createMany({
                data: inviteeIds.map((inviteeId: string) => ({
                    userId: inviteeId,
                    type: "SESSION_INVITE",
                    title: "Watch Party Invite",
                    body: `You have been invited to watch "${title || 'a movie'}" on ${new Date(scheduledTime).toLocaleString()}`,
                    data: { sessionId: session.id, sessionToken },
                })),
            });

            // Also add them as participants? Or wait for them to accept?
            // Usually wait for accept. The notification handles the "invite".
        }

        return NextResponse.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("Error scheduling session:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
