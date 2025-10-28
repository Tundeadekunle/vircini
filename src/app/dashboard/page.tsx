// import Link from "next/link";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import ArtistsList from "../artists/ArtistsList";
// import Recommendations from "./Recommendations";
// import { prisma } from "@/lib/prisma";

// async function fetchYouTubeMovies(maxResults = 12) {
//   const key = process.env.YOUTUBE_API_KEY;
//   if (!key) return [];
//   const cutoff = new Date();
//   cutoff.setMonth(cutoff.getMonth() - 6);
//   const publishedBefore = cutoff.toISOString();

//   const params = new URLSearchParams({
//     part: "snippet",
//     type: "video",
//     q: "full movie",
//     maxResults: String(maxResults),
//     videoDuration: "long",
//     publishedBefore,
//     videoEmbeddable: "true",
//     key,
//   });

//   const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
//   const res = await fetch(url, { next: { revalidate: 3600 } });
//   if (!res.ok) {
//     console.error("YouTube search failed:", res.status, await res.text());
//     return [];
//   }
//   const data = await res.json();
//   return (data.items || [])
//     .map((it: any) => {
//       const vid = it.id?.videoId;
//       if (!vid) return null;
//       return {
//         id: vid,
//         title: it.snippet.title,
//         thumbnail: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url,
//         channelTitle: it.snippet.channelTitle,
//         publishedAt: it.snippet.publishedAt,
//       };
//     })
//     .filter(Boolean);
// }

// export default async function DashboardPage() {
//   const cookieStore = await cookies();
//   const sessionId = cookieStore.get("session")?.value;
//   if (!sessionId) return redirect("/login");

//   let user;
//   try {
//     user = await prisma.user.findUnique({
//       where: { id: sessionId },
//       select: { id: true, username: true, email: true, plan: true },
//     });
//   } catch (err) {
//     console.error("DB error on dashboard:", err);
//     return (
//       <div className="p-6">
//         <h1 className="text-xl font-bold">Database connection error</h1>
//         <p className="text-sm text-red-600">Cannot connect to the database. Check DATABASE_URL and that the DB server is running.</p>
//       </div>
//     );
//   }

//   if (!user) return redirect("/login");

//   const plan = user.plan ?? "FREE";
//   const youTubeMovies = plan === "FREE" ? await fetchYouTubeMovies(12) : [];

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Welcome, {user.username}</h1>
//       <p>Your plan: <b>{plan}</b></p>

//       <section>
//         <h2 className="text-lg font-medium mb-3">Artists</h2>
//         <ArtistsList currentUserId={user.id} />
//       </section>

//       <section>
//         <h2 className="text-lg font-medium mb-3">Recommended from artists you follow</h2>
//         <Recommendations userId={user.id} />
//       </section>

//       {plan === "FREE" && (
//         <section>
//           <h2 className="text-lg font-medium mb-3">Featured YouTube Movies (≥ 6 months old)</h2>
//           {youTubeMovies.length === 0 ? (
//             <p className="text-sm text-gray-500">No videos available or YOUTUBE_API_KEY missing.</p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {youTubeMovies.map((v: any) => (
//                 <div key={v.id} className="bg-white rounded shadow p-3">
//                   <Link href={`/watch/${v.id}`}>
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img src={v.thumbnail} alt={v.title} className="w-full h-40 object-cover rounded" />
//                   </Link>
//                   <div className="mt-2">
//                     <Link href={`/watch/${v.id}`} className="font-semibold line-clamp-2">{v.title}</Link>
//                     <div className="text-xs text-gray-500">{v.channelTitle} • {new Date(v.publishedAt).toLocaleDateString()}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )}

//       <Link href="/" className="text-blue-600 underline">Back to Home</Link>
//     </div>
//   );
// }















// ...existing code...
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ArtistsList from "../artists/ArtistsList";
import Recommendations from "./Recommendations";
import { prisma } from "@/lib/prisma";

async function fetchYouTubeMovies(maxResults = 12) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const publishedBefore = cutoff.toISOString();

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: "full movie",
    maxResults: String(maxResults),
    videoDuration: "long",
    publishedBefore,
    videoEmbeddable: "true",
    key,
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("YouTube search failed:", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return (data.items || [])
    .map((it: any) => {
      const vid = it.id?.videoId;
      if (!vid) return null;
      return {
        id: vid,
        title: it.snippet.title,
        thumbnail: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url,
        channelTitle: it.snippet.channelTitle,
        publishedAt: it.snippet.publishedAt,
      };
    })
    .filter(Boolean);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return redirect("/login");

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, username: true, email: true, plan: true },
    });
  } catch (err) {
    console.error("DB error on dashboard:", err);
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Database connection error</h1>
        <p className="text-sm text-red-600">Cannot connect to the database. Check DATABASE_URL and that the DB server is running.</p>
      </div>
    );
  }

  if (!user) return redirect("/login");

  // --- NEW: load user's followed artists server-side so we can list them on the dashboard ---
  const userWithFollows = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      followedArtists: {
        select: { id: true, name: true, youtubeChannel: true},
        orderBy: { name: "asc" },
      },
    },
  });

  const plan = user.plan ?? "FREE";
  const youTubeMovies = plan === "FREE" ? await fetchYouTubeMovies(12) : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {user.username}</h1>
      <p>Your plan: <b>{plan}</b></p>

      <section>
        <h2 className="text-lg font-medium mb-3">Artists you follow</h2>

        {userWithFollows?.followedArtists && userWithFollows.followedArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userWithFollows.followedArtists.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-white p-3 rounded shadow">
                {a.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.thumbnail} alt={a.name} width={64} height={64} className="rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-sm">{a.name?.charAt(0)}</div>
                )}
                <div>
                  <div className="font-medium">{a.name}</div>
                  {a.youtubeChannel && <div className="text-xs text-gray-500">Channel: {a.youtubeChannel}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You are not following any artists yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Artists (discover & follow)</h2>
        {/* keep the client ArtistsList so user can search and follow/unfollow */}
        <ArtistsList currentUserId={user.id} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Recommended from artists you follow</h2>
        <Recommendations userId={user.id} />
      </section>

      {plan === "FREE" && (
        <section>
          <h2 className="text-lg font-medium mb-3">Featured YouTube Movies (≥ 6 months old)</h2>
          {youTubeMovies.length === 0 ? (
            <p className="text-sm text-gray-500">No videos available or YOUTUBE_API_KEY missing.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {youTubeMovies.map((v: any) => (
                <div key={v.id} className="bg-white rounded shadow p-3">
                  <Link href={`/watch/${v.id}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumbnail} alt={v.title} className="w-full h-40 object-cover rounded" />
                  </Link>
                  <div className="mt-2">
                    <Link href={`/watch/${v.id}`} className="font-semibold line-clamp-2">{v.title}</Link>
                    <div className="text-xs text-gray-500">{v.channelTitle} • {new Date(v.publishedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <Link href="/" className="text-blue-600 underline">Back to Home</Link>
    </div>
  );
}