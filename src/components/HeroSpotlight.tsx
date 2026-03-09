import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tmdbImg, getTitle, getYear, getMediaType, type TmdbMovie } from "@/lib/tmdb";

interface HeroSpotlightProps {
  movies: TmdbMovie[];
  onInfoClick: (movie: TmdbMovie) => void;
}

const ROTATE_INTERVAL = 8000;

// Global blocklist of TMDB IDs to hide from hero
const HERO_BLOCKED_IDS = new Set([22980, 59941]); // Watch What Happens Live

const HeroSpotlight = ({ movies, onInfoClick }: HeroSpotlightProps) => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const featured = movies.filter((m) => !HERO_BLOCKED_IDS.has(m.id)).slice(0, 6);

  const next = useCallback(() => {
    setCurrentIdx((i) => (i + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setCurrentIdx((i) => (i - 1 + featured.length) % featured.length);
  }, [featured.length]);

  // Auto-rotate
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(next, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;

  const movie = featured[currentIdx];
  const backdropUrl = tmdbImg.backdrop(movie.backdrop_path);
  const title = getTitle(movie);
  const year = getYear(movie);
  const type = getMediaType(movie);
  const rating = movie.vote_average?.toFixed(1);

  const genreMap: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
  };

  const genres = (movie.genre_ids || []).slice(0, 3).map((id) => genreMap[id] || "");

  const handleWatch = () => {
    navigate(`/watch?id=${movie.id}&type=${type}&title=${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
      {/* Background color fill for left side */}
      <div className="absolute inset-0 bg-background" />

      {/* Backdrop image - positioned on the right */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-y-0 right-0 w-[65%]"
        >
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={title}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays - fade image into left background */}
      <div className="absolute inset-y-0 right-0 w-[65%] bg-gradient-to-r from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="max-w-2xl"
            >

              {/* Title */}
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {title}
              </h1>

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-foreground">{rating}</span>
                </div>
                {year > 0 && (
                  <span className="text-muted-foreground">{year}</span>
                )}
                <span className="rounded border border-border/50 px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                  {type === "tv" ? "Series" : "Movie"}
                </span>
                {genres.filter(Boolean).map((g) => (
                  <span key={g} className="text-muted-foreground">
                    {g}
                  </span>
                ))}
              </div>

              {/* Overview */}
              {movie.overview && (
                <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {movie.overview}
                </p>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatch}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInfoClick(movie)}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/20"
                >
                  <Eye className="h-4 w-4" />
                  Details
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/30 bg-card/30 text-foreground backdrop-blur-sm transition hover:bg-card/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/30 bg-card/30 text-foreground backdrop-blur-sm transition hover:bg-card/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSpotlight;
