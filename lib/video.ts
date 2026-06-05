export function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[\w=&%-]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export function isDirectVideoUrl(url: string): boolean {
  return (
    /\.(mp4|mov|webm|ogv|m4v)(\?|$)/i.test(url) ||
    url.includes('blob.vercel-storage.com')
  );
}
