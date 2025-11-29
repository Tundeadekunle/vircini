import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WatchPartyPlayer from "./WatchPartyPlayer";

interface Params {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function WatchPage({ params, searchParams }: Params) {
  const { id: videoId } = await params;
  const { sessionId: querySessionId } = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("session")?.value;

  if (!userId) return redirect("/login");

  let session;
  let isHost = false;

  if (querySessionId) {
    session = await prisma.watchSession.findUnique({
      where: { id: querySessionId },
    });
    // If session exists and matches video (optional check, but good for consistency)
    if (session && session.videoId === videoId) {
      isHost = session.hostUserId === userId;
    } else {
      // Invalid session, fallback to creating new? or error?
      // Let's create new for now to avoid broken page
      session = null;
    }
  }

  if (!session) {
    session = await prisma.watchSession.create({
      data: {
        videoId,
        platform: "youtube",
        hostUserId: userId,
        scheduledTime: new Date(),
      }
    });
    isHost = true;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 underline mb-4 inline-block">← Back to dashboard</Link>

        <WatchPartyPlayer
          videoId={videoId}
          sessionId={session.id}
          currentUserId={userId}
          isHost={isHost}
        />

        <p className="text-xs text-gray-500 mt-2">Video served by YouTube. Playback availability depends on the uploader and regional restrictions.</p>
      </div>
    </main>
  );
}