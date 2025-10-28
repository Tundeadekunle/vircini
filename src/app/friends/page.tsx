"use client";
import { useEffect, useState } from "react";

// Replace with actual user ID from auth context/session
const CURRENT_USER_ID = "USER_ID_PLACEHOLDER";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch friends
  useEffect(() => {
    fetch(`/api/friends?userId=${CURRENT_USER_ID}`)
      .then((res) => res.json())
      .then(setFriends);
  }, []);

  // Fetch incoming friend requests
  useEffect(() => {
    fetch(`/api/friends/requests?userId=${CURRENT_USER_ID}`)
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  // Search users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/friends?userId=${CURRENT_USER_ID}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Search failed");
    }
    setLoading(false);
  };

  // Send friend request
  const sendRequest = async (toUserId: string) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: CURRENT_USER_ID, toUserId }),
      });
      alert("Request sent!");
    } catch {
      setError("Failed to send request");
    }
    setLoading(false);
  };

  // Accept/decline friend request
  const handleRequest = async (requestId: string, action: "accept" | "decline") => {
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/friends`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (action === "accept") {
        // Optionally refresh friends list
        fetch(`/api/friends?userId=${CURRENT_USER_ID}`)
          .then((res) => res.json())
          .then(setFriends);
      }
    } catch {
      setError("Failed to update request");
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Friends</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
        />
        <button type="submit" disabled={loading}>Search</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <section>
        <h2>Search Results</h2>
        {results.length === 0 && <div>No users found.</div>}
        <ul>
          {results.map((user) => (
            <li key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => sendRequest(user.id)} disabled={loading} style={{ marginLeft: 8 }}>
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Friends List</h2>
        {friends.length === 0 && <div>No friends yet.</div>}
        <ul>
          {friends.map((friend) => (
            <li key={friend.id}>{friend.username} ({friend.email})</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Incoming Friend Requests</h2>
        {requests.length === 0 && <div>No requests.</div>}
        <ul>
          {requests.map((req) => (
            <li key={req.id}>
              From: {req.fromUser?.username || req.fromUserId}
              <button onClick={() => handleRequest(req.id, "accept")} disabled={loading} style={{ marginLeft: 8 }}>
                Accept
              </button>
              <button onClick={() => handleRequest(req.id, "decline")} disabled={loading} style={{ marginLeft: 8 }}>
                Decline
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
