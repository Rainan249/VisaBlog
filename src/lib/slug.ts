export function slugifySegment(name: string): string {
  return name
    .replace(/^\s*\d+(?:\s*-\s*\d+)?[.、:]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 友好 URL：`分类/文章名`
 *
 * - 分类 = frontmatter 里的 `tags[0]`，例如 `tags: [读书笔记]` → `读书笔记`
 * - 没写 tags 的文章不加分类前缀，直接是 `文章名`
 * - 文章名 = 文件名去掉 `001-030.` / `1.` 这类编号前缀
 */
export function buildPostSlug(relativePath: string, tags: string[] = []): string {
  const filename =
    relativePath
      .replace(/\.md$/i, "")
      .split("/")
      .filter(Boolean)
      .pop() ?? "";
  const name = slugifySegment(filename);

  const category = tags.length > 0 ? slugifySegment(String(tags[0])) : "";

  return category ? `${category}/${name}` : name;
}
