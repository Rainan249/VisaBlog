declare module "virtual:post-meta" {
  import type { PostMeta } from "./lib/posts";
  const posts: PostMeta[];
  export default posts;
}

declare module "@waline/client/style";

declare module "virtual:gallery-data" {
  interface GallerySubcategory {
    name: string;
    images: string[];
  }
  interface GalleryCategory {
    name: string;
    subcategories: GallerySubcategory[];
  }
  const data: GalleryCategory[];
  export default data;
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_WALINE_SERVER?: string;
  /** Go 后端地址；本地开发走 Vite 代理时留空 */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
