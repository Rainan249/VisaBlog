/**
 * Markdown → 纯文本的共享工具。
 * Blog 搜索摘要、Post 阅读时长、About 写作统计、vite.config 的 RSS 摘要都走这里，
 * 避免四份正则各写一遍、改一处漏三处。
 */

const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const LINK_RE = /!?\[[^\]]*\]\([^)]*\)/g;
const MARK_RE = /[#>*`|~]+/g;
const CJK_RE = /[\u4e00-\u9fa5]/g;

/** 去掉 Markdown 语法，压成单行纯文本 */
export function stripMarkdown(content: string): string {
  return content
    .replace(CODE_BLOCK_RE, " ")
    .replace(LINK_RE, " ")
    .replace(MARK_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 统计字数：中日韩字符按字算，其余按单词算 */
export function countChars(content: string): number {
  const text = content.replace(CODE_BLOCK_RE, " ").replace(LINK_RE, " ");
  const cjk = (text.match(CJK_RE) || []).length;
  const words = (text.replace(CJK_RE, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + words;
}

/** 按字数估算阅读分钟数（中文约 400 字/分钟） */
export function readingMinutes(content: string): number {
  return Math.max(1, Math.round(countChars(content) / 400));
}
