export interface StreamProvider {
  name: string;
  sandbox: boolean;
  movie: (id: string) => string;
  tv: (id: string, s?: number, e?: number) => string;
}

export const PROVIDERS: readonly StreamProvider[] = [
  {
    name: "MegaCloud",
    sandbox: false,
    movie: (id: string) => `https://vidsrc.su/embed/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidsrc.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "VidSrc",
    sandbox: false,
    movie: (id: string) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidsrc.to/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "VidsrcPro",
    sandbox: false,
    movie: (id: string) => `https://vidsrc.sh/embed/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidsrc.sh/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "2Embed",
    sandbox: false,
    movie: (id: string) => `https://www.2embed.cc/embed/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://www.2embed.cc/embedtv/${id}&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    name: "SmashyStream",
    sandbox: false,
    movie: (id: string) => `https://player.smashystream.com/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://player.smashystream.com/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "MultiStream",
    sandbox: false,
    movie: (id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: string, s?: number, e?: number) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
];
