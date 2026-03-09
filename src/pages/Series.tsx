import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSpotlight from "@/components/HeroSpotlight";
import FilterBar, { type FilterValues } from "@/components/FilterBar";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import {
  fetchPopular,
  fetchTopRated,
  fetchOnTheAir,
  fetchDiscover,
  fetchDetails,
  type TmdbMovie,
  type DiscoverOptions,
} from "@/lib/tmdb";

const TV_GENRES: Record<string, string> = {
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
  "Release Date": "first_air_date.desc",
  "Title A-Z": "original_name.asc",
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

const Series = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ genre: null, year: null, rating: null, quality: null, sort: "Popularity" });

  const hasActiveFilters = !!(
    (filters.genre && filters.genre !== "All") || filters.year || filters.rating || filters.sort !== "Popularity"
  );

  const { data: popular = [] } = useQuery({
    queryKey: ["tmdb", "popular", "tv"],
    queryFn: () => fetchPopular("tv"),
    enabled: !hasActiveFilters,
  });

  const { data: topRated = [] } = useQuery({
    queryKey: ["tmdb", "topRated", "tv"],
    queryFn: () => fetchTopRated("tv"),
    enabled: !hasActiveFilters,
  });

  const { data: onTheAir = [] } = useQuery({
    queryKey: ["tmdb", "onTheAir"],
    queryFn: () => fetchOnTheAir(),
    enabled: !hasActiveFilters,
  });

  const { data: heroPopular = [] } = useQuery({
    queryKey: ["tmdb", "popular", "tv"],
    queryFn: () => fetchPopular("tv"),
  });

  const filterQueryKey = useMemo(
    () => ["tmdb", "tv-filtered", filters.genre, filters.year, filters.rating, filters.sort],
    [filters.genre, filters.year, filters.rating, filters.sort],
  );

  const { data: filteredResults = [] } = useQuery({
    queryKey: filterQueryKey,
    queryFn: () => {
      const genreId = filters.genre && filters.genre !== "All" ? TV_GENRES[filters.genre] : undefined;
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

  const handleSeriesClick = (movie: TmdbMovie) => {
    setSelectedTmdbId({ id: movie.id, type: "tv" });
  };

  const categories = ["All", ...Object.keys(TV_GENRES)];

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
        { title: "On the Air", movies: onTheAir },
        { title: "Popular Series", movies: popular },
        { title: "Top Rated", movies: topRated },
      ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleSeriesClick} />
      <HeroSpotlight movies={heroPopular} onInfoClick={handleSeriesClick} />

      <div className="relative z-10 -mt-4 px-6 pb-4 md:px-12 lg:px-16">
        <FilterBar categories={categories} filters={filters} onFiltersChange={setFilters} />
      </div>

      <main className="flex flex-col gap-8 px-6 pb-16 md:px-12 lg:px-16">
        {sections.map((section) => (
          <MovieRow key={section.title} title={section.title} movies={section.movies} onMovieClick={handleSeriesClick} />
        ))}
      </main>

      <MovieDetailModal details={selectedDetails || null} onClose={() => setSelectedTmdbId(null)} />
      <Footer />
    </div>
  );
};

export default Series;
