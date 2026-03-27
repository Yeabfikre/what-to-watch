import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Play, Star, Tv, ChevronDown, Check, Link } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchDetails,
  fetchSeason,
  tmdbImg,
  getTitle,
  getYear,
  formatRuntime,
  getProviders,
  getTrailerUrl,
  type TmdbDetails,
} from "@/lib/tmdb";

const PROVIDERS = [
  {
    name: "MegaCloud",
    sandbox: true,
    movie: (id: string) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "MultiStream",
    sandbox: false,
    movie: (id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: string, s?: number, e?: number) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1${s ? `&s=${s}` : ""}${e ? `&e=${e}` : ""}`,
  },
  {
    name: "VidLink",
    sandbox: false,
    movie: (id: string) => `https://vidlink.pro/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidlink.pro/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    name: "VidsrcPro",
    sandbox: false,
    movie: (id: string) => `https://vidsrc.pro/embed/movie/${id}`,
    tv: (id: string, s?: number, e?: number) =>
      `https://vidsrc.pro/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
];

const CopyLinkButton = ({ tmdbId, type, title }: { tmdbId: string; type: string; title: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const shareUrl = `${window.location.origin}/watch?id=${encodeURIComponent(tmdbId)}&type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
        copied
          ? "border-green-500 bg-green-500/20 text-green-400"
          : "border-border bg-secondary text-foreground hover:bg-muted"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied!" : "Copy Link"}</span>
    </button>
  );
};

const Watch = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  
  // Sanitize URL params to prevent XSS
  const rawTitle = params.get("title") || "";
  const title = rawTitle.replace(/[<>"'&]/g, ""); // Strip HTML-sensitive chars
  const rawType = params.get("type") || "movie";
  const type = rawType === "tv" ? "tv" : "movie"; // Whitelist valid types
  const rawId = params.get("id") || "";
  const tmdbId = /^\d+$/.test(rawId) ? rawId : ""; // Only allow numeric IDs
  const [loading, setLoading] = useState(true);
  const [providerIdx, setProviderIdx] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState<boolean | null>(null);

  // Detect Adblocker
  useEffect(() => {
    const detectAdBlock = () => {
      try {
        const testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox";
        document.body.appendChild(testAd);
        window.setTimeout(() => {
          if (testAd.offsetHeight === 0) {
            setIsAdBlockEnabled(true);
          } else {
            setIsAdBlockEnabled(false);
          }
          testAd.remove();
        }, 100);
      } catch {
        setIsAdBlockEnabled(true);
      }
    };
    detectAdBlock();
  }, []);

  // Fetch details
  const { data: details } = useQuery({
    queryKey: ["tmdb", "details", tmdbId, type],
    queryFn: () => fetchDetails(Number(tmdbId), type as "movie" | "tv"),
    enabled: !!tmdbId,
  });

  const isTV = type === "tv";

  // Fetch season data
  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "season", tmdbId, selectedSeason],
    queryFn: () => fetchSeason(Number(tmdbId), selectedSeason),
    enabled: !!tmdbId && isTV,
  });

  const provider = PROVIDERS[providerIdx];
  const embedUrl = tmdbId
    ? isTV
      ? provider.tv(tmdbId, selectedSeason, selectedEpisode)
      : provider.movie(tmdbId)
    : "";

  const handleSwitchServer = (idx: number) => {
    if (idx === providerIdx) return;
    setLoading(true);
    setProviderIdx(idx);
  };

  const handleEpisodeClick = (epNum: number) => {
    setSelectedEpisode(epNum);
    setLoading(true);
  };

  const seasons = details?.seasons?.filter((s) => s.season_number > 0) || [];
  const posterUrl = details ? tmdbImg.poster(details.poster_path) : null;
  const year = details ? getYear(details) : 0;
  const runtime = details ? formatRuntime(details.runtime) : null;
  const providers = details ? getProviders(details) : [];
  const cast = details?.credits?.cast?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card px-4 py-3"
      >
        <button
          onClick={() => navigate("/")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground capitalize">{type}</p>
        </div>
      </motion.div>

      {/* Movie/Show details */}
      {details && (
        <div className="border-b border-border bg-card px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl flex flex-col sm:flex-row gap-5">
            {/* Poster */}
            {posterUrl && (
              <div className="shrink-0">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-28 rounded-lg shadow-lg sm:w-36"
                  loading="lazy"
                />
                {/* Rating */}
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-bold text-foreground">{(details.vote_average || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {getTitle(details)}
                {isTV && seasonData ? ` - Season ${selectedSeason}` : ""}
              </h2>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {getTrailerUrl(details) && (
                  <button onClick={() => setShowTrailer(true)}>
                    <Badge variant="default" className="gap-1 cursor-pointer">
                      <Play className="h-3 w-3 fill-current" /> Trailer
                    </Badge>
                  </button>
                )}
                <Badge variant="secondary">HD</Badge>
                {details.external_ids?.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${details.external_ids.imdb_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant="outline" className="cursor-pointer">IMDB: {(details.vote_average || 0).toFixed(1)}</Badge>
                  </a>
                )}
              </div>

              {/* Metadata grid */}
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {year > 0 && (
                  <div>
                    <span className="text-muted-foreground">Released: </span>
                    <span className="text-foreground">{details.release_date || details.first_air_date}</span>
                  </div>
                )}
                {details.genres?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Genre: </span>
                    <span className="text-foreground">{(details.genres || []).map((g) => g.name).join(", ")}</span>
                  </div>
                )}
                {cast.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Casts: </span>
                    <span className="text-foreground">{cast.map((c) => c.name).join(", ")}</span>
                  </div>
                )}
                {runtime && (
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="text-foreground">{runtime}</span>
                  </div>
                )}
                {providers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Production: </span>
                    <span className="text-foreground">{providers.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Overview */}
              {details.overview && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {details.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video player */}
      <div className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* Ad Mitigation Banners */}
          {!PROVIDERS[providerIdx].sandbox && (
            <div className="mb-4 space-y-3">
              {isAdBlockEnabled === false && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-600 bg-amber-100 p-4 text-amber-900 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200">
                  <div className="mt-0.5 shrink-0">
                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-100">Ad-Blocker Recommended</h4>
                    <p className="mt-1 text-sm leading-relaxed text-amber-700 dark:text-amber-200/90">
                      This backup server contains aggressive pop-up ads. For the best experience, we highly recommend installing the free <a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-900 hover:text-amber-600 dark:text-amber-100 dark:hover:text-amber-50">uBlock Origin</a> browser extension.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start sm:items-center gap-3 rounded-lg bg-secondary px-4 py-3 text-sm text-foreground">
                <svg className="h-5 w-5 shrink-0 text-primary mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  <strong>Tip:</strong> The first click on this video player may open a pop-up ad. Close the new tab immediately, then click Play again to start your movie.
                </p>
              </div>
            </div>
          )}

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {embedUrl ? (
              <iframe
                key={`${providerIdx}-${selectedSeason}-${selectedEpisode}`}
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                {...(PROVIDERS[providerIdx].sandbox ? { sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation" } : {})}
                referrerPolicy="origin"
                onLoad={() => setLoading(false)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No video ID provided
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Server selector */}
      <div className="border-b border-border bg-card px-4 py-4">
        <p className="mb-3 text-center text-xs text-muted-foreground">
          If current server doesn't work please try other servers below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PROVIDERS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => handleSwitchServer(idx)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                idx === providerIdx
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <div className="text-left">
                <span className="block text-[10px] leading-tight text-muted-foreground">Server</span>
                <span className="block text-sm font-bold leading-tight">{p.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Share bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Share</span>
          {(() => {
            const shareUrl = `${window.location.origin}/watch?id=${encodeURIComponent(tmdbId)}&type=${encodeURIComponent(type)}&title=${encodeURIComponent(title)}`;
            const encodedUrl = encodeURIComponent(shareUrl);
            return [
              { name: "Facebook", bg: "bg-[hsl(221,44%,41%)]", icon: (<svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>), url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
              { name: "X", bg: "bg-[hsl(0,0%,15%)]", icon: (<svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>), url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}` },
              { name: "WhatsApp", bg: "bg-[hsl(142,70%,40%)]", icon: (<svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>), url: `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}` },
              { name: "Telegram", bg: "bg-[hsl(200,70%,50%)]", icon: (<svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>), url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}` },
              { name: "Reddit", bg: "bg-[hsl(16,100%,50%)]", icon: (<svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg>), url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}` },
            ].map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.bg} flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.name}</span>
              </a>
            ));
          })()}
          <CopyLinkButton tmdbId={tmdbId} type={type} title={title} />
        </div>
      </div>

      {/* Season & Episode selector for TV */}
      {isTV && (
        <div className="border-b border-border bg-card px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Season dropdown */}
            {seasons.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <Tv className="h-4 w-4 text-muted-foreground" />
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                      setLoading(true);
                    }}
                    className="appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-sm font-medium text-foreground outline-none transition focus:border-primary"
                  >
                    {seasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        Season {s.season_number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Episode grid */}
            {seasonData?.episodes && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {seasonData.episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => handleEpisodeClick(ep.episode_number)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm transition ${
                      ep.episode_number === selectedEpisode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-foreground hover:bg-muted"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold">Eps {ep.episode_number}:</span>{" "}
                      <span className="text-muted-foreground">{ep.name || `Episode ${ep.episode_number}`}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Trailer modal */}
      {details && getTrailerUrl(details) && (
        <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-black">
            <DialogTitle className="sr-only">Trailer</DialogTitle>
            <div className="aspect-video w-full">
              <iframe
                src={`${getTrailerUrl(details)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default Watch;
