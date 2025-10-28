// "use client";
// import { useEffect, useState } from "react";
// type Artist = { id: string; name: string; country?: string; movies?: any[] };

// export default function ArtistsList({ currentUserId }: { currentUserId: string }) {
//   const [artists, setArtists] = useState<Artist[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

// async function load() {
//     setLoading(true);
//     setError(null);
//     try {
//       const url = currentUserId ? `/api/artists?userId=${currentUserId}` : `/api/artists`;
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to load artists");
//       const data = await res.json();
//       setArtists(data);
//     } catch (err: any) {
//       setError(err.message || "Error");
//     } finally {
//       setLoading(false);
//     }
//   }




  // useEffect(() => { fetch("/api/artists").then(r=>r.json()).then(setArtists); }, []);

  // const toggleFollow = async (artistId: string, follow: boolean) => {
  //   const url = "/api/artists";
  //   const init = follow ? { method: "POST", body: JSON.stringify({ userId: currentUserId, artistId }) } :
  //                       { method: "DELETE", body: JSON.stringify({ userId: currentUserId, artistId }) };
  //   await fetch(url, { ...init, headers: { "Content-Type": "application/json" }});
  //   // optimistic UI: refetch
  //   setArtists((prev) => prev.map(a => a));
  // };



//   useEffect(() => { load(); }, [currentUserId]);

//   const toggleFollow = async (artistId: string, follow: boolean) => {
//     try {
//       const method = follow ? "POST" : "DELETE";
//       await fetch("/api/artists", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: currentUserId, artistId }),
//       });
//       // refresh list to reflect follows
//       await load();
//     } catch {
//       // ignore for now
//     }
//   };

//   if (loading) return <div>Loading artists...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div>
//       <h2>Artists</h2>
//       <ul>
//         {artists.map(a => (
//           <li key={a.id} className="py-2">
//             <strong>{a.name}</strong> <span className="text-sm text-gray-500">{a.country}</span>
//             <div>
//               <button onClick={() => toggleFollow(a.id, true)} className="mr-2">Follow</button>
//               <button onClick={() => toggleFollow(a.id, false)}>Unfollow</button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }






















// "use client";
// import { useEffect, useState } from "react";

// type ArtistItem = { id: string; name: string; country?: string; youtubeChannel?: string; isFollowed?: boolean };

// export default function ArtistsList({ currentUserId }: { currentUserId: string }) {
//   const [artistsDb, setArtistsDb] = useState<ArtistItem[]>([]);
//   const [ytCandidates, setYtCandidates] = useState<any[]>([]);
//   const [query, setQuery] = useState("movie actor");
//   const [loading, setLoading] = useState(false);

//   async function loadDb() {
//     const res = await fetch(`/api/artists?userId=${currentUserId}`);
//     if (res.ok) setArtistsDb(await res.json());
//   }

//   async function searchYoutube() {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/artists/youtube?q=${encodeURIComponent(query)}&max=12`);
//       if (res.ok) setYtCandidates(await res.json());
//     } finally { setLoading(false); }
//   }

//   useEffect(() => { loadDb(); }, [currentUserId]);

//   const followFromYoutube = async (item: any) => {
//     // send to follow endpoint which upserts artist then connects to user
//     await fetch(`/api/artists/follow`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: currentUserId,
//         channelId: item.channelId,
//         name: item.name,
//         thumbnail: item.thumbnail,
//       }),
//     });
//     await loadDb();
//   };

//   const unfollow = async (artistId: string) => {
//     await fetch(`/api/artists/follow`, {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId: currentUserId, artistId }),
//     });
//     await loadDb();
//   };

//   return (
//     <div>
//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-1">Find artists on YouTube</label>
//         <div className="flex gap-2">
//           <input className="border rounded px-2 py-1 flex-1" value={query} onChange={(e) => setQuery(e.target.value)} />
//           <button className="bg-blue-600 text-white px-3 rounded" onClick={searchYoutube} disabled={loading}>{loading ? "Searching..." : "Search"}</button>
//         </div>
//         {ytCandidates.length > 0 && (
//           <div className="mt-2 bg-white rounded shadow p-2 max-h-64 overflow-auto">
//             {ytCandidates.map((c: any) => (
//               <div key={c.channelId} className="flex items-center justify-between py-1">
//                 <div className="flex items-center gap-2">
//                   {c.thumbnail && <img src={c.thumbnail} alt="" width={36} height={36} className="rounded" />}
//                   <div>
//                     <div className="font-medium text-sm">{c.name}</div>
//                     <div className="text-xs text-gray-500">{c.description}</div>
//                   </div>
//                 </div>
//                 <div>
//                   <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => followFromYoutube(c)}>Follow</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div>
//         <h3 className="text-sm font-semibold mb-2">Artists you follow</h3>
//         <div className="space-y-2">
//           {artistsDb.length === 0 && <div className="text-sm text-gray-500">You are not following any artists yet.</div>}
//           {artistsDb.map((a) => (
//             <div key={a.id} className="flex items-center justify-between bg-white p-2 rounded shadow">
//               <div>
//                 <div className="font-medium">{a.name}</div>
//                 {a.country && <div className="text-xs text-gray-500">{a.country}</div>}
//               </div>
//               <div>
//                 <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => unfollow(a.id)}>Unfollow</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }






















"use client";
import { useEffect, useState } from "react";

type FollowedArtist = { id: string; name: string; youtubeChannel?: string; thumbnail?: string };
type YtCandidate = { channelId: string; name: string; description?: string; thumbnail?: string };

export default function ArtistsList({ currentUserId }: { currentUserId: string }) {
  const [followed, setFollowed] = useState<FollowedArtist[]>([]);
  const [ytCandidates, setYtCandidates] = useState<YtCandidate[]>([]);
  const [query, setQuery] = useState("movie actor");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  async function loadFollowed() {
    if (!currentUserId) return setFollowed([]);
    try {
      const res = await fetch(`/api/artists?userId=${encodeURIComponent(currentUserId)}`);
      if (!res.ok) return;
      const data = await res.json();
      // API returns enriched artist list with isFollowed flag; extract only truly followed artists
      const onlyFollowed = (data || []).filter((a: any) => a.isFollowed).map((a: any) => ({
        id: a.id,
        name: a.name,
        youtubeChannel: a.youtubeChannel,
        thumbnail: a.thumbnail,
      }));
      setFollowed(onlyFollowed);
    } catch {
      setFollowed([]);
    }
  }

  useEffect(() => {
    loadFollowed();
  }, [currentUserId]);

  async function searchYoutube() {
    setSearching(true);
    try {
      const res = await fetch(`/api/artists/youtube?q=${encodeURIComponent(query)}&max=12`);
      if (!res.ok) {
        setYtCandidates([]);
        return;
      }
      const data = await res.json();
      setYtCandidates(data || []);
    } finally {
      setSearching(false);
    }
  }

  async function followFromYoutube(item: YtCandidate) {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/artists/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          channelId: item.channelId,
          name: item.name,
          thumbnail: item.thumbnail,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      // API returns updated followedArtists list; use it to update UI immediately
      if (data.followedArtists) {
        setFollowed(data.followedArtists);
      } else {
        // fallback: reload from server
        await loadFollowed();
      }
    } finally {
      setLoading(false);
    }
  }

  async function unfollow(artistId: string) {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/artists/follow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, artistId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      // API returns updated followedArtists; update UI
      if (data.followedArtists) {
        setFollowed(data.followedArtists);
      } else {
        // fallback: remove locally
        setFollowed((prev) => prev.filter((a) => a.id !== artistId));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Find artists on YouTube</label>
        <div className="flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube channels (e.g. actor name)"
          />
          <button
            className="bg-blue-600 text-white px-3 rounded"
            onClick={searchYoutube}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {ytCandidates.length > 0 && (
          <div className="mt-2 bg-white rounded shadow p-2 max-h-64 overflow-auto">
            {ytCandidates.map((c) => {
              const alreadyFollowed = followed.some((f) => f.youtubeChannel === c.channelId || f.name === c.name);
              return (
                <div key={c.channelId} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {c.thumbnail && <img src={c.thumbnail} alt="" width={36} height={36} className="rounded" />}
                    <div>
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{c.description}</div>
                    </div>
                  </div>
                  <div>
                    <button
                      className={`px-2 py-1 rounded ${alreadyFollowed ? "bg-gray-400 text-white" : "bg-green-600 text-white"}`}
                      onClick={() => followFromYoutube(c)}
                      disabled={loading || alreadyFollowed}
                    >
                      {alreadyFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Artists you follow</h3>
        <div className="space-y-2">
          {followed.length === 0 ? (
            <div className="text-sm text-gray-500">You are not following any artists yet.</div>
          ) : (
            followed.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white p-2 rounded shadow">
                <div className="flex items-center gap-3">
                  {a.thumbnail && <img src={a.thumbnail} alt={a.name} width={40} height={40} className="rounded" />}
                  <div>
                    <div className="font-medium">{a.name}</div>
                    {a.youtubeChannel && <div className="text-xs text-gray-500">Channel: {a.youtubeChannel}</div>}
                  </div>
                </div>
                <div>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => unfollow(a.id)} disabled={loading}>
                    Unfollow
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}