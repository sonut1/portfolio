export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now()}`;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function extractInstagramInfo(
  url: string
): { kind: "reel" | "p" | "tv"; code: string } | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "instagram.com" && host !== "instagr.am") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const kind = parts[0];
    const code = parts[1];
    if ((kind === "reel" || kind === "reels" || kind === "p" || kind === "tv") && code) {
      return {
        kind: kind === "reels" ? "reel" : kind,
        code,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getInstagramEmbedUrl(url: string): string | null {
  const info = extractInstagramInfo(url);
  return info ? `https://www.instagram.com/${info.kind}/${info.code}/embed/` : null;
}

export function isValidExternalVideoUrl(url: string, sourceType: "YOUTUBE" | "INSTAGRAM"): boolean {
  if (sourceType === "YOUTUBE") return Boolean(extractYouTubeId(url));
  if (sourceType === "INSTAGRAM") return Boolean(extractInstagramInfo(url));
  return false;
}

export function formatEditorialDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
