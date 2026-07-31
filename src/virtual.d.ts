declare module "virtual:md-create-times" {
  const times: Record<string, string>;
  export default times;
}

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
