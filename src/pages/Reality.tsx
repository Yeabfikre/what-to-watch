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
  type TmdbMovie,
  type DiscoverOptions,
} from "@/lib/tmdb";

// TMDB Reality genre = 10764
const REALITY_BASE: Partial<DiscoverOptions> = {
  type: "tv",
  genreId: "10764",
};

const REALITY_SUBGENRES: Record<string, string> = {
  Competition: "10764",
  Drama: "18",
  Comedy: "35",
  Family: "10751",
  Documentary: "99",
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

const Reality = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ genre: null, country: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.country || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  // Infinite scrolling rows
  const popularReality = useInfiniteRow({
    queryKey: ["tmdb", "reality", "popular", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ ...REALITY_BASE, type: "tv", sortBy: "popularity.desc" }, page),
    enabled: !hasActiveFilters,
  });

  const topRatedReality = useInfiniteRow({
    queryKey: ["tmdb", "reality", "top_rated", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ ...REALITY_BASE, type: "tv", sortBy: "vote_average.desc", voteAverageGte: "6" }, page),
    enabled: !hasActiveFilters,
  });

  const newReality = useInfiniteRow({
    queryKey: ["tmdb", "reality", "new", "infinite"],
    fetchFn: (page) => fetchDiscoverPaged({ ...REALITY_BASE, type: "tv", sortBy: "primary_release_date.desc" }, page),
    enabled: !hasActiveFilters,
  });

  const { data: heroReality = [] } = useQuery({
    queryKey: ["tmdb", "reality", "popular"],
    queryFn: () => fetchDiscover({ ...REALITY_BASE, type: "tv", sortBy: "popularity.desc" }),
  });

  const filterQueryKey = useMemo(
    () => ["tmdb", "reality-filtered", filters.genre, filters.country, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.country, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const extraGenre = filters.genre && filters.genre !== "All" ? REALITY_SUBGENRES[filters.genre] : undefined;
      const genreId = extraGenre && extraGenre !== "10764" ? `10764,${extraGenre}` : "10764";
      return fetchDiscover({
        type: "tv",
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

  const handleClick = (movie: TmdbMovie) => {
    setSelectedTmdbId({ id: movie.id, type: "tv" });
  };

  const categories = ["All", ...Object.keys(REALITY_SUBGENRES)];

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
    { title: "Popular Reality Shows", ...popularReality },
    { title: "Top Rated Reality", ...topRatedReality },
    { title: "New Reality Shows", ...newReality },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleClick} />
      <HeroSpotlight movies={heroReality} onInfoClick={handleClick} />

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

      <MovieDetailModal details={selectedDetails || null} onClose={() => setSelectedTmdbId(null)} mediaType="tv" />
      <Footer />
    </div>
  );
};

export default Reality;
