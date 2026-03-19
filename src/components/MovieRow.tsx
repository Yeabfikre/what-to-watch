import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import MovieCard from "./MovieCard";
import type { TmdbMovie } from "@/lib/tmdb";

interface MovieRowProps {
  title: string;
  movies: TmdbMovie[];
  onMovieClick: (movie: TmdbMovie) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

// Global blocklist of TMDB IDs to hide everywhere
const BLOCKED_IDS = new Set([22980, 59941]); // Watch What Happens Live

const MovieRow = ({ title, movies, onMovieClick, fetchNextPage, hasNextPage, isFetchingNextPage }: MovieRowProps) => {
  const filteredMovies = movies.filter((m) => !BLOCKED_IDS.has(m.id));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const tryFetchMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Trigger fetch when within 2 screen widths from the end
    const remainingScroll = scrollWidth - clientWidth - scrollLeft;
    if (remainingScroll < clientWidth * 2) {
      tryFetchMore();
    }
  }, [tryFetchMore]);

  // Also eagerly load more whenever new movies arrive and there are more pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && filteredMovies.length < 40) {
      tryFetchMore();
    }
  }, [filteredMovies.length, hasNextPage, isFetchingNextPage, tryFetchMore]);

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });

    // If scrolling right and near end, preload
    if (dir === "right") {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const remainingScroll = scrollWidth - clientWidth - scrollLeft - 500; // account for the scroll we're about to do
      if (remainingScroll < clientWidth * 2) {
        tryFetchMore();
      }
    }
  };

  // Forward vertical wheel events to the window so the page scrolls even when
  // the cursor is over the horizontally-scrollable row / expanded card.
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  }, []);

  if (movies.length === 0) return null;

  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="relative">
      <h2 className="mb-3 text-xl font-bold text-foreground">{title}</h2>

      <div className="group/row relative" onWheel={handleWheel}>
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/90 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition group-hover/row:opacity-100 hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar flex h-[300px] items-start gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth"
          style={{ overscrollBehavior: "auto" }}
        >
          {filteredMovies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} onClick={onMovieClick} />
          ))}

          {isFetchingNextPage && (
            <div className="flex h-[260px] min-w-[160px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasNextPage && !isFetchingNextPage && (
            <div className="flex h-[260px] min-w-[140px] items-center justify-center">
              <button
                onClick={tryFetchMore}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-3 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
                <span>Load more</span>
              </button>
            </div>
          )}
        </div>

        {(canScrollRight || hasNextPage) && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/90 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition group-hover/row:opacity-100 hover:bg-secondary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default MovieRow;
