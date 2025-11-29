"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Invite {
    id: string;
    data: any;
    createdAt: string;
}

export default function InvitesList({ userId }: { userId: string }) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    const fetchInvites = async () => {
        try {
            const res = await fetch(`/api/watch/invites?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setInvites(data);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchInvites();

        const ws = new WebSocket("ws://localhost:3002");
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", userId }));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "SESSION_INVITE") {
                fetchInvites();
                toast("You have a new watch party invite!", "info");
            }
        };
        return () => ws.close();
    }, [userId, toast]);

    const handleRespond = async (invite: Invite, action: "accept" | "decline") => {
        try {
            const res = await fetch("/api/watch/invite/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: invite.id, action }),
            });

            if (res.ok) {
                setInvites(prev => prev.filter(i => i.id !== invite.id));
                if (action === "accept") {
                    const videoId = invite.data.videoId || 'unknown';
                    router.push(`/watch/${videoId}?sessionId=${invite.data.sessionId}`);
                    toast("Joining watch party...", "success");
                } else {
                    toast("Invite declined", "info");
                }
            } else {
                toast("Failed to process request", "error");
            }
        } catch (e) {
            toast("Error processing request", "error");
        }
    };

    if (invites.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-purple-500">
            <h3 className="font-semibold mb-3 text-purple-700">Watch Party Invites</h3>
            <div className="space-y-3">
                {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                        <div className="text-sm">
                            <span className="font-medium">User {invite.data.fromUserId}</span> invited you.
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleRespond(invite, "accept")}
                                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleRespond(invite, "decline")}
                                className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
