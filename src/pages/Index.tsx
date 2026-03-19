import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FilterBar, { type FilterValues } from "@/components/FilterBar";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSpotlight from "@/components/HeroSpotlight";
import { useInfiniteRow } from "@/hooks/useInfiniteRow";
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchDetails,
  fetchDiscover,
  fetchTrendingPaged,
  fetchPopularPaged,
  fetchTopRatedPaged,
  fetchNowPlayingPaged,
  fetchOnTheAirPaged,
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
  "Action & Adventure": { type: "tv", genreId: "10759" },
  Animation: { type: "movie", genreId: "16" },
  Biography: { type: "movie", genreId: "99" },
  Comedy: { type: "movie", genreId: "35" },
  Crime: { type: "movie", genreId: "80" },
  Documentary: { type: "movie", genreId: "99" },
  Drama: { type: "movie", genreId: "18" },
  Fantasy: { type: "movie", genreId: "14" },
  History: { type: "movie", genreId: "36" },
  Kids: { type: "tv", genreId: "10762" },
  Music: { type: "movie", genreId: "10402" },
  Mystery: { type: "movie", genreId: "9648" },
  News: { type: "tv", genreId: "10763" },
  Reality: { type: "tv", genreId: "10764" },
  "Sci-Fi & Fantasy": { type: "tv", genreId: "10765" },
  "Science Fiction": { type: "movie", genreId: "878" },
  Soap: { type: "tv", genreId: "10766" },
  Talk: { type: "tv", genreId: "10767" },
  Thriller: { type: "movie", genreId: "53" },
  "TV Movie": { type: "movie", genreId: "10770" },
  War: { type: "movie", genreId: "10752" },
  "War & Politics": { type: "tv", genreId: "10768" },
  Western: { type: "movie", genreId: "37" },
};

const COUNTRY_MAP: Record<string, string> = {
  Argentina: "AR", Australia: "AU", Austria: "AT", Belgium: "BE", Brazil: "BR",
  Canada: "CA", China: "CN", "Czech Republic": "CZ", Denmark: "DK", Finland: "FI",
  France: "FR", Germany: "DE", "Hong Kong": "HK", Hungary: "HU", India: "IN",
  Ireland: "IE", Israel: "IL", Italy: "IT", Japan: "JP", Luxembourg: "LU",
  Mexico: "MX", Netherlands: "NL", "New Zealand": "NZ", Norway: "NO", Poland: "PL",
  Romania: "RO", Russia: "RU", "South Africa": "ZA", "South Korea": "KR",
  Spain: "ES", Sweden: "SE", Switzerland: "CH", Taiwan: "TW", Thailand: "TH",
  "United Kingdom": "GB", "United States of America": "US"
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
  "All",
  // Defaults & Specials
  "New", "Paramount", "Doomsday",
  // Standard Genres
  "Action", "Action & Adventure", "Adventure", "Animation", "Biography",
  "Comedies", "Comedy", "Crime", "Documentary", "Dramas", "Drama", "Family",
  "Fantasy", "History", "Horror", "Kids", "Music", "Mystery", "News",
  "Reality", "Romance", "Sci-fi", "Sci-Fi & Fantasy", "Science Fiction",
  "Soap", "Talk", "Thriller", "TV Movie", "War", "War & Politics", "Western"
];

const Index = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    genre: null,
    country: null,
    year: null,
    rating: null,
    quality: null,
    sort: "Popularity",
  });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") ||
    filters.country ||
    filters.year ||
    filters.rating ||
    filters.sort !== "Popularity"
  );

  // --- Infinite scrolling rows (only when no active filters) ---
  const trending = useInfiniteRow({
    queryKey: ["tmdb", "trending", "infinite"],
    fetchFn: (page) => fetchTrendingPaged("all", page),
    enabled: !hasActiveFilters,
  });

  const topRated = useInfiniteRow({
    queryKey: ["tmdb", "topRated", "movie", "infinite"],
    fetchFn: (page) => fetchTopRatedPaged("movie", page),
    enabled: !hasActiveFilters,
  });

  const nowPlaying = useInfiniteRow({
    queryKey: ["tmdb", "nowPlaying", "infinite"],
    fetchFn: (page) => fetchNowPlayingPaged(page),
    enabled: !hasActiveFilters,
  });

  const popularTV = useInfiniteRow({
    queryKey: ["tmdb", "popular", "tv", "infinite"],
    fetchFn: (page) => fetchPopularPaged("tv", page),
    enabled: !hasActiveFilters,
  });

  const onTheAir = useInfiniteRow({
    queryKey: ["tmdb", "onTheAir", "infinite"],
    fetchFn: (page) => fetchOnTheAirPaged(page),
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
    () => ["tmdb", "filtered", filters.genre, filters.country, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.country, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const genreConfig = filters.genre ? GENRE_FILTER_MAP[filters.genre] : null;

      // Special cases
      if (genreConfig?.special === "now_playing") return fetchNowPlayingPaged().then((r) => r.results);
      if (genreConfig?.special === "paramount") {
        return fetchDiscover({
          type: "movie",
          companyId: "4",
          sortBy: SORT_MAP[filters.sort],
          voteAverageGte: ratingToParam(filters.rating),
          withOriginCountry: filters.country ? COUNTRY_MAP[filters.country] : undefined,
          ...yearToParams(filters.year),
        });
      }

      return fetchDiscover({
        type: genreConfig?.type || "movie",
        genreId: genreConfig?.genreId,
        sortBy: SORT_MAP[filters.sort],
        voteAverageGte: ratingToParam(filters.rating),
        withOriginCountry: filters.country ? COUNTRY_MAP[filters.country] : undefined,
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
    if (filters.country) parts.push(filters.country);
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`Rated ${filters.rating}`);
    if (filters.sort !== "Popularity") parts.push(`Sorted by ${filters.sort}`);
    return parts.length > 0 ? parts.join(" · ") : "Results";
  }, [filters]);

  const infiniteRows = [
    { title: "Trending now", ...trending },
    { title: "Top rated", ...topRated },
    { title: "Now playing", ...nowPlaying },
    { title: "Popular TV shows", ...popularTV },
    { title: "On the air", ...onTheAir },
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
        {hasActiveFilters ? (
          <MovieRow
            title={filterLabel}
            movies={filteredResults}
            onMovieClick={handleMovieClick}
          />
        ) : (
          infiniteRows.map((row) => (
            <MovieRow
              key={row.title}
              title={row.title}
              movies={row.movies}
              onMovieClick={handleMovieClick}
              fetchNextPage={row.fetchNextPage}
              hasNextPage={row.hasNextPage}
              isFetchingNextPage={row.isFetchingNextPage}
            />
          ))
        )}
      </main>

      <MovieDetailModal
        details={selectedDetails || null}
        onClose={() => setSelectedTmdbId(null)}
        mediaType={selectedTmdbId?.type}
      />
      <Footer />
    </div>
  );
};

export default Index;
