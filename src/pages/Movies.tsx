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
  fetchPopular,
  fetchDetails,
  fetchDiscover,
  fetchPopularPaged,
  fetchTopRatedPaged,
  fetchNowPlayingPaged,
  getMediaType,
  type TmdbMovie,
  type DiscoverOptions,
} from "@/lib/tmdb";

const MOVIE_GENRES: Record<string, string> = {
  Action: "28",
  "Action & Adventure": "10759",
  Adventure: "12",
  Animation: "16",
  Biography: "36",
  Comedy: "35",
  Crime: "80",
  Documentary: "99",
  Drama: "18",
  Family: "10751",
  Fantasy: "14",
  History: "36",
  Horror: "27",
  Kids: "10762",
  Music: "10402",
  Mystery: "9648",
  News: "10763",
  Reality: "10764",
  Romance: "10749",
  "Sci-Fi & Fantasy": "10765",
  "Science Fiction": "878",
  Soap: "10766",
  Talk: "10767",
  Thriller: "53",
  "TV Movie": "10770",
  War: "10752",
  "War & Politics": "10768",
  Western: "37",
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

function ratingToParam(r: string | null): string | undefined {
  return r ? r.replace("+", "") : undefined;
}

const Movies = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ genre: null, country: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.country || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  // Infinite scrolling rows
  const nowPlaying = useInfiniteRow({
    queryKey: ["tmdb", "nowPlaying", "movies", "infinite"],
    fetchFn: (page) => fetchNowPlayingPaged(page),
    enabled: !hasActiveFilters,
  });

  const popular = useInfiniteRow({
    queryKey: ["tmdb", "popular", "movie", "infinite"],
    fetchFn: (page) => fetchPopularPaged("movie", page),
    enabled: !hasActiveFilters,
  });

  const topRatedRow = useInfiniteRow({
    queryKey: ["tmdb", "topRated", "movie", "infinite"],
    fetchFn: (page) => fetchTopRatedPaged("movie", page),
    enabled: !hasActiveFilters,
  });

  const { data: heroPopular = [] } = useQuery({
    queryKey: ["tmdb", "popular", "movie"],
    queryFn: () => fetchPopular("movie"),
  });

  const filterQueryKey = useMemo(
    () => ["tmdb", "movies-filtered", filters.genre, filters.country, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.country, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const genreId = filters.genre && filters.genre !== "All" ? MOVIE_GENRES[filters.genre] : undefined;
      return fetchDiscover({
        type: "movie",
        genreId,
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

  const categories = ["All", ...Object.keys(MOVIE_GENRES)];

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
    { title: "Now Playing", ...nowPlaying },
    { title: "Popular Movies", ...popular },
    { title: "Top Rated", ...topRatedRow },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleMovieClick} />
      <HeroSpotlight movies={heroPopular} onInfoClick={handleMovieClick} />

      <div className="relative z-10 -mt-4 px-6 pb-4 md:px-12 lg:px-16">
        <FilterBar categories={categories} filters={filters} onFiltersChange={setFilters} />
      </div>

      <main className="flex flex-col gap-8 px-6 pb-16 md:px-12 lg:px-16">
        {hasActiveFilters ? (
          <MovieRow title={filterLabel} movies={filteredResults} onMovieClick={handleMovieClick} />
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

      <MovieDetailModal details={selectedDetails || null} onClose={() => setSelectedTmdbId(null)} mediaType={selectedTmdbId?.type} />
      <Footer />
    </div>
  );
};

export default Movies;
