"use client";
import ChatClient from "../chat/ChatClient";

export default function SessionChat({ sessionId }: { sessionId: string }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h3>Session Live Chat</h3>
      <ChatClient sessionId={sessionId} />
    </section>
  );
}
