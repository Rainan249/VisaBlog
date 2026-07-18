import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
}

// 在构建时导入所有 .md 文件内容（含子目录，排除 obsidian 配置）
const modules = import.meta.glob("/posts/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function getAllPostsRaw(): Post[] {
  const posts: Post[] = [];

  for (const filepath of Object.keys(modules)) {
    // 跳过 .obsidian 目录
    if (filepath.includes("/.obsidian/")) continue;

    // slug = 相对于 posts/ 的路径，去掉 .md 后缀，用 / 保留层级
    let slug = filepath.replace(/^\/posts\//, "").replace(/\.md$/, "");
    // Obsidian 文件名可能有编号前缀如 "001-030.xxx"，保留原样
    const raw = modules[filepath] as string;
    const { data, content } = matter(raw);

    posts.push({
      slug,
      title: data.title || slug.split("/").pop() || slug,
      date: data.date
        ? data.date instanceof Date
          ? data.date.toISOString().split("T")[0]
          : String(data.date)
        : new Date().toISOString().split("T")[0],
      tags: data.tags || [],
      content,
    });
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

let allPosts: Post[] | null = null;

function ensurePosts(): Post[] {
  if (!allPosts) {
    allPosts = getAllPostsRaw();
  }
  return allPosts;
}

export function getAllPosts(): PostMeta[] {
  return ensurePosts().map(({ content: _, ...meta }) => meta);
}

export function getPostBySlug(slug: string): Post | null {
  return ensurePosts().find((p) => p.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return ensurePosts().map((p) => p.slug);
}
