"use client";
import { useEffect, useState } from "react";

// Replace with actual user ID from auth context/session
const CURRENT_USER_ID = "USER_ID_PLACEHOLDER";

export default function MoviesPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [friendId, setFriendId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch recommended movies for user
  useEffect(() => {
    fetch(`/api/movies?userId=${CURRENT_USER_ID}`)
      .then((res) => res.json())
      .then(setRecommendations);
  }, []);

  // Search movies
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/movies?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Search failed");
    }
    setLoading(false);
  };

  // Recommend a movie to a friend
  const recommendMovie = async (movieId: string) => {
    if (!friendId) {
      setError("Enter a friend user ID");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: CURRENT_USER_ID, toUserId: friendId, movieId }),
      });
      alert("Recommended!");
    } catch {
      setError("Failed to recommend");
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Movies</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
        />
        <button type="submit" disabled={loading}>Search</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <section>
        <h2>Search Results</h2>
        {results.length === 0 && <div>No movies found.</div>}
        <ul>
          {results.map((movie) => (
            <li key={movie.id}>
              {movie.title} <br />
              <input
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                placeholder="Friend User ID"
                style={{ marginRight: 8 }}
              />
              <button onClick={() => recommendMovie(movie.id)} disabled={loading}>
                Recommend to Friend
              </button>
              {/* Chat for this movie recommendation */}
              {typeof window !== "undefined" && (
                <>
                  {require("./MovieChat").default({ movieId: movie.id })}
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Recommended to Me</h2>
        {recommendations.length === 0 && <div>No recommendations yet.</div>}
        <ul>
          {recommendations.map((movie) => (
            <li key={movie.id}>{movie.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
