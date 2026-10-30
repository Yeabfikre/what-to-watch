import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Home,
  User,
  Crown,
  Play,
  Download,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Eye,
  CheckCircle2,
  Plus,
  Heart,
  Share2,
  Star,
  Film,
  Building2,
  Tv,
  ChevronDown,
  ChevronRight,
  Languages,
  X,
  Server,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SeasonsEpisodesDrawer } from "@/components/title-details/SeasonsEpisodesDrawer";
import { CastAndStudiosSection } from "@/components/title-details/CastAndStudiosSection";
import { BackgroundTrailer } from "@/components/title-details/BackgroundTrailer";
import { PROVIDERS, type StreamProvider } from "@/config/providers";
import {
  tmdbImg,
  getTitle,
  getYear,
  getTrailerUrl,
  getTrailerKey,
  formatRuntime,
  fetchDetails,
  fetchSeason,
  fetchDiscover,
  getMediaType,
  type TmdbMovie,
} from "@/lib/tmdb";

const TitleDetails = () => {
  const navigate = useNavigate();
  const { type: paramType, id: paramId, slug } = useParams<{ type?: string; id?: string; slug?: string }>();
  const [searchParams] = useSearchParams();

  // Resolve ID and media type
  let resolvedId = 0;
  if (slug) {
    if (slug.includes("dog-stars") || slug.includes("90032151")) {
      resolvedId = 1384216; // The Dog Stars TMDB ID
    } else {
      const match = slug.match(/(\d+)$/);
      resolvedId = match ? Number(match[1]) : 0;
    }
  } else {
    const rawId = paramId || searchParams.get("id");
    resolvedId = rawId ? Number(rawId) || 0 : 0;
  }
  const id = resolvedId;
  const rawType = (paramType || searchParams.get("type") || "movie").toLowerCase();
  const mediaType: "movie" | "tv" = rawType === "tv" ? "tv" : "movie";

  const [imgError, setImgError] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Streaming player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);

  // Fetch full details
  const { data: details, isLoading, error } = useQuery({
    queryKey: ["tmdb", "details", id, mediaType],
    queryFn: () => fetchDetails(id, mediaType),
    enabled: id > 0,
  });

  const isTV = mediaType === "tv" || !!details?.number_of_seasons;

  // Reset state when id changes
  useEffect(() => {
    setShowTrailer(false);
    setShowSimilar(false);
    setIsPlaying(false);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setImgError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Sync saved status from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("user_watchlist") || "[]");
      setIsInWatchlist(watchlist.includes(id));
      const watched = JSON.parse(localStorage.getItem("user_watched") || "[]");
      setIsWatched(watched.includes(id));
      const liked = JSON.parse(localStorage.getItem("user_liked") || "[]");
      setIsLiked(liked.includes(id));
    } catch {
      // ignore storage errors
    }
  }, [id]);

  // Season episodes query for TV series
  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "season", id, selectedSeason],
    queryFn: () => fetchSeason(id, selectedSeason),
    enabled: id > 0 && isTV,
  });

  // Similar titles query
  const firstGenreId = details?.genres?.[0]?.id;
  const { data: similarList } = useQuery({
    queryKey: ["tmdb", "similar", id, firstGenreId],
    queryFn: () =>
      fetchDiscover({
        type: isTV ? "tv" : "movie",
        genreId: firstGenreId ? String(firstGenreId) : undefined,
      }),
    enabled: id > 0 && showSimilar,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
        <Navbar showBack onMovieClick={(m) => navigate(`/title/${getMediaType(m)}/${m.id}`)} />
        <div className="w-full flex-1 flex items-center justify-center min-h-[500px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
        <Navbar showBack onMovieClick={(m) => navigate(`/title/${getMediaType(m)}/${m.id}`)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Film className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Title Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            We couldn't retrieve the details for this title. It may be unavailable or moved.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 cursor-pointer shadow-md"
          >
            <Home className="h-4 w-4" />
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const title = getTitle(details);
  const year = getYear(details);
  const runtime = formatRuntime(details.runtime);
  const backdropUrl = tmdbImg.backdrop(details.backdrop_path);
  const trailerUrl = getTrailerUrl(details);
  const trailerKey = getTrailerKey(details);
  const cast = details.credits?.cast?.slice(0, 15) || [];

  // Director / Creator
  const directorMember = !isTV
    ? details.credits?.crew?.find((c) => c.job === "Director")
    : null;
  const creatorMember = isTV ? details.created_by?.[0] : null;

  const directorName = !isTV
    ? directorMember?.name || "Director"
    : details.created_by?.map((c) => c.name).join(", ") ||
      details.credits?.crew?.find((c) => c.job === "Director")?.name ||
      "Showrunner";

  const directorPhoto = !isTV
    ? tmdbImg.profile(directorMember?.profile_path || null)
    : tmdbImg.profile(creatorMember?.profile_path || null);

  // Studios
  const studios = (details.production_companies || []).slice(0, 4);

  // Country of origin
  const countryOfOrigin =
    details.production_countries?.length
      ? details.production_countries.map((c) => c.name).join(", ")
      : details.origin_country?.join(", ") || "United States";

  // Parental rating & audience
  const getParentalRating = () => {
    if (details.adult) return "R";
    const genreNames = (details.genres || []).map((g) => g.name.toLowerCase());
    if (isTV) {
      if (genreNames.some((g) => ["crime", "horror", "war & politics"].includes(g))) return "TV-MA";
      return "TV-14";
    }
    if (
      genreNames.some((g) => ["horror", "crime", "thriller", "war"].includes(g)) &&
      (details.vote_average || 0) > 6
    ) {
      return "R";
    }
    if (genreNames.some((g) => ["animation", "family"].includes(g))) return "PG";
    return "PG-13";
  };

  const parentalRating = getParentalRating();
  const audience =
    parentalRating === "R" || parentalRating === "TV-MA"
      ? "adult"
      : parentalRating === "PG-13" || parentalRating === "TV-14"
      ? "teens & adults"
      : "general audience";

  // Tags list
  const tagsList = [
    year ? `${Math.floor(year / 10) * 10}s` : "contemporary",
    year ? (year >= 2000 ? "21st century" : "20th century") : "21st century",
    year && year < 2010 ? "classic cinema" : "contemporary",
    ...(details.genres || []).map((g) => g.name.toLowerCase()),
    details.adult ? "mature" : "mainstream",
    ...(details.tagline ? [details.tagline.toLowerCase().replace(/[.!'"]/g, "")] : []),
    "cinema",
    year ? `year ${year}` : "recent",
  ]
    .filter(Boolean)
    .slice(0, 16)
    .join(", ");

  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];

  // Stream Player helpers
  const currentProvider: StreamProvider = PROVIDERS[currentProviderIndex] || PROVIDERS[0];
  const streamSrc = isTV
    ? currentProvider.tv(String(details.id), selectedSeason, selectedEpisode)
    : currentProvider.movie(String(details.id));

  const handleStartStreaming = () => {
    setIsPlaying(true);
    setShowTrailer(false);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDownload = () => {
    const streamLink = `${window.location.origin}/watch?id=${details.id}&type=${isTV ? "tv" : "movie"}&title=${encodeURIComponent(title)}`;
    navigator.clipboard.writeText(streamLink);
    toast({
      title: "Direct High-Speed Stream Ready",
      description: "Direct stream link copied to clipboard. Launching player...",
    });
    handleStartStreaming();
  };

  const handleToggleWatchlist = () => {
    try {
      const watchlist = JSON.parse(localStorage.getItem("user_watchlist") || "[]");
      let updated: number[];
      if (watchlist.includes(details.id)) {
        updated = watchlist.filter((itemId: number) => itemId !== details.id);
        setIsInWatchlist(false);
        toast({ title: "Removed from Watchlist" });
      } else {
        updated = [...watchlist, details.id];
        setIsInWatchlist(true);
        toast({ title: "Added to Watchlist", description: `${title} saved to your list.` });
      }
      localStorage.setItem("user_watchlist", JSON.stringify(updated));
    } catch {
      setIsInWatchlist(!isInWatchlist);
    }
  };

  const handleToggleWatched = () => {
    try {
      const watched = JSON.parse(localStorage.getItem("user_watched") || "[]");
      let updated: number[];
      if (watched.includes(details.id)) {
        updated = watched.filter((itemId: number) => itemId !== details.id);
        setIsWatched(false);
        toast({ title: "Removed from Watched" });
      } else {
        updated = [...watched, details.id];
        setIsWatched(true);
        toast({ title: "Marked as Watched", description: `You've completed ${title}.` });
      }
      localStorage.setItem("user_watched", JSON.stringify(updated));
    } catch {
      setIsWatched(!isWatched);
    }
  };

  const handleToggleLike = () => {
    try {
      const liked = JSON.parse(localStorage.getItem("user_liked") || "[]");
      let updated: number[];
      if (liked.includes(details.id)) {
        updated = liked.filter((itemId: number) => itemId !== details.id);
        setIsLiked(false);
        toast({ title: "Removed from Liked" });
      } else {
        updated = [...liked, details.id];
        setIsLiked(true);
        toast({ title: "Added to Liked", description: `You liked ${title}.` });
      }
      localStorage.setItem("user_liked", JSON.stringify(updated));
    } catch {
      setIsLiked(!isLiked);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/title/${isTV ? "tv" : "movie"}/${details.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Direct link copied to clipboard. Share with friends!",
    });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* What to Watch Top Navigation Bar */}
      <Navbar showBack onMovieClick={(m) => navigate(`/title/${getMediaType(m)}/${m.id}`)} />

      {/* ======================================================== */}
      {/* HERO SECTION CONTAINER (Edge-to-edge What to Watch Flow)  */}
      {/* ======================================================== */}
      <div className="relative flex w-full flex-col overflow-hidden bg-black border-b border-border min-h-[460px] md:min-h-[520px] lg:min-h-[560px]">
        {/* STREAMING PLAYER INTEGRATION (When Playing) */}
        {isPlaying ? (
          <div ref={playerRef} className="relative z-20 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8 flex flex-col justify-center flex-1">
            {/* Player Top Controller Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-card/90 border border-border p-3 rounded-2xl backdrop-blur-md text-card-foreground shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
                <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                  {title} {isTV && `· S${selectedSeason} E${selectedEpisode}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Close Player</span>
                </button>
              </div>
            </div>

            {/* Streaming Iframe Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
              <iframe
                key={`${currentProvider.name}-${details.id}-${selectedSeason}-${selectedEpisode}`}
                src={streamSrc}
                title={`${title} Streaming Player`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Server Switcher Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center bg-card/85 border border-border p-3 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2 font-medium">
                <Server className="h-3.5 w-3.5 text-primary" />
                <span>Servers:</span>
              </div>
              {PROVIDERS.map((provider, idx) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => setCurrentProviderIndex(idx)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    currentProviderIndex === idx
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                      : "border border-border bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>
          ) : (
            /* HERO BANNER WHEN NOT PLAYING */
            <>
              {/* Background Video Trailer with Seamless Backdrop Cross-Fade */}
              <BackgroundTrailer
                trailerKey={trailerKey}
                backdropUrl={backdropUrl}
                title={title}
                isStreamingFull={isPlaying}
              />

              {/* Gradient Overlays */}
              <div className="absolute top-0 left-0 h-16 w-full bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 h-48 sm:h-64 w-full bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

              {/* Hero Main Content */}
              <div className="relative z-20 w-full max-w-7xl mx-auto px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10 md:px-8 md:pt-10 md:pb-12">
                <div className="max-w-3xl">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
                  {title}
                </h1>

                {/* Synopsis Overview */}
                <p className="mt-2.5 text-xs sm:text-sm md:text-base font-normal text-white/80 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
                  {details.overview || "No synopsis available for this title."}
                </p>

                {/* Meta Line */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm font-medium text-white/85">
                  <span className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-0.5 text-xs font-medium tracking-tight text-white/80 backdrop-blur-md">
                    {isTV ? "TV Show" : "Movie"}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span>{(details.vote_average || 0).toFixed(1)}</span>
                  </span>

                  {year > 0 && (
                    <span className="inline-flex items-center gap-x-2.5">
                      <span className="text-white/35">·</span>
                      <span>{year}</span>
                    </span>
                  )}

                  {runtime && (
                    <span className="inline-flex items-center gap-x-2.5">
                      <span className="text-white/35">·</span>
                      <span>{runtime}</span>
                    </span>
                  )}

                  {isTV && details.number_of_seasons && (
                    <span className="inline-flex items-center gap-x-2.5">
                      <span className="text-white/35">·</span>
                      <span>
                        {details.number_of_seasons} season{details.number_of_seasons > 1 ? "s" : ""}
                      </span>
                    </span>
                  )}

                  {(details.genres || []).length > 0 && (
                    <span className="inline-flex items-center gap-x-2.5">
                      <span className="text-white/35">·</span>
                      <span>{details.genres.map((g) => g.name).slice(0, 3).join(", ")}</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* 👑 Stream Button (Starts In-Page Player) */}
                    <button
                      type="button"
                      onClick={handleStartStreaming}
                      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                      <span>Stream</span>
                    </button>

                    {/* 📥 Download Button */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>

                    {/* ▶ Trailer Button */}
                    {trailerUrl && (
                      <button
                        type="button"
                        onClick={() => setShowTrailer(!showTrailer)}
                        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95 cursor-pointer"
                      >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Play className="h-2 w-2 fill-current ml-0.5" />
                        </span>
                        <span>Trailer</span>
                      </button>
                    )}

                    {/* ≈ Similar Button */}
                    <button
                      type="button"
                      onClick={() => setShowSimilar(!showSimilar)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs sm:text-sm font-medium backdrop-blur-sm transition active:scale-95 cursor-pointer ${
                        showSimilar
                          ? "bg-white text-black border-white"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Similar</span>
                    </button>
                  </div>

                  {/* Subtitles Banner */}
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Multi-Language Subtitles Ready",
                        description:
                          "Subtitles in English, Spanish, Arabic, French, German, and 20+ languages available inside player.",
                      })
                    }
                    className="inline-flex self-start items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm transition hover:bg-black/60 hover:border-white/25 active:scale-95 cursor-pointer"
                  >
                    <Languages className="h-3.5 w-3.5 text-white/70" />
                    <span className="font-medium">Subtitles</span>
                    <span className="text-white/60 hidden sm:inline">in your language</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white/80 bg-white/10 px-1.5 py-0.5 rounded">
                      <span>GB</span>
                      <span>SA</span>
                      <span>FR</span>
                      <span>ES</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                  </button>

                  {/* Secondary Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleToggleWatchlist}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all active:scale-95 cursor-pointer ${
                        isInWatchlist
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-white/15 bg-black/40 text-white/90 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {isInWatchlist ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      <span>Watchlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleWatched}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all active:scale-95 cursor-pointer ${
                        isWatched
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-white/15 bg-black/40 text-white/90 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {isWatched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>Mark as Watched</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast({ title: "Added to List" })}
                      className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 active:scale-95 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to list</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleLike}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all active:scale-95 cursor-pointer ${
                        isLiked
                          ? "border-rose-500 bg-rose-500/20 text-rose-400"
                          : "border-white/15 bg-black/40 text-white/90 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span>Like</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 active:scale-95 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* OFFICIAL TRAILER EXPANDED DRAWER                         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-card border-y border-border py-8 px-4 sm:px-8 text-card-foreground"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block" />
                  <h3 className="text-base font-bold text-foreground">Official Trailer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrailer(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close Trailer
                </button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-2xl bg-black">
                <iframe
                  src={`${trailerUrl}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                  title={`${title} Official Trailer`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SIMILAR TITLES DRAWER (When Similar Clicked)             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showSimilar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-card border-y border-border py-8 px-4 sm:px-8 text-card-foreground"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
                  <h3 className="text-base font-bold text-foreground">Similar Recommendations</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSimilar(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {similarList && similarList.length > 0 ? (
                  similarList.slice(0, 12).map((sim: TmdbMovie) => (
                    <button
                      type="button"
                      key={sim.id}
                      onClick={() => navigate(`/title/${isTV ? "tv" : "movie"}/${sim.id}`)}
                      className="w-36 shrink-0 text-left group cursor-pointer focus:outline-none"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-secondary border border-border group-hover:scale-105 group-hover:border-primary/50 transition-all duration-200 shadow-sm">
                        {sim.poster_path ? (
                          <img
                            src={tmdbImg.poster(sim.poster_path) || ""}
                            alt={getTitle(sim)}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {getTitle(sim)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{getYear(sim) || "Recent"}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-4">Loading similar titles...</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA: METADATA & ACTORS & STUDIOS          */}
      {/* ======================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* METADATA DEFINITION ROWS */}
        <div className="space-y-3.5">
          <div className="flex items-baseline gap-3 md:gap-4">
            <span className="w-36 shrink-0 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Parental rating
            </span>
            <span className="text-sm font-semibold text-foreground">{parentalRating}</span>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Audience
            </span>
            <p className="text-sm leading-relaxed text-foreground/85">{audience}</p>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Tags
            </span>
            <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">{tagsList}</p>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Country of origin
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">{countryOfOrigin}</p>
          </div>
        </div>

        {/* SEASONS & EPISODES DRAWER (FOR TV SERIES) */}
        <SeasonsEpisodesDrawer
          isTV={isTV}
          seasons={seasons}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          selectedEpisode={selectedEpisode}
          setSelectedEpisode={setSelectedEpisode}
          seasonData={seasonData}
          isPlaying={isPlaying}
          onSelectEpisode={(epNum) => {
            setSelectedEpisode(epNum);
            handleStartStreaming();
          }}
        />

        {/* ACTORS GRID & STUDIOS TWO-COLUMN SECTION (phonofilm.cc 04-div.html) */}
        <CastAndStudiosSection
          isTV={isTV}
          cast={cast}
          directorName={directorName}
          directorPhoto={directorPhoto}
          studios={studios}
        />
      </div>

      <Footer />
    </div>
  );
};

export default TitleDetails;
