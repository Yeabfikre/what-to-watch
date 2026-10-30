import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Play,
  Star,
  Tv,
  ChevronDown,
  Check,
  Link as LinkIcon,
  Share2,
  Film,
  Info,
  ShieldCheck,
  Server,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  getMediaType,
  type TmdbMovie,
} from "@/lib/tmdb";
import { PROVIDERS } from "@/config/providers";

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
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
        copied
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
          : "border-border/70 bg-secondary/80 text-foreground hover:bg-secondary active:scale-95"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied!" : "Copy Link"}</span>
    </button>
  );
};

const Watch = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Sanitize URL params
  const rawTitle = params.get("title") || "";
  const title = rawTitle.replace(/[<>"'&]/g, "");
  const rawType = params.get("type") || "movie";
  const type = rawType === "tv" ? "tv" : "movie";
  const rawId = params.get("id") || "";
  const tmdbId = /^\d+$/.test(rawId) ? rawId : "";

  const initialSeason = Math.max(1, Number(params.get("season")) || 1);
  const initialEpisode = Math.max(1, Number(params.get("episode")) || 1);

  const [loading, setLoading] = useState(true);
  const [providerIdx, setProviderIdx] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);

  // Sync state if URL searchParams change
  useEffect(() => {
    const s = Number(params.get("season"));
    const e = Number(params.get("episode"));
    if (s && s !== selectedSeason) setSelectedSeason(s);
    if (e && e !== selectedEpisode) setSelectedEpisode(e);
  }, [params, selectedSeason, selectedEpisode]);

  // Fetch title details
  const { data: details } = useQuery({
    queryKey: ["tmdb", "details", tmdbId, type],
    queryFn: () => fetchDetails(Number(tmdbId), type as "movie" | "tv"),
    enabled: !!tmdbId,
  });

  const isTV = type === "tv";

  // Fetch season data for TV shows
  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "season", tmdbId, selectedSeason],
    queryFn: () => fetchSeason(Number(tmdbId), selectedSeason),
    enabled: !!tmdbId && isTV,
  });

  const provider = PROVIDERS[providerIdx] || PROVIDERS[0];
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
  const displayTitle = details ? getTitle(details) : title || "Movie";

  const shareUrl = `${window.location.origin}/watch?id=${encodeURIComponent(tmdbId)}&type=${encodeURIComponent(type)}&title=${encodeURIComponent(displayTitle)}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(displayTitle);

  const socialLinks = [
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(displayTitle + " " + shareUrl)}`,
      icon: (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: "Reddit",
      url: `https://reddit.com/submit?url=${encodedShareUrl}&title=${encodedTitle}`,
      icon: (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      icon: (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Official What To Watch Navbar */}
      <Navbar
        onMovieClick={(m: TmdbMovie) => {
          const mType = getMediaType(m);
          navigate(`/watch?id=${m.id}&type=${mType}&title=${encodeURIComponent(getTitle(m))}`);
        }}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6 flex flex-col gap-6">
        {/* ======================================================== */}
        {/* 1. CINEMA VIDEO PLAYER CENTERPIECE                       */}
        {/* ======================================================== */}
        <section className="flex flex-col gap-3">
          {/* Active Title & Stream Indicator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate tracking-tight text-foreground">
                {displayTitle}
              </h1>
              {isTV && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 border border-primary/20">
                  S{selectedSeason} · E{selectedEpisode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Server:</span>
              <span className="font-semibold text-foreground px-2.5 py-0.5 rounded-md bg-secondary border border-border/80">
                {provider.name}
              </span>
            </div>
          </div>

          {/* 16:9 Cinema Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-border/80 shadow-2xl">
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-3 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-medium text-white/80">Connecting to {provider.name}...</span>
              </div>
            )}
            {embedUrl ? (
              <iframe
                key={`${providerIdx}-${selectedSeason}-${selectedEpisode}`}
                src={embedUrl}
                title={`${displayTitle} Streaming Player`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                {...(PROVIDERS[providerIdx]?.sandbox
                  ? { sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation" }
                  : {})}
                referrerPolicy="origin"
                onLoad={() => setLoading(false)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center">
                <Film className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm">No streaming provider available for this title ID.</p>
              </div>
            )}
          </div>

          {/* Integrated Server Switcher & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-sm">
            {/* Servers Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1.5 shrink-0">
                <Server className="h-3.5 w-3.5 text-primary" />
                <span>Servers:</span>
              </div>
              {PROVIDERS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleSwitchServer(idx)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
                    idx === providerIdx
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border/70 bg-secondary/70 text-foreground hover:bg-secondary"
                  }`}
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions: Copy Link & Title Details */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <CopyLinkButton tmdbId={tmdbId} type={type} title={displayTitle} />
              {tmdbId && (
                <button
                  onClick={() => navigate(`/title/${type}/${tmdbId}`)}
                  className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
                  title="View full title page with cast, trailer, and details"
                >
                  <Film className="h-3.5 w-3.5 text-primary" />
                  <span>Title Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Sleek Ad & Streaming Hint Banner */}
          {!PROVIDERS[providerIdx]?.sandbox && (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-card/60 border border-border/50 text-xs text-muted-foreground backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  <strong>Tip:</strong> If an ad window opens on the first click, close it and click play again.
                </span>
              </div>
              <a
                href="https://ublockorigin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Install uBlock Origin</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 2. TV SERIES EPISODE & SEASON PICKER (TV Shows Only)     */}
        {/* ======================================================== */}
        {isTV && seasons.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-primary" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">Episodes</h2>
              </div>

              {/* Season select dropdown */}
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                    setLoading(true);
                  }}
                  className="appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-xs font-semibold text-foreground outline-none transition focus:border-primary cursor-pointer"
                >
                  {seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Episode Grid */}
            {seasonData?.episodes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {seasonData.episodes.map((ep) => {
                  const isCurrent = ep.episode_number === selectedEpisode;
                  return (
                    <button
                      key={ep.episode_number}
                      onClick={() => handleEpisodeClick(ep.episode_number)}
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition active:scale-[0.98] cursor-pointer ${
                        isCurrent
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border/70 bg-secondary/40 text-foreground hover:bg-secondary hover:border-border"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isCurrent ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {ep.episode_number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold truncate leading-tight">
                          {ep.name || `Episode ${ep.episode_number}`}
                        </span>
                        {ep.runtime && (
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {ep.runtime}m
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                <span>Loading episodes...</span>
              </div>
            )}
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. COMPACT TITLE & METADATA CARD                         */}
        {/* ======================================================== */}
        {details && (
          <section className="rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-5">
            {/* Poster Card */}
            {posterUrl && (
              <div className="shrink-0 flex flex-col items-center gap-2">
                <img
                  src={posterUrl}
                  alt={displayTitle}
                  className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-xl border border-border/50 shadow-md"
                  loading="lazy"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span>{(details.vote_average || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">/ 10</span>
                </div>
              </div>
            )}

            {/* Info and Metadata */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {displayTitle}
                  </h2>

                  {/* Trailer button */}
                  {getTrailerUrl(details) && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition active:scale-95 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-red-500 text-red-500" />
                      <span>Trailer</span>
                    </button>
                  )}
                </div>

                {/* Pills Row */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  {year > 0 && (
                    <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-medium text-foreground border border-border/50">
                      {year}
                    </span>
                  )}
                  <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-medium text-foreground border border-border/50">
                    {isTV ? "Series" : "Movie"}
                  </span>
                  {runtime && (
                    <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-medium text-foreground border border-border/50">
                      {runtime}
                    </span>
                  )}
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 font-bold border border-primary/20">
                    HD
                  </span>
                  {details.external_ids?.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${details.external_ids.imdb_id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 font-bold border border-amber-500/20 hover:underline"
                    >
                      IMDb {(details.vote_average || 0).toFixed(1)}
                    </a>
                  )}
                  {details.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Synopsis */}
                {details.overview && (
                  <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {details.overview}
                  </p>
                )}
              </div>

              {/* Cast & Production Chips */}
              <div className="mt-2 pt-3 border-t border-border/50 flex flex-col gap-1.5 text-xs">
                {cast.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-foreground">Cast:</span>
                    <span className="text-muted-foreground">
                      {cast.map((c) => c.name).join(", ")}
                    </span>
                  </div>
                )}
                {providers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-foreground">Studios:</span>
                    <span className="text-muted-foreground">{providers.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 4. MODERN SHARE ROW                                      */}
        {/* ======================================================== */}
        <section className="rounded-xl bg-card border border-border p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-muted-foreground">
            <Share2 className="h-4 w-4 text-primary" />
            <span>Share with friends</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary hover:text-primary transition active:scale-95 cursor-pointer"
              >
                {s.icon}
                <span>{s.name}</span>
              </a>
            ))}
            <CopyLinkButton tmdbId={tmdbId} type={type} title={displayTitle} />
          </div>
        </section>
      </main>

      {/* Official What To Watch Footer */}
      <Footer />

      {/* Trailer Dialog Modal */}
      {details && getTrailerUrl(details) && (
        <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-black">
            <DialogTitle className="sr-only">Trailer</DialogTitle>
            <div className="aspect-video w-full">
              <iframe
                src={`${getTrailerUrl(details)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                title={`${displayTitle} Official Trailer`}
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
