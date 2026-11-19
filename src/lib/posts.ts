import postMeta from "virtual:post-meta";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  /** 源文件的根相对路径，用于按需加载正文 */
  file: string;
}

export interface Post extends PostMeta {
  content: string;
}

/** 元数据在构建期由 vite 插件解析好（见 vite.config.ts 的 virtual-post-meta） */
const allPosts = postMeta as PostMeta[];

export function getAllPosts(): PostMeta[] {
  return allPosts;
}

export function getPostBySlug(slug: string): PostMeta | null {
  return allPosts.find((p) => p.slug === slug) ?? null;
}

/**
 * 正文按需加载：`import.meta.glob` 不 eager，每篇 Markdown 各自成 chunk。
 * 首页 / 归档页只需要元数据，不用再把全部正文拖下来。
 */
const contentLoaders = import.meta.glob("/posts/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/;

export async function loadPostContent(post: PostMeta): Promise<string> {
  const loader = contentLoaders[post.file];
  if (!loader) return "";
  return (await loader()).replace(FRONTMATTER_RE, "");
}

export async function getAllPostsWithContent(): Promise<Post[]> {
  return Promise.all(
    allPosts.map(async (meta) => ({ ...meta, content: await loadPostContent(meta) }))
  );
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
