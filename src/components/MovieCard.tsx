import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play } from "lucide-react";
import { tmdbImg, getTitle, getYear, getMediaType, fetchImages, type TmdbMovie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: TmdbMovie;
  index: number;
  onClick: (movie: TmdbMovie) => void;
}

const MovieCard = ({ movie, index, onClick }: MovieCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedImgReady, setExpandedImgReady] = useState(false);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const preloadRef = useRef(false);

  const posterUrl = tmdbImg.poster(movie.poster_path);
  const backdropUrl = tmdbImg.backdrop(movie.backdrop_path);
  const title = getTitle(movie);
  const year = getYear(movie);
  const type = getMediaType(movie);
  const genres = (movie.genre_ids || []).slice(0, 3);
  const matchPercent = Math.round(movie.vote_average * 10);

  const genreMap: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
  };

  // Preload the expanded image on first hover so there's no flash
  useEffect(() => {
    if (!isHovered || preloadRef.current) return;
    preloadRef.current = true;

    const preload = (url: string) => {
      const img = new Image();
      img.onload = () => {
        setExpandedUrl(url);
        setExpandedImgReady(true);
      };
      img.onerror = () => {
        // Fallback to poster
        if (posterUrl) {
          setExpandedUrl(posterUrl);
          setExpandedImgReady(true);
        }
      };
      img.src = url;
    };

    if (backdropUrl) {
      preload(backdropUrl);
    } else if (posterUrl) {
      // No backdrop available – use poster directly
      setExpandedUrl(posterUrl);
      setExpandedImgReady(true);
    }
  }, [isHovered, backdropUrl, posterUrl]);

  const hasBackdrop = !!movie.backdrop_path;
  const expandedPosterUrl = expandedUrl || posterUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, width: isHovered ? 320 : 160 }}
      transition={
        isHovered || !isHovered
          ? { width: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 }, delay: 0, duration: 0.3 }
          : { delay: index * 0.03, duration: 0.3 }
      }
      className="group shrink-0 cursor-pointer snap-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(movie)}
    >
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative overflow-hidden rounded-lg">
              {posterUrl && !imgError ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="aspect-[2/3] w-full object-cover"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-secondary p-3 text-center text-xs text-muted-foreground">
                  {title}
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="text-foreground">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="absolute left-2 top-2 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground backdrop-blur-sm">
                {type === "tv" ? "Series" : "Movie"}
              </div>
            </div>
            <p className="mt-2 truncate text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{year || ""}</p>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-visible rounded-xl bg-card shadow-2xl shadow-black/40 ring-1 ring-border/20"
          >
            {/* Alternate poster preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
              {expandedPosterUrl && expandedImgReady ? (
                hasBackdrop ? (
                  <img src={expandedPosterUrl} alt={title} className="h-full w-full object-cover object-center" />
                ) : (
                  /* Poster-only: blurred poster bg + centered poster */
                  <div className="relative h-full w-full">
                    <img src={expandedPosterUrl} alt="" className="absolute inset-0 h-full w-full object-cover blur-xl scale-110 opacity-50" />
                    <img src={expandedPosterUrl} alt={title} className="relative h-full w-full object-contain" />
                  </div>
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-sm">
                  {title}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Info section */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="space-y-1.5 p-2.5"
            >
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onClick(movie); }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
                <span className="ml-auto text-xs font-bold text-foreground">
                  {movie.vote_average.toFixed(1)}
                  <Star className="ml-0.5 inline h-3 w-3 fill-gold text-gold" />
                </span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>{year}</span>
                <span>·</span>
                <span>{type === "tv" ? "Series" : "Movie"}</span>
                {movie.vote_average > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {/* Genre tags */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {genres.map((gId) => (
                    <span
                      key={gId}
                      className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-secondary-foreground"
                    >
                      {genreMap[gId] || "Genre"}
                    </span>
                  ))}
                </div>
              )}

              <p className="truncate text-[11px] font-medium text-foreground">{title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MovieCard;
