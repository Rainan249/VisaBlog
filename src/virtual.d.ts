declare module "virtual:md-create-times" {
  const times: Record<string, string>;
  export default times;
}

declare module "@waline/client/style";

declare module "virtual:qq-music" {
  interface SongItem {
    songName: string;
    singerName: string;
    songMid: string;
    sum?: number;
  }
  interface MonthTop {
    month?: string;
    topSong?: SongItem[];
    topSinger?: { singerName: string; singerMid: string; sum?: number }[];
    favSongMid?: string;
    favSongName?: string;
    favSingerName?: string;
    repeatSong?: { songName?: string; songMid?: string; singerName?: string; count?: number; listenDate?: string };
    midnightSong?: { songName?: string; songMid?: string; singerName?: string; hour?: number; month?: number };
  }
  const data: {
    monthData?: {
      topSong?: SongItem[];
      topSinger?: { singerName: string; singerMid: string; sum?: number }[];
      topDataList?: MonthTop[];
      topGenre?: { genre2Count?: { name: string; sum: number }[]; genreSong?: SongItem[] };
      preferHour?: { preferHour?: number; songListen?: SongItem[] };
      consDays?: {
        conDays?: number;
        topListen?: number;
        singerDay?: { singerName?: string };
        songListen?: SongItem[];
      };
      nicheSongs?: { nichePercent?: number; hotPercent?: number; list?: SongItem[] };
      newSongs?: { newSongCount?: number; floatNumber?: number; lastNewSongCount?: number };
      listenCityInfo?: { cityName?: string }[];
      monthDetailList?: { dataTime?: string; listenCount?: number }[];
    };
  } | null;
  export default data;
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

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_WALINE_SERVER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
