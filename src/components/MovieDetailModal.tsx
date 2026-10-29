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
  Clock,
  Calendar,
  Languages,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import {
  tmdbImg,
  getTitle,
  getYear,
  getTrailerUrl,
  formatRuntime,
  fetchSeason,
  fetchDiscover,
  type TmdbDetails,
  type TmdbMovie,
} from "@/lib/tmdb";

interface MovieDetailModalProps {
  details: TmdbDetails | null;
  onClose: () => void;
  mediaType?: "movie" | "tv";
}

const MovieDetailModal = ({ details, onClose, mediaType }: MovieDetailModalProps) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Determine media type
  const isTV = mediaType === "tv" || (mediaType !== "movie" && !!details?.number_of_seasons);

  // Sync saved status from localStorage
  useEffect(() => {
    if (!details) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("user_watchlist") || "[]");
      setIsInWatchlist(watchlist.includes(details.id));
      const watched = JSON.parse(localStorage.getItem("user_watched") || "[]");
      setIsWatched(watched.includes(details.id));
      const liked = JSON.parse(localStorage.getItem("user_liked") || "[]");
      setIsLiked(liked.includes(details.id));
    } catch {
      // ignore storage errors
    }
  }, [details?.id]);

  // Season episodes for TV series
  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "season", details?.id, selectedSeason],
    queryFn: () => fetchSeason(details!.id, selectedSeason),
    enabled: !!details && isTV,
  });

  // Similar movies query (triggered when user clicks Similar)
  const firstGenreId = details?.genres?.[0]?.id;
  const { data: similarList } = useQuery({
    queryKey: ["tmdb", "similar", details?.id, firstGenreId],
    queryFn: () =>
      fetchDiscover({
        type: isTV ? "tv" : "movie",
        genreId: firstGenreId ? String(firstGenreId) : undefined,
      }),
    enabled: !!details && showSimilar,
  });

  if (!details) return null;

  const title = getTitle(details);
  const year = getYear(details);
  const runtime = formatRuntime(details.runtime);
  const backdropUrl = tmdbImg.backdrop(details.backdrop_path);
  const trailerUrl = getTrailerUrl(details);
  const cast = details.credits?.cast?.slice(0, 15) || [];

  // Director resolution (Movie director from crew, or TV creator)
  const directorMember = !isTV
    ? details.credits?.crew?.find((c) => c.job === "Director")
    : null;
  const directorName = !isTV
    ? directorMember?.name || "Director"
    : details.created_by?.map((c) => c.name).join(", ") ||
      details.credits?.crew?.find((c) => c.job === "Director")?.name ||
      "Showrunner";

  // Production companies / Studios
  const studios = (details.production_companies || []).slice(0, 4);

  // Countries of origin
  const countryOfOrigin =
    details.production_countries?.length
      ? details.production_countries.map((c) => c.name).join(", ")
      : details.origin_country?.join(", ") || "United States";

  // Parental rating & audience calculation
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
    year ? `${Math.floor(year / 10) * 10}s` : "2020s",
    "21st century",
    "contemporary",
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

  // Action handlers
  const handleStream = () => {
    onClose();
    navigate(
      `/watch?title=${encodeURIComponent(title)}&type=${isTV ? "tv" : "movie"}&id=${details.id}`
    );
  };

  const handleDownload = () => {
    const streamLink = `${window.location.origin}/watch?id=${details.id}&type=${isTV ? "tv" : "movie"}&title=${encodeURIComponent(title)}`;
    navigator.clipboard.writeText(streamLink);
    toast({
      title: "Direct High-Speed Stream Ready",
      description: "Stream link copied to clipboard! Opening playback stream now.",
    });
    handleStream();
  };

  const handleToggleWatchlist = () => {
    try {
      const watchlist = JSON.parse(localStorage.getItem("user_watchlist") || "[]");
      let updated: number[];
      if (watchlist.includes(details.id)) {
        updated = watchlist.filter((id: number) => id !== details.id);
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
        updated = watched.filter((id: number) => id !== details.id);
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
        updated = liked.filter((id: number) => id !== details.id);
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
    const url = `${window.location.origin}/watch?id=${details.id}&type=${isTV ? "tv" : "movie"}&title=${encodeURIComponent(title)}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Direct link copied to clipboard. Share with friends!",
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0f14] text-foreground shadow-2xl hide-scrollbar"
        >
          {/* ======================================================== */}
          {/* HERO BANNER SECTION (Target Design: Image 2)            */}
          {/* ======================================================== */}
          <div className="relative min-h-[460px] sm:min-h-[520px] w-full overflow-hidden rounded-t-3xl flex flex-col justify-between p-4 sm:p-7">
            {/* Background Backdrop Image */}
            {backdropUrl && !imgError ? (
              <img
                src={backdropUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                <Film className="h-20 w-20 text-white/20" />
              </div>
            )}

            {/* Gradient Overlays for High Contrast & Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/85 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/65 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/80 via-transparent to-transparent z-10 pointer-events-none" />

            {/* --- TOP BAR --- */}
            <div className="relative z-20 flex items-center justify-between gap-2 sm:gap-4">
              {/* Left: Back & Home controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  aria-label="Back"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white border border-white/15 backdrop-blur-md transition hover:bg-black/80 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/");
                  }}
                  aria-label="Home"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white border border-white/15 backdrop-blur-md transition hover:bg-black/80 hover:scale-105"
                >
                  <Home className="h-4 w-4" />
                </button>
              </div>

              {/* Center: Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm mx-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-3.5 w-3.5 text-white/60 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Movies"
                    className="w-full rounded-full bg-black/45 border border-white/15 py-1.5 pl-9 pr-4 text-xs sm:text-sm text-white placeholder-white/50 backdrop-blur-md outline-none transition focus:border-white/40 focus:bg-black/70"
                  />
                </div>
              </form>

              {/* Right: Me user pill & Audio/Mute toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-black/50 border border-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <User className="h-3.5 w-3.5 text-white/80" />
                  <span className="hidden sm:inline">Me</span>
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white border border-white/15 backdrop-blur-md transition hover:bg-black/80 hover:scale-105"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* --- HERO MAIN DETAILS & CTA BUTTONS --- */}
            <div className="relative z-20 mt-auto pt-12 sm:pt-20 max-w-3xl">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {title}
              </h1>

              {/* Synopsis Overview */}
              <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-200/90 leading-relaxed max-w-2xl font-normal drop-shadow line-clamp-3 sm:line-clamp-4">
                {details.overview || "No overview available for this title."}
              </p>

              {/* Meta Pill Line */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
                <span className="rounded-full bg-white/15 border border-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {isTV ? "Series" : "Movie"}
                </span>

                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{(details.vote_average || 0).toFixed(1)}</span>
                </div>

                {year > 0 && <span>{year}</span>}

                {runtime && <span>{runtime}</span>}

                {isTV && details.number_of_seasons && (
                  <span>
                    {details.number_of_seasons} season{details.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}

                {(details.genres || []).length > 0 && (
                  <span className="text-gray-300/80">
                    {details.genres.map((g) => g.name).slice(0, 3).join(", ")}
                  </span>
                )}
              </div>

              {/* Primary Action Buttons Row */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* 👑 Stream Button (Primary CTA) */}
                <button
                  onClick={handleStream}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm sm:text-base font-bold text-black shadow-lg transition hover:bg-white/90 active:scale-95"
                >
                  <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />
                  Stream
                </button>

                {/* 📥 Download Button */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm sm:text-base font-bold text-black shadow-lg transition hover:bg-amber-400 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>

                {/* ▶ Trailer Button */}
                {trailerUrl && (
                  <button
                    onClick={() => setShowTrailer(!showTrailer)}
                    className="flex items-center gap-2 rounded-full bg-black/60 border border-white/15 px-5 py-2.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition hover:bg-black/80 hover:border-white/30 active:scale-95"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white">
                      <Play className="h-2 w-2 fill-current ml-0.5" />
                    </span>
                    Trailer
                  </button>
                )}

                {/* ≈ Similar Button */}
                <button
                  onClick={() => setShowSimilar(!showSimilar)}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm sm:text-base font-semibold backdrop-blur-md transition active:scale-95 ${
                    showSimilar
                      ? "bg-white text-black border-white"
                      : "bg-black/60 border-white/15 text-white hover:bg-black/80 hover:border-white/30"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Similar
                </button>
              </div>

              {/* Subtitles Banner */}
              <div
                onClick={() =>
                  toast({
                    title: "Multi-Language Subtitles Ready",
                    description:
                      "Subtitles in English, Spanish, Arabic, French, German, and 20+ languages available inside player.",
                  })
                }
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/45 border border-white/10 px-4 py-1.5 text-xs text-white/90 backdrop-blur-md cursor-pointer transition hover:bg-black/65 hover:border-white/20"
              >
                <Languages className="h-3.5 w-3.5 text-white/70" />
                <span className="font-semibold">Subtitles</span>
                <span className="text-white/60">in your language</span>
                <span className="flex items-center gap-1 ml-1 text-sm">
                  <span>🇬🇧</span>
                  <span>🇸🇦</span>
                  <span>🇪🇸</span>
                  <span>🇫🇷</span>
                  <span>🇩🇪</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/50" />
              </div>

              {/* Secondary Actions Row */}
              <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5">
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                    isInWatchlist
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/15 bg-black/40 text-white hover:bg-white/10"
                  }`}
                >
                  {isInWatchlist ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>Watchlist</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                    isWatched
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-white/15 bg-black/40 text-white hover:bg-white/10"
                  }`}
                >
                  {isWatched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>Mark as Watched</span>
                </button>

                <button
                  onClick={() => toast({ title: "Added to List", description: `${title} saved to list.` })}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to list</span>
                </button>

                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                    isLiked
                      ? "border-rose-500 bg-rose-500/20 text-rose-400"
                      : "border-white/15 bg-black/40 text-white hover:bg-white/10"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                  <span>Like</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/10"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TRAILER EXPANDED PLAYER (When Trailer Clicked)           */}
          {/* ======================================================== */}
          {showTrailer && trailerUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 sm:p-7 border-t border-white/10 bg-black/40"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-red-500 rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white">Official Trailer</h3>
                </div>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Close Trailer
                </button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
                <iframe
                  src={`${trailerUrl}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${isMuted ? "&mute=1" : ""}`}
                  title={`${title} Official Trailer`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SIMILAR TITLES SHELF (When Similar Clicked)              */}
          {/* ======================================================== */}
          {showSimilar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 sm:p-7 border-t border-white/10 bg-black/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-400 rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white">Similar Recommendations</h3>
                </div>
                <button
                  onClick={() => setShowSimilar(false)}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Close Similar
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {similarList && similarList.length > 0 ? (
                  similarList.slice(0, 10).map((sim: TmdbMovie) => (
                    <div
                      key={sim.id}
                      onClick={() => {
                        onClose();
                        navigate(
                          `/watch?title=${encodeURIComponent(getTitle(sim))}&type=${isTV ? "tv" : "movie"}&id=${sim.id}`
                        );
                      }}
                      className="w-32 shrink-0 cursor-pointer group"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-secondary border border-white/10 group-hover:scale-105 transition-transform duration-200">
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
                      <p className="mt-1.5 text-xs font-semibold text-white truncate group-hover:text-primary">
                        {getTitle(sim)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{getYear(sim) || "Recent"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-4">Loading similar titles...</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TV SHOW SEASONS & EPISODES (When Media is TV Series)     */}
          {/* ======================================================== */}
          {isTV && seasons.length > 0 && (
            <div className="p-4 sm:p-7 border-t border-white/10 bg-black/20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white">Episodes & Seasons</h3>
                </div>

                {seasons.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="appearance-none rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 pr-8 text-xs font-semibold text-white outline-none transition hover:bg-white/10 focus:border-primary"
                    >
                      {seasons.map((s) => (
                        <option key={s.season_number} value={s.season_number} className="bg-zinc-900 text-white">
                          {s.name} ({s.episode_count} ep)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
                  </div>
                )}
              </div>

              {/* Episodes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
                {seasonData?.episodes?.map((ep) => {
                  const stillUrl = ep.still_path
                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                    : null;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        onClose();
                        navigate(
                          `/watch?title=${encodeURIComponent(title)}&type=tv&id=${details.id}&season=${ep.season_number}&episode=${ep.episode_number}`
                        );
                      }}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 cursor-pointer transition hover:bg-white/10 hover:border-white/20 group"
                    >
                      <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary relative">
                        {stillUrl ? (
                          <img
                            src={stillUrl}
                            alt={ep.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Tv className="h-6 w-6 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-5 w-5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-primary">
                          {ep.episode_number}. {ep.name}
                        </p>
                        {ep.runtime && (
                          <span className="text-[11px] text-muted-foreground mt-0.5">{ep.runtime}m</span>
                        )}
                        {ep.overview && (
                          <p className="mt-1 text-[11px] text-gray-400 line-clamp-1">{ep.overview}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* METADATA DEFINITION GRID (Target Design: Image 3)        */}
          {/* ======================================================== */}
          <div className="border-t border-white/10 p-5 sm:p-8 space-y-7">
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-x-4 gap-y-3 font-mono text-xs text-muted-foreground">
              <span className="uppercase tracking-wider text-muted-foreground/70">PARENTAL RATING</span>
              <span className="font-semibold text-white">{parentalRating}</span>

              <span className="uppercase tracking-wider text-muted-foreground/70">AUDIENCE</span>
              <span className="text-white">{audience}</span>

              <span className="uppercase tracking-wider text-muted-foreground/70">TAGS</span>
              <span className="text-muted-foreground leading-relaxed">{tagsList}</span>

              <span className="uppercase tracking-wider text-muted-foreground/70">COUNTRY OF ORIGIN</span>
              <span className="text-white">{countryOfOrigin}</span>
            </div>

            {/* ======================================================== */}
            {/* DIRECTOR & STUDIOS SECTION (Target Design: Image 3)      */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Left Column: | Director */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 bg-white rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {isTV ? "Creator" : "Director"}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-secondary border border-white/10 shadow-md">
                    {directorMember?.profile_path ? (
                      <img
                        src={tmdbImg.profile(directorMember.profile_path) || ""}
                        alt={directorName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                        <User className="h-10 w-10 text-white/40" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">{directorName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{isTV ? "Creator" : "Director"}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: | Studios */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 bg-white rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white tracking-wide">Studios</h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {studios.length > 0 ? (
                    studios.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 p-3 transition hover:bg-white/10"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-sm overflow-hidden">
                          {company.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                              alt={company.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-zinc-800" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-white truncate">{company.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
                        <Film className="h-5 w-5 text-zinc-800" />
                      </div>
                      <span className="text-sm font-semibold text-white">Independent Production</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* ACTORS SECTION (Target Design: Image 4)                  */}
            {/* ======================================================== */}
            {cast.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 bg-white rounded-full inline-block" />
                  <h3 className="text-base font-bold text-white tracking-wide">Actors</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {cast.map((actor) => {
                    const photoUrl = tmdbImg.profile(actor.profile_path);
                    return (
                      <div key={actor.id} className="group">
                        <div className="aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-secondary border border-white/10 shadow-md relative">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={actor.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                              <User className="h-10 w-10 text-white/40" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white truncate leading-tight group-hover:text-primary transition-colors">
                          {actor.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-tight">Actor</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieDetailModal;
