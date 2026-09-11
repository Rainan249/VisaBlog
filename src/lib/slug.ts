export function slugifySegment(name: string): string {
  return name
    .replace(/^\s*\d+(?:\s*-\s*\d+)?[.、:]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPostSlug(relativePath: string): string {
  const parts = relativePath
    .replace(/\.md$/i, "")
    .split("/")
    .filter(Boolean);

  const filename = parts.pop() ?? "";
  const name = slugifySegment(filename);

  const category =
    parts.length > 0
      ? slugifySegment(parts.length >= 2 ? parts[1] : parts[0])
      : "";

  return category ? `${category}/${name}` : name;
}
