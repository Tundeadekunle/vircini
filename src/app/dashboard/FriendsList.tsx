"use client";

import { useState, useEffect } from "react";

interface Friend {
    id: string;
    friend: {
        id: string;
        username: string;
        image: string | null;
    };
}

export default function FriendsList({ userId }: { userId: string }) {
    const [friends, setFriends] = useState<Friend[]>([]);

    const fetchFriends = async () => {
        // Need an endpoint for this too. I'll create /api/friends/list/route.ts
        try {
            const res = await fetch(`/api/friends/list?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setFriends(data);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchFriends();

        // Listen for friend acceptance via WS
        const ws = new WebSocket("ws://localhost:3002");
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", userId }));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "FRIEND_ACCEPTED") {
                fetchFriends();
            }
        };
        return () => ws.close();
    }, [userId]);

    if (friends.length === 0) return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Friends</h3>
            <p className="text-sm text-gray-500">No friends yet.</p>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Friends ({friends.length})</h3>
            <div className="space-y-3">
                {friends.map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {f.friend.image ? (
                                <img src={f.friend.image} alt={f.friend.username} className="w-8 h-8 rounded-full" />
                            ) : (
                                f.friend.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="font-medium text-sm">{f.friend.username}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
