import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { requestId } = body;

        if (!requestId) {
            return NextResponse.json({ error: "Request ID required" }, { status: 400 });
        }

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: requestId },
        });

        if (!friendRequest || friendRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Update request status
        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" },
        });

        // Create Friend records (bidirectional)
        await prisma.$transaction([
            prisma.friend.create({
                data: {
                    userId: friendRequest.fromUserId,
                    friendId: friendRequest.toUserId,
                },
            }),
            prisma.friend.create({
                data: {
                    userId: friendRequest.toUserId,
                    friendId: friendRequest.fromUserId,
                },
            }),
        ]);

        // Notify sender
        await prisma.notification.create({
            data: {
                userId: friendRequest.fromUserId,
                type: "OTHER",
                title: "Friend Request Accepted",
                body: "Your friend request was accepted",
                data: { friendId: friendRequest.toUserId }
            }
        });

        // Trigger WebSocket notification
        try {
            await fetch('http://localhost:3002/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'FRIEND_ACCEPTED',
                    userId: friendRequest.fromUserId,
                    payload: { friendId: friendRequest.toUserId }
                })
            });
        } catch (e) {
            // console.error("Failed to notify WS server", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
