// marked-katex-extension 的 `types` 指向包内 src/index.ts，直接进 vue-tsc 会报
// 它自己源码里的 noUnusedParameters。这里用本地声明顶掉，只保留我们用到的选项。
import type { MarkedExtension } from "marked";

export interface MarkedKatexOptions {
  throwOnError?: boolean;
  nonStandard?: boolean;
  output?: "html" | "mathml";
}

export default function markedKatex(options?: MarkedKatexOptions): MarkedExtension;
