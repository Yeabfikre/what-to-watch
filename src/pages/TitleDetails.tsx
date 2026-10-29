import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Home,
  Search,
  User,
  Volume2,
  VolumeX,
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
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
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0e0e0d] text-[#f5f2ea] flex flex-col">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
            >
              <Home className="h-4 w-4" />
            </button>
          </div>
          <div className="h-11 w-64 rounded-full bg-white/5 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-16 rounded-full bg-white/5 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>

        <div className="w-full h-[540px] bg-white/5 animate-pulse flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8a13a] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen w-full bg-[#0e0e0d] text-[#f5f2ea] flex flex-col items-center justify-center p-6 text-center">
        <Film className="h-16 w-16 text-white/30 mb-4" />
        <h2 className="text-2xl font-bold text-white">Title Not Found</h2>
        <p className="mt-2 text-sm text-[#b7b7b6] max-w-md">
          We couldn't retrieve the details for this title. It may be unavailable or moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 rounded-full bg-[#e8a13a] px-6 py-2.5 text-sm font-semibold text-[#0e0e0d] transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Return Home
        </button>
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
    <div className="min-h-screen w-full bg-[#0e0e0d] text-[#f5f2ea] flex flex-col selection:bg-[#e8a13a]/30">
      {/* ======================================================== */}
      {/* HERO SECTION CONTAINER (phonofilm.cc Design Architecture) */}
      {/* ======================================================== */}
      <div className="relative w-full overflow-hidden md:p-3 max-w-7xl mx-auto">
        <div className="relative flex w-full flex-col overflow-hidden bg-black md:rounded-[28px] border border-[#2e2a26] min-h-[520px] md:min-h-[640px] shadow-[0_8px_20px_rgba(0,0,0,0.34)]">
          {/* Top navigation bar */}
          <div className="relative z-30 w-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-8">
            <div className="flex w-full items-center justify-between gap-3 sm:gap-6">
              {/* Left: Back & Home controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  aria-label="Home"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 active:scale-95"
                >
                  <Home className="h-4 w-4" />
                </button>
              </div>

              {/* Center: Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-white/60 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Movies"
                    className="w-full rounded-full bg-white/10 border border-white/10 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-[#f5f2ea] placeholder-neutral-400 backdrop-blur-md outline-none transition focus:border-white/25 focus:bg-white/15"
                  />
                </div>
              </form>

              {/* Right: Me user pill & Audio/Mute toggle */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#f5f2ea] px-4 text-[#0e0e0d] font-semibold text-xs backdrop-blur-md shadow-sm">
                  <User className="h-3.5 w-3.5" />
                  <span>Me</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 active:scale-95"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* STREAMING PLAYER INTEGRATION (When Playing) */}
          {isPlaying ? (
            <div ref={playerRef} className="relative z-20 w-full p-4 sm:p-6 md:p-8 flex flex-col justify-center flex-1">
              {/* Player Top Controller Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#161513]/90 border border-[#2e2a26] p-3 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-[#e8a13a] rounded-full inline-block" />
                  <span className="text-sm font-semibold text-[#f5f2ea] truncate max-w-xs sm:max-w-md">
                    {title} {isTV && `· S${selectedSeason} E${selectedEpisode}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Close Player</span>
                  </button>
                </div>
              </div>

              {/* Streaming Iframe Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#2e2a26] bg-black shadow-2xl">
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
              <div className="mt-4 flex flex-wrap items-center gap-2 justify-center bg-[#161513]/80 border border-[#2e2a26] p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-[#b7b7b6] mr-2">
                  <Server className="h-3.5 w-3.5 text-[#e8a13a]" />
                  <span>Servers:</span>
                </div>
                {PROVIDERS.map((provider, idx) => (
                  <button
                    key={provider.name}
                    type="button"
                    onClick={() => setCurrentProviderIndex(idx)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
                      currentProviderIndex === idx
                        ? "bg-[#e8a13a] text-[#0e0e0d] shadow-[0_4px_12px_rgba(232,161,58,0.35)]"
                        : "border border-white/15 bg-white/[0.07] text-[#f5f2ea] hover:bg-white/[0.12]"
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

              {/* Gradient Overlays matching phonofilm.cc */}
              <div className="absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 h-96 w-full bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

              {/* Hero Main Content */}
              <div className="relative z-20 px-4 pt-24 pb-8 sm:px-6 md:px-8 md:pt-36 md:pb-12 lg:px-12 mt-auto max-w-4xl">
                {/* Title */}
                <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08] drop-shadow-md">
                  {title}
                </h1>

                {/* Synopsis Overview */}
                <p className="mt-3 text-sm md:text-base font-normal text-white/80 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
                  {details.overview || "No synopsis available for this title."}
                </p>

                {/* Meta Line */}
                <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm font-medium text-white/85">
                  <span className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-0.5 text-xs font-medium tracking-tight text-white/80 backdrop-blur-md">
                    {isTV ? "TV Show" : "Movie"}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-[#e8a13a] text-[#e8a13a]" />
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
                <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
                  <div className="flex flex-nowrap items-stretch gap-1.5 sm:gap-3">
                    {/* 👑 Stream Button (Starts In-Page Player) */}
                    <button
                      type="button"
                      onClick={handleStartStreaming}
                      className="flex h-11 sm:h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 sm:px-8 text-sm font-bold whitespace-nowrap text-black shadow-[0_10px_28px_rgba(255,255,255,0.18)] transition-transform hover:bg-white/90 active:scale-[0.98] cursor-pointer"
                    >
                      <Crown className="h-4 w-4 fill-[#e8a13a] text-[#e8a13a]" />
                      <span>Stream</span>
                    </button>

                    {/* 📥 Download Button */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex h-11 sm:h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#e8a13a] px-6 sm:px-8 text-sm font-bold whitespace-nowrap text-[#0e0e0d] shadow-[0_10px_28px_rgba(232,161,58,0.28)] transition-transform hover:bg-[#e8a13a]/90 active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>

                    {/* ▶ Trailer Button */}
                    {trailerUrl && (
                      <button
                        type="button"
                        onClick={() => setShowTrailer(!showTrailer)}
                        className="flex h-11 sm:h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-5 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white">
                          <Play className="h-2 w-2 fill-current ml-0.5" />
                        </span>
                        <span>Trailer</span>
                      </button>
                    )}

                    {/* ≈ Similar Button */}
                    <button
                      type="button"
                      onClick={() => setShowSimilar(!showSimilar)}
                      className={`hidden sm:flex h-11 sm:h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors active:scale-[0.98] cursor-pointer ${
                        showSimilar
                          ? "bg-white text-black border-white"
                          : "border-white/15 bg-white/[0.07] hover:bg-white/[0.12]"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-[#e8a13a]" />
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
                    className="flex h-11 sm:h-12 w-full sm:w-auto sm:self-start items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] pr-3 pl-4 sm:pr-4 sm:pl-5 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors hover:bg-white/[0.12] active:scale-[0.99] cursor-pointer"
                  >
                    <Languages className="h-4 w-4 text-white/70" />
                    <span>Subtitles</span>
                    <span className="hidden min-w-0 truncate text-[12.5px] font-medium text-white/55 sm:inline">
                      in your language
                    </span>
                    <span className="ml-auto sm:ml-1 flex shrink-0 items-center gap-1 pl-1 text-sm">
                      <span>🇬🇧</span>
                      <span>🇸🇦</span>
                      <span>🇫🇷</span>
                      <span>🇪🇸</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </button>

                  {/* Mobile 5-Column Grid for Secondary Actions */}
                  <div className="grid grid-cols-5 gap-2 md:hidden pt-1">
                    <button
                      type="button"
                      onClick={handleToggleWatchlist}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-2 backdrop-blur-md transition-all active:scale-[0.95] ${
                        isInWatchlist
                          ? "border-[#e8a13a] bg-[#e8a13a]/20 text-[#e8a13a]"
                          : "border-white/12 bg-white/[0.06] text-white/85"
                      }`}
                    >
                      {isInWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      <span className="text-[10.5px] font-semibold tracking-tight">Watchlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleWatched}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-2 backdrop-blur-md transition-all active:scale-[0.95] ${
                        isWatched
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-white/12 bg-white/[0.06] text-white/85"
                      }`}
                    >
                      {isWatched ? <CheckCircle2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="text-[10.5px] font-semibold tracking-tight">Watched</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast({ title: "Added to List" })}
                      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/[0.06] py-2 text-white/85 backdrop-blur-md transition-all active:scale-[0.95]"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-[10.5px] font-semibold tracking-tight">List</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleLike}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border py-2 backdrop-blur-md transition-all active:scale-[0.95] ${
                        isLiked
                          ? "border-rose-500 bg-rose-500/20 text-rose-400"
                          : "border-white/12 bg-white/[0.06] text-white/85"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      <span className="text-[10.5px] font-semibold tracking-tight">Like</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/[0.06] py-2 text-white/85 backdrop-blur-md transition-all active:scale-[0.95]"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-[10.5px] font-semibold tracking-tight">Share</span>
                    </button>
                  </div>

                  {/* Desktop Horizontal Row for Secondary Actions */}
                  <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleToggleWatchlist}
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-semibold backdrop-blur-md transition-colors active:scale-[0.97] cursor-pointer ${
                        isInWatchlist
                          ? "border-[#e8a13a] bg-[#e8a13a]/20 text-[#e8a13a]"
                          : "border-white/15 bg-white/[0.06] text-white/85 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      {isInWatchlist ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      <span>Watchlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleWatched}
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-semibold backdrop-blur-md transition-colors active:scale-[0.97] cursor-pointer ${
                        isWatched
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-white/15 bg-white/[0.06] text-white/85 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      {isWatched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>Mark as Watched</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast({ title: "Added to List" })}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 text-xs font-semibold text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 active:scale-[0.97] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to list</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleLike}
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-semibold backdrop-blur-md transition-colors active:scale-[0.97] cursor-pointer ${
                        isLiked
                          ? "border-rose-500 bg-rose-500/20 text-rose-400"
                          : "border-white/15 bg-white/[0.06] text-white/85 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span>Like</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 text-xs font-semibold text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 active:scale-[0.97] cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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
            className="w-full bg-[#161513] border-y border-[#2e2a26] py-8 px-4 sm:px-8"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white">Official Trailer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrailer(false)}
                  className="text-xs text-[#b7b7b6] hover:text-white"
                >
                  Close Trailer
                </button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[#2e2a26] shadow-2xl bg-black">
                <iframe
                  src={`${trailerUrl}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${isMuted ? "&mute=1" : ""}`}
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
            className="w-full bg-[#161513] border-y border-[#2e2a26] py-8 px-4 sm:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#e8a13a] rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white">Similar Recommendations</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSimilar(false)}
                  className="text-xs text-[#b7b7b6] hover:text-white"
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
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#161513] border border-[#2e2a26] group-hover:scale-105 transition-transform duration-200">
                        {sim.poster_path ? (
                          <img
                            src={tmdbImg.poster(sim.poster_path) || ""}
                            alt={getTitle(sim)}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film className="h-8 w-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-semibold text-[#f5f2ea] truncate group-hover:text-[#e8a13a]">
                        {getTitle(sim)}
                      </p>
                      <p className="text-[11px] text-[#b7b7b6]">{getYear(sim) || "Recent"}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-[#b7b7b6] py-4">Loading similar titles...</p>
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
        {/* METADATA DEFINITION ROWS (phonofilm.cc 03-div.html) */}
        <div className="space-y-3 border-t border-white/10 pt-5">
          <div className="flex items-baseline gap-3 md:gap-4">
            <span className="w-36 shrink-0 text-[10px] font-semibold tracking-[0.18em] text-[#b7b7b6] uppercase">
              Parental rating
            </span>
            <span className="text-sm font-semibold text-white/90">{parentalRating}</span>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#b7b7b6] uppercase">
              Audience
            </span>
            <p className="text-sm leading-relaxed text-white/75">{audience}</p>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#b7b7b6] uppercase">
              Tags
            </span>
            <p className="line-clamp-2 text-sm leading-relaxed text-white/70">{tagsList}</p>
          </div>

          <div className="flex gap-3 md:gap-4">
            <span className="w-36 shrink-0 pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#b7b7b6] uppercase">
              Country of origin
            </span>
            <p className="text-sm leading-relaxed text-white/70">{countryOfOrigin}</p>
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
