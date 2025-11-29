import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fromUserId, toUserId } = body;

        if (!fromUserId || !toUserId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (fromUserId === toUserId) {
            return NextResponse.json({ error: "Cannot add self" }, { status: 400 });
        }

        // Check if request already exists
        const existing = await prisma.friendRequest.findFirst({
            where: {
                fromUserId,
                toUserId,
                status: "PENDING",
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 });
        }

        // Check if already friends
        const existingFriend = await prisma.friend.findFirst({
            where: {
                userId: fromUserId,
                friendId: toUserId
            }
        });
        if (existingFriend) {
            return NextResponse.json({ error: "Already friends" }, { status: 400 });
        }

        const friendRequest = await prisma.friendRequest.create({
            data: {
                fromUserId,
                toUserId,
                status: "PENDING",
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: toUserId,
                type: "FRIEND_REQUEST",
                title: "New Friend Request",
                body: "You have a new friend request",
                data: { requestId: friendRequest.id, fromUserId }
            }
        });

        // Trigger WebSocket notification
        try {
            await fetch('http://localhost:3002/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'FRIEND_REQUEST',
                    userId: toUserId,
                    payload: { requestId: friendRequest.id, fromUserId }
                })
            });
        } catch (e) {
            // console.error("Failed to notify WS server", e);
        }

        return NextResponse.json(friendRequest);
    } catch (error) {
        console.error("Error creating friend request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
