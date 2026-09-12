async function fetchCover(songMid: string): Promise<string | null> {
  try {
    const payload = encodeURIComponent(
      JSON.stringify({
        comm: { ct: 24 },
        req: {
          module: "music.pf_song_detail_svr",
          method: "get_song_detail_yqq",
          param: { song_mid: songMid },
        },
      })
    );
    const res = await fetch(
      `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${payload}`
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    const albumMid = json?.req?.data?.track_info?.album?.mid;
    return albumMid
      ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg`
      : null;
  } catch {
    return null;
  }
}

async function enrichCovers(data: any): Promise<void> {
  const m = data?.monthData;
  if (!m) return;

  const targets: { mid: string; apply: (url: string) => void }[] = [];
  for (const s of m.topSong ?? []) {
    if (s?.songMid) targets.push({ mid: s.songMid, apply: (u) => (s.cover = u) });
  }
  for (const t of m.topDataList ?? []) {
    if (t?.repeatSong?.songMid)
      targets.push({ mid: t.repeatSong.songMid, apply: (u) => (t.repeatSong.cover = u) });
    if (t?.midnightSong?.songMid)
      targets.push({ mid: t.midnightSong.songMid, apply: (u) => (t.midnightSong.cover = u) });
    if (t?.favSongMid) targets.push({ mid: t.favSongMid, apply: (u) => (t.favSongCover = u) });
  }

  const cache = new Map<string, string | null>();
  for (const t of targets) {
    let url = cache.get(t.mid);
    if (url === undefined) {
      url = await fetchCover(t.mid);
      cache.set(t.mid, url);
    }
    if (url) t.apply(url);
  }
}

export async function loadQqMusicReport(apiKey: string): Promise<unknown | null> {
  if (!apiKey) return null;
  try {
    const res = await fetch("https://a.y.qq.com/me/report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        params: { timeKey: "m" },
        comm: { skill_version: "0.0.3" },
      }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    await enrichCovers(data);
    return data;
  } catch {
    return null;
  }
}
