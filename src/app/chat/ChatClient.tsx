"use client";
import { useEffect, useRef, useState } from "react";

// Replace with actual user/session IDs from auth/session context
const CURRENT_USER_ID = "USER_ID_PLACEHOLDER";

export default function ChatClient({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial chat history
    fetch(`/api/chat?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then(setMessages);

    // Connect to WebSocket server
    ws.current = new WebSocket("ws://localhost:3002");
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "join", sessionId }));
    };
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "chat") {
        setMessages((prev) => [...prev, msg]);
      }
    };
    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "chat", sessionId, userId: CURRENT_USER_ID, message: input })
      );
      setInput("");
    }
  };

  return (
    <div>
      <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", marginBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.userId}</b>: {msg.message} <span style={{ color: "#888", fontSize: 10 }}>{msg.timestamp}</span>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: 8 }}>Send</button>
    </div>
  );
}
