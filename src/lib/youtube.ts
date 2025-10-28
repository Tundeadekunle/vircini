export async function fetchYouTubeArtists(q = "movie actor", maxResults = 20) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    part: "snippet",
    type: "channel",
    q,
    maxResults: String(maxResults),
    key,
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("YouTube channels fetch failed", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return (data.items || []).map((it: any) => ({
    channelId: it.snippet?.channelId || it.id?.channelId || (it.id?.kind === "youtube#channel" ? it.id?.channelId : null),
    name: it.snippet?.channelTitle,
    description: it.snippet?.description,
    thumbnail: it.snippet?.thumbnails?.default?.url,
  })).filter(Boolean);
}