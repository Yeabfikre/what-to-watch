import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar, { type FilterValues } from "@/components/FilterBar";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSpotlight from "@/components/HeroSpotlight";
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchNowPlaying,
  fetchOnTheAir,
  fetchDetails,
  fetchDiscover,
  getMediaType,
  type TmdbMovie,
  type DiscoverOptions,
} from "@/lib/tmdb";

const GENRE_FILTER_MAP: Record<string, { type: "movie" | "tv"; genreId?: string; special?: string }> = {
  "Sci-fi": { type: "movie", genreId: "878" },
  New: { type: "movie", special: "now_playing" },
  Romance: { type: "movie", genreId: "10749" },
  Doomsday: { type: "movie", genreId: "53" },
  Paramount: { type: "movie", special: "paramount" },
  Family: { type: "movie", genreId: "10751" },
  Action: { type: "movie", genreId: "28" },
  Comedies: { type: "movie", genreId: "35" },
  Dramas: { type: "movie", genreId: "18" },
  Horror: { type: "movie", genreId: "27" },
  Adventure: { type: "movie", genreId: "12" },
};

const SORT_MAP: Record<string, string> = {
  Popularity: "popularity.desc",
  Rating: "vote_average.desc",
  "Release Date": "primary_release_date.desc",
  "Title A-Z": "original_title.asc",
};

function yearToParams(year: string | null): Pick<DiscoverOptions, "year" | "yearGte" | "yearLte"> {
  if (!year) return {};
  if (/^\d{4}$/.test(year)) return { year };
  if (year === "2010s") return { yearGte: "2010", yearLte: "2019" };
  if (year === "2000s") return { yearGte: "2000", yearLte: "2009" };
  if (year === "90s & older") return { yearLte: "1999" };
  return {};
}

function ratingToParam(rating: string | null): string | undefined {
  if (!rating) return undefined;
  return rating.replace("+", "");
}

const categories = [
  "All", "Sci-fi", "New", "Romance", "Doomsday", "Paramount",
  "Family", "Action", "Comedies", "Dramas", "Horror", "Adventure",
];

const Index = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    genre: null,
    year: null,
    rating: null,
    quality: null,
    sort: "Popularity",
  });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") ||
    filters.year ||
    filters.rating ||
    filters.sort !== "Popularity"
  );

  // --- Default section queries (only fetch when no active filters) ---
  const { data: trending = [] } = useQuery({
    queryKey: ["tmdb", "trending"],
    queryFn: () => fetchTrending("all"),
    enabled: !hasActiveFilters,
  });

  const { data: topRated = [] } = useQuery({
    queryKey: ["tmdb", "topRated"],
    queryFn: () => fetchTopRated("movie"),
    enabled: !hasActiveFilters,
  });

  const { data: popularTV = [] } = useQuery({
    queryKey: ["tmdb", "popular", "tv"],
    queryFn: () => fetchPopular("tv"),
    enabled: !hasActiveFilters,
  });

  const { data: onTheAir = [] } = useQuery({
    queryKey: ["tmdb", "onTheAir"],
    queryFn: () => fetchOnTheAir(),
    enabled: !hasActiveFilters,
  });

  const { data: nowPlaying = [] } = useQuery({
    queryKey: ["tmdb", "nowPlaying"],
    queryFn: () => fetchNowPlaying(),
    enabled: !hasActiveFilters,
  });

  // Iconic titles to always include in hero (TMDB IDs)
  const HERO_PICKS: { id: number; type: "movie" | "tv" }[] = [
    { id: 1399, type: "tv" },   // Game of Thrones
    { id: 94997, type: "tv" },  // House of the Dragon
    { id: 44217, type: "tv" },  // Vikings
    { id: 1396, type: "tv" },   // Breaking Bad
  ];

  // Hero always needs trending
  const { data: heroTrending = [] } = useQuery({
    queryKey: ["tmdb", "trending"],
    queryFn: () => fetchTrending("all"),
  });

  const { data: heroPopular = [] } = useQuery({
    queryKey: ["tmdb", "popular", "movie"],
    queryFn: () => fetchPopular("movie"),
  });

  const { data: heroTopRated = [] } = useQuery({
    queryKey: ["tmdb", "topRated", "movie", "hero"],
    queryFn: () => fetchTopRated("movie"),
  });

  // Fetch iconic picks
  const { data: heroPicks = [] } = useQuery({
    queryKey: ["tmdb", "heroPicks"],
    queryFn: async () => {
      const results = await Promise.all(
        HERO_PICKS.map(async (pick) => {
          const details = await fetchDetails(pick.id, pick.type);
          let backdropPath = details.backdrop_path;

          // Use an alternative backdrop for Game of Thrones
          if (pick.id === 1399 && details.images?.backdrops?.length > 1) {
            const alt = details.images.backdrops.find(
              (img: any) => img.file_path !== details.backdrop_path
            );
            if (alt) backdropPath = alt.file_path;
          }

          return {
            id: details.id,
            title: (details as any).title,
            name: (details as any).name,
            poster_path: details.poster_path,
            backdrop_path: backdropPath,
            vote_average: details.vote_average,
            release_date: (details as any).release_date,
            first_air_date: (details as any).first_air_date,
            genre_ids: details.genres?.map((g) => g.id) || [],
            overview: details.overview,
            media_type: pick.type,
          } as TmdbMovie;
        }),
      );
      return results.filter((m) => m.backdrop_path);
    },
  });

  // Round-robin from iconic picks, trending, popular, top-rated
  const heroMovies = useMemo(() => {
    const HERO_BLOCKLIST = new Set([59941]); // Watch What Happens Live
    const seen = new Set<number>();
    const combined: TmdbMovie[] = [];
    const sources = [heroPicks, heroTrending, heroPopular, heroTopRated];
    const indices = [0, 0, 0, 0];
    while (combined.length < 12) {
      let added = false;
      for (let s = 0; s < sources.length; s++) {
        while (indices[s] < sources[s].length) {
          const movie = sources[s][indices[s]];
          indices[s]++;
          if (!seen.has(movie.id) && movie.backdrop_path && !HERO_BLOCKLIST.has(movie.id)) {
            seen.add(movie.id);
            combined.push(movie);
            added = true;
            break;
          }
        }
        if (combined.length >= 12) break;
      }
      if (!added) break;
    }
    return combined;
  }, [heroPicks, heroTrending, heroPopular, heroTopRated]);

  // --- Filtered query ---
  const filterQueryKey = useMemo(
    () => ["tmdb", "filtered", filters.genre, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const genreConfig = filters.genre ? GENRE_FILTER_MAP[filters.genre] : null;

      // Special cases
      if (genreConfig?.special === "now_playing") return fetchNowPlaying();
      if (genreConfig?.special === "paramount") {
        return fetchDiscover({
          type: "movie",
          companyId: "4",
          sortBy: SORT_MAP[filters.sort],
          voteAverageGte: ratingToParam(filters.rating),
          ...yearToParams(filters.year),
        });
      }

      return fetchDiscover({
        type: genreConfig?.type || "movie",
        genreId: genreConfig?.genreId,
        sortBy: SORT_MAP[filters.sort],
        voteAverageGte: ratingToParam(filters.rating),
        ...yearToParams(filters.year),
      });
    },
    enabled: hasActiveFilters,
  });

  const { data: selectedDetails } = useQuery({
    queryKey: ["tmdb", "details", selectedTmdbId?.id, selectedTmdbId?.type],
    queryFn: () => fetchDetails(selectedTmdbId!.id, selectedTmdbId!.type),
    enabled: !!selectedTmdbId,
  });

  const handleMovieClick = (movie: TmdbMovie) => {
    const type = getMediaType(movie);
    setSelectedTmdbId({ id: movie.id, type });
  };

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.genre && filters.genre !== "All") parts.push(filters.genre);
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`Rated ${filters.rating}`);
    if (filters.sort !== "Popularity") parts.push(`Sorted by ${filters.sort}`);
    return parts.length > 0 ? parts.join(" · ") : "Results";
  }, [filters]);

  const sections = hasActiveFilters
    ? [{ title: filterLabel, movies: filteredResults }]
    : [
        { title: "Trending now", movies: trending },
        { title: "Top rated", movies: topRated },
        { title: "Now playing", movies: nowPlaying },
        { title: "Popular TV shows", movies: popularTV },
        { title: "On the air", movies: onTheAir },
      ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleMovieClick} />
      <HeroSpotlight movies={heroMovies} onInfoClick={handleMovieClick} />

      <div className="relative z-10 -mt-4 px-6 pb-4 md:px-12 lg:px-16">
        <FilterBar
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <main className="flex flex-col gap-8 px-6 pb-16 md:px-12 lg:px-16">
        {sections.map((section) => (
          <MovieRow
            key={section.title}
            title={section.title}
            movies={section.movies}
            onMovieClick={handleMovieClick}
          />
        ))}
      </main>

      <MovieDetailModal
        details={selectedDetails || null}
        onClose={() => setSelectedTmdbId(null)}
      />
      <Footer />
    </div>
  );
};

export default Index;
