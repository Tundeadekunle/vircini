"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface Friend {
    id: string;
    friend: {
        id: string;
        username: string;
        image: string | null;
    };
}

export default function InviteModal({
    isOpen,
    onClose,
    sessionId,
    currentUserId,
}: {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    currentUserId: string;
}) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [invited, setInvited] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetch(`/api/friends/list?userId=${currentUserId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setFriends(data);
                });
        }
    }, [isOpen, currentUserId]);

    const invite = async (friendId: string) => {
        try {
            const res = await fetch("/api/watch/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromUserId: currentUserId,
                    toUserId: friendId,
                    sessionId,
                }),
            });
            if (res.ok) {
                setInvited((prev) => new Set(prev).add(friendId));
                toast("Invite sent!", "success");
            } else {
                toast("Failed to send invite", "error");
            }
        } catch (e) {
            toast("Error sending invite", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Invite Friends</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        ✕
                    </button>
                </div>
                <div className="space-y-3">
                    {friends.length === 0 ? (
                        <p className="text-gray-500">No friends found.</p>
                    ) : (
                        friends.map((f) => (
                            <div key={f.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        {f.friend.image ? (
                                            <img src={f.friend.image} alt={f.friend.username} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            f.friend.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span>{f.friend.username}</span>
                                </div>
                                <button
                                    onClick={() => invite(f.friend.id)}
                                    disabled={invited.has(f.friend.id)}
                                    className={`px-3 py-1 rounded text-xs ${invited.has(f.friend.id)
                                        ? "bg-gray-300 text-gray-600"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {invited.has(f.friend.id) ? "Invited" : "Invite"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
