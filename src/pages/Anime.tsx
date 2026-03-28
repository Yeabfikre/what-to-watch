import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSpotlight from "@/components/HeroSpotlight";
import FilterBar, { type FilterValues } from "@/components/FilterBar";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import { useInfiniteRow } from "@/hooks/useInfiniteRow";
import {
  fetchDiscover,
  fetchDetails,
  fetchDiscoverPaged,
  getMediaType,
  type TmdbMovie,
  type DiscoverOptions,
} from "@/lib/tmdb";

// TMDB animation genre = 16, Japanese language = ja
const ANIME_BASE: Partial<DiscoverOptions> = {
  type: "tv",
  genreId: "16",
  withOriginalLanguage: "ja",
  withOriginCountry: "JP",
};

const ANIME_GENRES: Record<string, string> = {
  "Action & Adventure": "10759",
  Comedy: "35",
  Drama: "18",
  Fantasy: "10765",
  Romance: "10749",
  "Sci-Fi": "10765",
  Mystery: "9648",
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

function ratingToParam(r: string | null): string | undefined {
  return r ? r.replace("+", "") : undefined;
}

const Anime = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ genre: null, country: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  // Infinite scrolling rows
  const popularAnime = useInfiniteRow({
    queryKey: ["tmdb", "anime", "popular", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ ...ANIME_BASE, type: "tv", sortBy: "popularity.desc" }, page),
    enabled: !hasActiveFilters,
  });

  const topRatedAnime = useInfiniteRow({
    queryKey: ["tmdb", "anime", "top_rated", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ ...ANIME_BASE, type: "tv", sortBy: "vote_average.desc", voteAverageGte: "7" }, page),
    enabled: !hasActiveFilters,
  });

  const animeMovies = useInfiniteRow({
    queryKey: ["tmdb", "anime", "movies", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ type: "movie", genreId: "16", withOriginalLanguage: "ja", withOriginCountry: "JP", sortBy: "popularity.desc" }, page),
    enabled: !hasActiveFilters,
  });

  // Hero uses popular anime
  const { data: heroAnime = [] } = useQuery({
    queryKey: ["tmdb", "anime", "popular"],
    queryFn: () => fetchDiscover({ ...ANIME_BASE, type: "tv", sortBy: "popularity.desc" }),
  });

  // Filtered results
  const filterQueryKey = useMemo(
    () => ["tmdb", "anime-filtered", filters.genre, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const extraGenre = filters.genre && filters.genre !== "All" ? ANIME_GENRES[filters.genre] : undefined;
      const genreId = extraGenre ? `16,${extraGenre}` : "16";
      return fetchDiscover({
        type: "tv",
        genreId,
        withOriginalLanguage: "ja",
        withOriginCountry: "JP",
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

  const handleClick = (movie: TmdbMovie) => {
    const type = getMediaType(movie);
    setSelectedTmdbId({ id: movie.id, type });
  };

  const categories = ["All", ...Object.keys(ANIME_GENRES)];

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.genre && filters.genre !== "All") parts.push(filters.genre);
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`Rated ${filters.rating}`);
    if (filters.sort !== "Popularity") parts.push(`Sorted by ${filters.sort}`);
    return parts.length > 0 ? parts.join(" · ") : "Results";
  }, [filters]);

  const infiniteRows = [
    { title: "Popular Anime", ...popularAnime },
    { title: "Top Rated Anime", ...topRatedAnime },
    { title: "Anime Movies", ...animeMovies },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleClick} />
      <HeroSpotlight movies={heroAnime} onInfoClick={handleClick} />

      <div className="relative z-10 -mt-4 px-6 pb-4 md:px-12 lg:px-16">
        <FilterBar categories={categories} filters={filters} onFiltersChange={setFilters} />
      </div>

      <main className="flex flex-col gap-8 px-6 pb-16 md:px-12 lg:px-16">
        {hasActiveFilters ? (
          <MovieRow title={filterLabel} movies={filteredResults} onMovieClick={handleClick} />
        ) : (
          infiniteRows.map((row) => (
            <MovieRow
              key={row.title}
              title={row.title}
              movies={row.movies}
              onMovieClick={handleClick}
              fetchNextPage={row.fetchNextPage}
              hasNextPage={row.hasNextPage}
              isFetchingNextPage={row.isFetchingNextPage}
            />
          ))
        )}
      </main>

      <MovieDetailModal details={selectedDetails || null} onClose={() => setSelectedTmdbId(null)} />
      <Footer />
    </div>
  );
};

export default Anime;
