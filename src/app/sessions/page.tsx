"use client";
import { useEffect, useState } from "react";

// Replace with actual user ID from auth context/session
const CURRENT_USER_ID = "USER_ID_PLACEHOLDER";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [movieId, setMovieId] = useState("");
  const [participantIds, setParticipantIds] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch sessions
  useEffect(() => {
    fetch(`/api/sessions?userId=${CURRENT_USER_ID}`)
      .then((res) => res.json())
      .then(setSessions);
  }, []);

  // Create session
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          hostUserId: CURRENT_USER_ID,
          participantUserIds: participantIds.split(",").map((id) => id.trim()).filter(Boolean),
          scheduledTime,
        }),
      });
      const data = await res.json();
      setSessions((prev) => [...prev, data]);
      setMovieId("");
      setParticipantIds("");
      setScheduledTime("");
    } catch {
      setError("Failed to create session");
    }
    setLoading(false);
  };

  // Join session
  const handleJoin = async (sessionId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: CURRENT_USER_ID }),
      });
      const data = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? data : s)));
    } catch {
      setError("Failed to join session");
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Group Watch Sessions</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          placeholder="Movie ID"
        />
        <input
          value={participantIds}
          onChange={(e) => setParticipantIds(e.target.value)}
          placeholder="Participant User IDs (comma separated)"
        />
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
        <button type="submit" disabled={loading}>Create Session</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <section>
        <h2>My Sessions</h2>
        {sessions.length === 0 && <div>No sessions found.</div>}
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              <div>
                <strong>Movie:</strong> {session.movie?.title || session.movieId} <br />
                <strong>Host:</strong> {session.hostUser?.username || session.hostUserId} <br />
                <strong>Participants:</strong> {session.participants?.map((p: any) => p.username).join(", ") || "None"} <br />
                <strong>Time:</strong> {session.scheduledTime ? new Date(session.scheduledTime).toLocaleString() : ""}
              </div>
              {!session.participants?.some((p: any) => p.id === CURRENT_USER_ID) && session.hostUserId !== CURRENT_USER_ID && (
                <button onClick={() => handleJoin(session.id)} disabled={loading} style={{ marginTop: 8 }}>
                  Join Session
                </button>
              )}
              {/* Live chat for this session */}
              <div style={{ marginTop: 16 }}>
                <strong>Live Chat:</strong>
                <br />
                {typeof window !== "undefined" && (
                  <>
                    {require("./SessionChat").default({ sessionId: session.id })}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
