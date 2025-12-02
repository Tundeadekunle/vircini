"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface FriendRequest {
    id: string;
    fromUser: {
        id: string;
        username: string | null;
        image: string | null;
    };
}

export default function FriendRequests({ userId }: { userId: string }) {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const { toast } = useToast();

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/friends/pending?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchRequests();

        // Listen for real-time updates
        const ws = new WebSocket("ws://localhost:3002");
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", userId }));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "FRIEND_REQUEST") {
                fetchRequests(); // Refresh on new request
                toast("New friend request received!", "info");
            }
        };
        return () => ws.close();
    }, [userId, toast]);

    const respond = async (requestId: string, accept: boolean) => {
        if (accept) {
            try {
                const res = await fetch("/api/friends/accept", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ requestId })
                });
                if (res.ok) {
                    toast("Friend request accepted", "success");
                } else {
                    toast("Failed to accept request", "error");
                }
            } catch (e) {
                toast("Error accepting request", "error");
            }
        } else {
            // Decline logic (UI only for now as per previous implementation, but let's add toast)
            toast("Friend request declined", "info");
        }
        setRequests(prev => prev.filter(r => r.id !== requestId));
    };

    if (requests.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-3 text-red-600">Friend Requests</h3>
            <div className="space-y-3">
                {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {req.fromUser.image ? (
                                    <img src={req.fromUser.image} alt={req.fromUser.username || "User"} className="w-8 h-8 rounded-full" />
                                ) : (
                                    req.fromUser.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="font-medium text-sm">{req.fromUser.username}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => respond(req.id, true)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Accept</button>
                            <button onClick={() => respond(req.id, false)} className="text-xs bg-gray-300 text-black px-2 py-1 rounded">Decline</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
