/// <reference types="node" />
import { loadQqMusicReport } from "./_qqmusic";

export default async function handler(req: any, res: any) {
  const data = await loadQqMusicReport(process.env.QQMUSIC_API_KEY || "");

  if (!data) {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=3600"
  );
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
