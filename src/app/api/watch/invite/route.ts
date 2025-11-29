import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fromUserId, toUserId, sessionId } = body;

        if (!fromUserId || !toUserId || !sessionId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create notification
        await prisma.notification.create({
            data: {
                userId: toUserId,
                type: "SESSION_INVITE",
                title: "Watch Party Invite",
                body: "You have been invited to a watch party",
                data: { sessionId, fromUserId }
            }
        });

        // Trigger WebSocket notification
        try {
            await fetch('http://localhost:3002/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'SESSION_INVITE',
                    userId: toUserId,
                    payload: { sessionId, fromUserId }
                })
            });
        } catch (e) {
            // console.error("Failed to notify WS server", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending invite:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
