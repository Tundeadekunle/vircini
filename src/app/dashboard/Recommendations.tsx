// server component
import Link from "next/link";

export default async function Recommendations({ userId }: { userId: string }) {
  if (!userId) return <div>No user specified.</div>;

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  const url = new URL(`/api/recommendations?userId=${encodeURIComponent(userId)}`, base).toString();
  const res = await fetch(url, { cache: "no-store" });
  const recs = res.ok ? await res.json() : [];

  if (!recs || recs.length === 0) return <div>No recommendations yet — follow artists to get recommendations.</div>;

  return (
    <div>
      <h3>Recommended for you</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recs.map((r: any) => (
          <div key={(r.source === "db" ? `db-${r.id}` : `yt-${r.id}`) || r.title} className="p-3 bg-white rounded shadow">
            <Link href={r.source === "youtube" ? `/watch/${r.id}` : `/movie/${r.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.thumbnail} alt={r.title} className="w-full h-40 object-cover rounded" />
            </Link>
            <div className="mt-2">
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-gray-500">{r.artistName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}