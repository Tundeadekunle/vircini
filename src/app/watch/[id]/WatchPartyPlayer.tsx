"use client";

import { useEffect, useRef, useState } from "react";
import InviteModal from "./InviteModal";

// We'll use the YouTube IFrame Player API
// Add types for YT
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface WatchPartyPlayerProps {
    videoId: string;
    sessionId: string; // This is the ID of the WatchSession in DB
    currentUserId: string;
    isHost: boolean;
}

export default function WatchPartyPlayer({
    videoId,
    sessionId,
    currentUserId,
    isHost,
}: WatchPartyPlayerProps) {
    const playerRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
    const [chatInput, setChatInput] = useState("");

    // Initialize WebSocket
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3002");
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", sessionId, userId: currentUserId }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "sync") {
                handleSyncEvent(msg);
            } else if (msg.type === "chat") {
                setMessages((prev) => [...prev, { user: msg.userId, text: msg.message }]);
            }
        };

        return () => {
            ws.close();
        };
    }, [sessionId, currentUserId]);

    // Initialize YouTube Player
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = loadPlayer;
        } else {
            loadPlayer();
        }

        function loadPlayer() {
            playerRef.current = new window.YT.Player("player", {
                height: "100%",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: isHost ? 1 : 0, // Hide controls for non-hosts? Or allow but sync?
                    // Let's hide controls for non-hosts to enforce sync, or just rely on events.
                    // Enforcing sync is better.
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => setIsReady(true),
                    onStateChange: onPlayerStateChange,
                },
            });
        }
    }, [videoId, isHost]);

    const handleSyncEvent = (msg: any) => {
        if (!playerRef.current) return;
        // Ignore if we are the host and we just sent this?
        // Actually the server broadcasts to everyone.
        // If we are the host, we might get our own message back.
        // But if we initiated it, the player is already in that state.
        // So we should check if the state matches.

        const playerState = playerRef.current.getPlayerState();
        const currentTime = playerRef.current.getCurrentTime();

        if (msg.action === "play") {
            if (playerState !== 1) {
                playerRef.current.seekTo(msg.time, true);
                playerRef.current.playVideo();
            }
        } else if (msg.action === "pause") {
            if (playerState !== 2) {
                playerRef.current.pauseVideo();
                playerRef.current.seekTo(msg.time, true);
            }
        } else if (msg.action === "seek") {
            if (Math.abs(currentTime - msg.time) > 1) {
                playerRef.current.seekTo(msg.time, true);
            }
        }
    };

    const onPlayerStateChange = (event: any) => {
        if (!isHost || !wsRef.current) return;

        const time = event.target.getCurrentTime();

        if (event.data === window.YT.PlayerState.PLAYING) {
            wsRef.current.send(
                JSON.stringify({ type: "sync", action: "play", time, sessionId })
            );
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            wsRef.current.send(
                JSON.stringify({ type: "sync", action: "pause", time, sessionId })
            );
        }
        // Seeking is harder to detect directly with onStateChange sometimes, 
        // but usually it triggers PAUSED then PLAYING or BUFFERING.
    };

    const sendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !wsRef.current) return;
        wsRef.current.send(
            JSON.stringify({
                type: "chat",
                sessionId,
                userId: currentUserId, // Ideally username, but ID for now
                message: chatInput,
            })
        );
        setChatInput("");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Watch Party</h2>
                <button
                    onClick={() => setShowInvite(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Invite Friends
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
                {/* Video Player */}
                <div className="flex-1 bg-black relative">
                    <div id="player" className="w-full h-full"></div>
                    {!isHost && <div className="absolute inset-0 z-10 pointer-events-none"></div>}
                    {/* Overlay to prevent interaction if not host? 
              Actually, might want to allow volume control. 
              YouTube API 'controls: 0' hides everything. 
              Let's stick with controls: 0 for non-hosts in the config above.
          */}
                </div>

                {/* Chat */}
                <div className="w-full lg:w-80 bg-white border rounded flex flex-col">
                    <div className="p-3 border-b font-semibold">Chat</div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {messages.map((m, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-bold text-gray-700">{m.user}:</span> {m.text}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendChat} className="p-3 border-t flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Send
                        </button>
                    </form>
                </div>
            </div>

            <InviteModal
                isOpen={showInvite}
                onClose={() => setShowInvite(false)}
                sessionId={sessionId}
                currentUserId={currentUserId}
            />
        </div>
    );
}
