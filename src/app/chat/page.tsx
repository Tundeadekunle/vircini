import ChatClient from "./ChatClient";

// For demo, use a hardcoded sessionId or get from query params
const DEMO_SESSION_ID = "SESSION_ID_PLACEHOLDER";

export default function ChatPage() {
  return (
    <main>
      <h1>Live Chat</h1>
      <ChatClient sessionId={DEMO_SESSION_ID} />
    </main>
  );
}
