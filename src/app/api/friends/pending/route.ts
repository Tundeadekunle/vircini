import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    try {
        const requests = await prisma.friendRequest.findMany({
            where: {
                toUserId: userId,
                status: "PENDING",
            },
            include: {
                fromUser: {
                    select: { id: true, username: true, image: true },
                },
            },
        });

        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
