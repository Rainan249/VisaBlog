export interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

/** 收集有子项的标题 id（用于“全部收起”的初始状态） */
export function collectParentIds(items: TocItem[]): string[] {
  return items.flatMap((item) =>
    item.children.length ? [item.id, ...collectParentIds(item.children)] : []
  );
}

/** 在整棵目录树里找某个标题的父级 id */
export function findParentId(items: TocItem[], id: string): string | null {
  for (const item of items) {
    if (item.children.some((c) => c.id === id)) return item.id;
    const deeper = findParentId(item.children, id);
    if (deeper) return deeper;
  }
  return null;
}

/** 扁平化目录树（只到二级），用于“第 n / 共 m 节”的进度 */
export function flattenToc(items: TocItem[]): string[] {
  return items.flatMap((item) => [
    item.id,
    ...item.children.flatMap((c) => (c.level <= 2 ? flattenToc([c]) : [c.id])),
  ]);
}
