"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Friend {
    id: string;
    friend: {
        id: string;
        username: string | null;
        image: string | null;
    };
}

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: Friend[];
    userId: string;
}

export default function ScheduleSessionModal({ isOpen, onClose, friends, userId }: ScheduleSessionModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [movieTitle, setMovieTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [scheduledTime, setScheduledTime] = useState("");

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleFriend = (id: string) => {
        const newSelected = new Set(selectedFriends);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedFriends(newSelected);
    };

    const handleSubmit = async () => {
        try {
            // Extract video ID from URL if possible, or just send as is
            let videoId = "unknown";
            try {
                const url = new URL(youtubeUrl);
                videoId = url.searchParams.get("v") || videoId;
            } catch (e) { }

            const res = await fetch("/api/watch/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    title: movieTitle,
                    videoId, // In a real app, we'd validate this
                    scheduledTime,
                    inviteeIds: Array.from(selectedFriends),
                }),
            });

            if (res.ok) {
                toast("Watch party scheduled!", "success");
                onClose();
                // Reset form
                setStep(1);
                setMovieTitle("");
                setYoutubeUrl("");
                setSelectedFriends(new Set());
                setScheduledTime("");
            } else {
                toast("Failed to schedule session", "error");
            }
        } catch (e) {
            toast("Error scheduling session", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Schedule Watch Party</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Step 1: Choose Movie</h4>
                        <div>
                            <label className="block text-sm font-medium mb-1">Movie Title</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={movieTitle}
                                onChange={(e) => setMovieTitle(e.target.value)}
                                placeholder="e.g. Big Buck Bunny"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">YouTube URL</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!movieTitle || !youtubeUrl}
                                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Step 2: Invite Friends</h4>
                        <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                            {friends.length === 0 ? (
                                <p className="text-gray-500 text-sm">No friends to invite.</p>
                            ) : (
                                friends.map((f) => (
                                    <div key={f.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedFriends.has(f.friend.id)}
                                            onChange={() => toggleFriend(f.friend.id)}
                                            className="rounded"
                                        />
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            {f.friend.image ? (
                                                <img src={f.friend.image} alt={f.friend.username || "User"} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                f.friend.username?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm">{f.friend.username}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleBack} className="text-gray-600 px-4 py-2">Back</button>
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Step 3: Date & Time</h4>
                        <div>
                            <label className="block text-sm font-medium mb-1">Schedule Time</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded p-2"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleBack} className="text-gray-600 px-4 py-2">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!scheduledTime}
                                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
