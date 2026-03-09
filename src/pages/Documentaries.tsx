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

// TMDB Documentary genre = 99
const DOC_BASE: Partial<DiscoverOptions> = {
  type: "movie",
  genreId: "99",
};

const DOC_SUBGENRES: Record<string, string> = {
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

const Documentaries = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ genre: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  const { data: popularDocs = [] } = useQuery({
    queryKey: ["tmdb", "docs", "popular"],
    queryFn: () => fetchDiscover({ ...DOC_BASE, type: "movie", sortBy: "popularity.desc" }),
    enabled: !hasActiveFilters,
  });

  const { data: topRatedDocs = [] } = useQuery({
    queryKey: ["tmdb", "docs", "top_rated"],
    queryFn: () => fetchDiscover({ ...DOC_BASE, type: "movie", sortBy: "vote_average.desc", voteAverageGte: "7" }),
    enabled: !hasActiveFilters,
  });

  const { data: newDocs = [] } = useQuery({
    queryKey: ["tmdb", "docs", "new"],
    queryFn: () => fetchDiscover({ ...DOC_BASE, type: "movie", sortBy: "primary_release_date.desc" }),
    enabled: !hasActiveFilters,
  });

  const { data: heroDocs = [] } = useQuery({
    queryKey: ["tmdb", "docs", "hero"],
    queryFn: () => fetchDiscover({ ...DOC_BASE, type: "movie", sortBy: "popularity.desc" }),
  });

  // Also fetch TV documentaries
  const { data: tvDocs = [] } = useQuery({
    queryKey: ["tmdb", "docs", "tv"],
    queryFn: () => fetchDiscover({ type: "tv", genreId: "99", sortBy: "popularity.desc" }),
    enabled: !hasActiveFilters,
  });

  const filterQueryKey = useMemo(
    () => ["tmdb", "docs-filtered", filters.genre, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const extraGenre = filters.genre && filters.genre !== "All" ? DOC_SUBGENRES[filters.genre] : undefined;
      const genreId = extraGenre ? `99,${extraGenre}` : "99";
      return fetchDiscover({
        type: "movie",
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
    setSelectedTmdbId({ id: movie.id, type: movie.first_air_date ? "tv" : "movie" });
  };

  const categories = ["All", ...Object.keys(DOC_SUBGENRES)];

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
        { title: "Popular Documentaries", movies: popularDocs },
        { title: "Top Rated Documentaries", movies: topRatedDocs },
        { title: "New Documentaries", movies: newDocs },
        { title: "Documentary Series", movies: tvDocs },
      ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleClick} />
      <HeroSpotlight movies={heroDocs} onInfoClick={handleClick} />

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

export default Documentaries;
