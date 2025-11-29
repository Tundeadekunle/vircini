import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { notificationId, action } = await request.json();

        if (!notificationId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (action === "decline" || action === "accept") {
            // For both accept and decline, we remove the notification
            // If accept, the frontend handles the redirection to the session
            // We could theoretically mark it as read, but deleting it cleans up the list
            await prisma.notification.delete({
                where: { id: notificationId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
