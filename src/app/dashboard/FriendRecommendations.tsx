"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface Recommendation {
    id: string;
    username: string;
    image: string | null;
    commonArtists: string[];
}

export default function FriendRecommendations({ userId }: { userId: string }) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetch(`/api/friends/recommendations?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setRecommendations(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [userId]);

    const sendRequest = async (toUserId: string) => {
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: userId, toUserId }),
            });
            if (res.ok) {
                setRecommendations((prev) => prev.filter((r) => r.id !== toUserId));
                toast("Friend request sent!", "success");
            } else {
                const err = await res.json();
                toast(err.error || "Failed to send request", "error");
            }
        } catch (e) {
            toast("Error sending request", "error");
        }
    };

    if (loading) return <div>Loading recommendations...</div>;
    if (recommendations.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Suggested Friends</h3>
            <div className="space-y-3">
                {recommendations.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {user.image ? (
                                    <img src={user.image} alt={user.username} className="w-10 h-10 rounded-full" />
                                ) : (
                                    user.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{user.username}</div>
                                <div className="text-xs text-gray-500">
                                    Follows {user.commonArtists.slice(0, 2).join(", ")}
                                    {user.commonArtists.length > 2 && ` +${user.commonArtists.length - 2}`}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => sendRequest(user.id)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
