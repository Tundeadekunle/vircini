import { cookies } from "next/headers";
import Link from "next/link";

interface Params {
  params: { id: string };
}

export default async function WatchPage({ params }: Params) {
  const { id } = params;
  // You may verify user/session here if needed (server-side).
  // We embed YouTube iframe — playback is handled by YouTube (respecting uploader's license).
  const embedUrl = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 underline mb-4 inline-block">← Back to dashboard</Link>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title="YouTube Movie"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Video served by YouTube. Playback availability depends on the uploader and regional restrictions.</p>
      </div>
    </main>
  );
}