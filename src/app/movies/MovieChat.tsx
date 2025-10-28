"use client";
import ChatClient from "../chat/ChatClient";

export default function MovieChat({ movieId }: { movieId: string }) {
  // Use movieId as a unique chat session for recommendations
  return (
    <section style={{ marginTop: 16 }}>
      <h4>Discuss this Movie</h4>
      <ChatClient sessionId={movieId} />
    </section>
  );
}
