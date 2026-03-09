import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSpotlight from "@/components/HeroSpotlight";
import FilterBar, { type FilterValues } from "@/components/FilterBar";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import {
  fetchDiscover,
  fetchDetails,
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
  const [filters, setFilters] = useState<FilterValues>({ genre: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  const { data: popularReality = [] } = useQuery({
    queryKey: ["tmdb", "reality", "popular"],
    queryFn: () => fetchDiscover({ ...REALITY_BASE, type: "tv", sortBy: "popularity.desc" }),
    enabled: !hasActiveFilters,
  });

  const { data: topRatedReality = [] } = useQuery({
    queryKey: ["tmdb", "reality", "top_rated"],
    queryFn: () => fetchDiscover({ ...REALITY_BASE, type: "tv", sortBy: "vote_average.desc", voteAverageGte: "6" }),
    enabled: !hasActiveFilters,
  });

  const { data: newReality = [] } = useQuery({
    queryKey: ["tmdb", "reality", "new"],
    queryFn: () => fetchDiscover({ ...REALITY_BASE, type: "tv", sortBy: "primary_release_date.desc" }),
    enabled: !hasActiveFilters,
  });

  const { data: heroReality = [] } = useQuery({
    queryKey: ["tmdb", "reality", "popular"],
    queryFn: () => fetchDiscover({ ...REALITY_BASE, type: "tv", sortBy: "popularity.desc" }),
  });

  const filterQueryKey = useMemo(
    () => ["tmdb", "reality-filtered", filters.genre, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.year, filters.rating, filters.sort],
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
    if (filters.year) parts.push(filters.year);
    if (filters.rating) parts.push(`Rated ${filters.rating}`);
    if (filters.sort !== "Popularity") parts.push(`Sorted by ${filters.sort}`);
    return parts.length > 0 ? parts.join(" · ") : "Results";
  }, [filters]);

  const sections = hasActiveFilters
    ? [{ title: filterLabel, movies: filteredResults }]
    : [
        { title: "Popular Reality Shows", movies: popularReality },
        { title: "Top Rated Reality", movies: topRatedReality },
        { title: "New Reality Shows", movies: newReality },
      ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleClick} />
      <HeroSpotlight movies={heroReality} onInfoClick={handleClick} />

      <div className="relative z-10 -mt-4 px-6 pb-4 md:px-12 lg:px-16">
        <FilterBar categories={categories} filters={filters} onFiltersChange={setFilters} />
      </div>

      <main className="flex flex-col gap-8 px-6 pb-16 md:px-12 lg:px-16">
        {sections.map((section) => (
          <MovieRow key={section.title} title={section.title} movies={section.movies} onMovieClick={handleClick} />
        ))}
      </main>

      <MovieDetailModal details={selectedDetails || null} onClose={() => setSelectedTmdbId(null)} />
      <Footer />
    </div>
  );
};

export default Reality;
