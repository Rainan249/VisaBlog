import matter from "gray-matter";
import createTimes from "virtual:md-create-times";
import { buildPostSlug } from "./slug";

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
  const usedSlugs = new Map<string, number>();

  for (const filepath of Object.keys(modules)) {
    // 跳过 .obsidian 目录
    if (filepath.includes("/.obsidian/")) continue;

    // 原始相对路径（用于查找文件创建时间）
    const rel = filepath.replace(/^\/posts\//, "").replace(/\.md$/, "");
    // 友好 URL：第二层目录 / 去编号文章名
    let slug = buildPostSlug(rel);

    // 处理重名：追加 -2、-3…
    const seen = usedSlugs.get(slug);
    if (seen) {
      usedSlugs.set(slug, seen + 1);
      slug = `${slug}-${seen + 1}`;
    } else {
      usedSlugs.set(slug, 1);
    }

    const raw = modules[filepath] as string;
    const { data, content } = matter(raw);

    posts.push({
      slug,
      title: data.title || slug.split("/").pop() || slug,
      date: data.date
        ? data.date instanceof Date
          ? data.date.toISOString().split("T")[0]
          : String(data.date)
        : createTimes[rel] || new Date().toISOString().split("T")[0],
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

export function getAllPostsWithContent(): Post[] {
  return ensurePosts();
}

export function getPostBySlug(slug: string): Post | null {
  return ensurePosts().find((p) => p.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return ensurePosts().map((p) => p.slug);
}

export interface MonthGroup {
  key: string;
  label: string;
  posts: PostMeta[];
}

export interface YearGroup {
  year: number;
  posts: PostMeta[];
  months: MonthGroup[];
}

const MONTH_ZH = [
  "", "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];
const MONTH_EN = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function groupByYearMonth(posts: PostMeta[]): YearGroup[] {
  const yearMap = new Map<number, Map<string, PostMeta[]>>();

  for (const post of posts) {
    const [y, m] = post.date.split("-");
    const year = Number(y);

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(m)) monthMap.set(m, []);
    monthMap.get(m)!.push(post);
  }

  return Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthMap]) => ({
      year,
      posts: Array.from(monthMap.values()).flat(),
      months: Array.from(monthMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, monthPosts]) => ({
          key,
          label: `${MONTH_ZH[Number(key)]} · ${MONTH_EN[Number(key)]}`,
          posts: monthPosts,
        })),
    }));
}
