import { useState, useRef, useEffect } from "react";
import { Search, X, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearch, tmdbImg, getTitle, getYear, getMediaType, type TmdbMovie } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onMovieClick: (movie: TmdbMovie) => void;
}

const SearchBar = ({ onMovieClick }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["tmdb", "search", debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Filter to only movies and TV
  const filtered = results.filter(
    (r: any) => r.media_type === "movie" || r.media_type === "tv"
  ).slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (movie: TmdbMovie) => {
    onMovieClick(movie);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-full md:max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search movies & TV shows..."
          className="h-10 w-full rounded-full border border-border bg-secondary pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && debouncedQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            // On mobile/tablet, the wrapper might be narrow. Break out by making it absolute to screen width or a fixed max width centered if needed.
            // Using a fixed w-[95vw] max-w-md and centering it with fixed positioning (or negative margins) on small screens.
            // On md screens, it aligns to right-0 with a fixed w-[400px].
            className="fixed left-2 right-2 top-20 z-50 overflow-hidden rounded-xl border border-border bg-card shadow-xl md:absolute md:left-auto md:right-0 md:top-12 md:w-[400px] md:max-w-[400px]"
          >
            {isFetching ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {filtered.map((movie: TmdbMovie) => {
                  const posterUrl = tmdbImg.poster(movie.poster_path);
                  const title = getTitle(movie);
                  const year = getYear(movie);
                  const type = getMediaType(movie);
                  return (
                    <button
                      key={movie.id}
                      onClick={() => handleSelect(movie)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-secondary"
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={title}
                          className="h-14 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                          N/A
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase">{type === "tv" ? "Series" : "Movie"}</span>
                          {year > 0 && <span>{year}</span>}
                          {movie.vote_average > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-gold text-gold" />
                              {(movie.vote_average || 0).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
