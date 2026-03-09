import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Star, Film, Tv, TrendingUp, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieDetailModal from "@/components/MovieDetailModal";
import {
  fetchTrending,
  fetchNowPlaying,
  fetchOnTheAir,
  fetchDetails,
  tmdbImg,
  getTitle,
  getYear,
  getMediaType,
  type TmdbMovie,
} from "@/lib/tmdb";

const News = () => {
  const [selectedTmdbId, setSelectedTmdbId] = useState<{ id: number; type: "movie" | "tv" } | null>(null);

  const { data: trendingDay = [] } = useQuery({
    queryKey: ["tmdb", "trending", "all", "day"],
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/tmdb?action=trending&type=all&window=day`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const data = await res.json();
      return data.results as TmdbMovie[];
    },
  });

  const { data: nowPlaying = [] } = useQuery({
    queryKey: ["tmdb", "nowPlaying"],
    queryFn: () => fetchNowPlaying(),
  });

  const { data: onTheAir = [] } = useQuery({
    queryKey: ["tmdb", "onTheAir"],
    queryFn: () => fetchOnTheAir(),
  });

  const { data: upcomingMovies = [] } = useQuery({
    queryKey: ["tmdb", "upcoming"],
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/tmdb?action=upcoming`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const data = await res.json();
      // Filter to only show movies releasing in the future
      const today = new Date().toISOString().split('T')[0];
      return (data.results as TmdbMovie[]).filter(
        (m) => m.release_date && m.release_date > today
      );
    },
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

  const handleSearchClick = (movie: TmdbMovie) => {
    const type = getMediaType(movie);
    setSelectedTmdbId({ id: movie.id, type });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar onMovieClick={handleSearchClick} />

      {/* Hero banner */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
              Entertainment News
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground sm:text-lg">
              Stay updated with the latest releases, trending titles, and upcoming movies & series.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="px-6 pb-16 md:px-12 lg:px-16">
        {/* Trending Today */}
        <NewsSection
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          title="Trending Today"
          subtitle="The most talked-about movies and series right now — see what's capturing audiences worldwide today."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trendingDay.slice(0, 8).map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} onClick={handleClick} variant="trending" />
            ))}
          </div>
        </NewsSection>

        {/* Upcoming Movies */}
        <NewsSection
          icon={<Calendar className="h-5 w-5 text-primary" />}
          title="Upcoming Releases"
          subtitle="Get a first look at movies hitting theaters soon — mark your calendar and don't miss the premieres."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMovies.slice(0, 9).map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} onClick={handleClick} variant="upcoming" />
            ))}
          </div>
        </NewsSection>

        {/* Now in Theaters */}
        <NewsSection
          icon={<Film className="h-5 w-5 text-primary" />}
          title="Now in Theaters"
          subtitle="These movies are currently playing on the big screen — grab your popcorn and catch them in cinemas near you."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nowPlaying.slice(0, 8).map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} onClick={handleClick} variant="now" />
            ))}
          </div>
        </NewsSection>

        {/* New Series */}
        <NewsSection
          icon={<Tv className="h-5 w-5 text-primary" />}
          title="New & Returning Series"
          subtitle="Fresh episodes dropping now — stay up to date with the latest seasons and new shows currently airing on streaming platforms."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {onTheAir.slice(0, 8).map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} onClick={handleClick} variant="series" />
            ))}
          </div>
        </NewsSection>
      </main>

      <MovieDetailModal
        details={selectedDetails || null}
        onClose={() => setSelectedTmdbId(null)}
      />
      <Footer />
    </div>
  );
};

/* --- Sub-components --- */

const NewsSection = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="mt-10">
    <div className="mb-5 flex items-center gap-3">
      {icon}
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const NewsCard = ({
  item,
  index,
  onClick,
  variant,
}: {
  item: TmdbMovie;
  index: number;
  onClick: (m: TmdbMovie) => void;
  variant: "trending" | "upcoming" | "now" | "series";
}) => {
  const title = getTitle(item);
  const year = getYear(item);
  const type = getMediaType(item);
  const backdropUrl = tmdbImg.backdrop(item.backdrop_path);
  const posterUrl = tmdbImg.poster(item.poster_path);
  const releaseDate = item.release_date || item.first_air_date;

  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onClick(item)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

        {/* Type badge */}
        <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-sm">
          {type === "tv" ? "Series" : "Movie"}
        </div>

        {/* Rating */}
        {item.vote_average > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-foreground">{item.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          {releaseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(releaseDate)}
            </span>
          )}
          {variant === "trending" && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </span>
          )}
          {variant === "upcoming" && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          )}
        </div>

        {item.overview && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {item.overview}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default News;
