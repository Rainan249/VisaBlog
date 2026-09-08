import type { MarkedExtension } from "marked";

export interface MarkedKatexOptions {
  throwOnError?: boolean;
  nonStandard?: boolean;
  output?: "html" | "mathml";
}

export default function markedKatex(options?: MarkedKatexOptions): MarkedExtension;
