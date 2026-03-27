import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, Calendar, Film, Tv, Users, User, Play, List, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  tmdbImg,
  getTitle,
  getYear,
  getTrailerUrl,
  formatRuntime,
  getProviders,
  fetchSeason,
  type TmdbDetails,
} from "@/lib/tmdb";

interface MovieDetailModalProps {
  details: TmdbDetails | null;
  onClose: () => void;
  mediaType?: "movie" | "tv";
}

const RatingBadge = ({ source, value }: { source: string; value: string }) => {
  const colors: Record<string, string> = {
    TMDB: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    IMDb: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  };
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${colors[source] || "bg-muted border-border text-muted-foreground"}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">{source}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
};

const MovieDetailModal = ({ details, onClose, mediaType }: MovieDetailModalProps) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "trailer" | "episodes">("overview");
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Use explicit mediaType if provided (more reliable), otherwise fall back to number_of_seasons detection
  const isTV = mediaType === "tv" || (mediaType !== "movie" && !!details?.number_of_seasons);

  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "season", details?.id, selectedSeason],
    queryFn: () => fetchSeason(details!.id, selectedSeason),
    enabled: !!details && isTV && activeTab === "episodes",
  });

  if (!details) return null;

  const title = getTitle(details);
  const year = getYear(details);
  const runtime = formatRuntime(details.runtime);
  const posterUrl = tmdbImg.poster(details.poster_path);
  const backdropUrl = tmdbImg.backdrop(details.backdrop_path);
  const trailerUrl = getTrailerUrl(details);
  const providers = getProviders(details);
  const cast = details.credits?.cast?.slice(0, 20) || [];
  const director = !isTV
    ? (details as any).credits?.crew?.find((c: any) => c.job === "Director")?.name
    : details.created_by?.map((c) => c.name).join(", ");

  const imdbId = details.external_ids?.imdb_id;

  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: null },
    { id: "cast" as const, label: "Cast", icon: null },
    ...(isTV ? [{ id: "episodes" as const, label: "Episodes", icon: <List className="h-3.5 w-3.5" /> }] : []),
    ...(trailerUrl ? [{ id: "trailer" as const, label: "Trailer", icon: <Play className="h-3.5 w-3.5" /> }] : []),
  ];

  return (
    <AnimatePresence>
      {details && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-sm transition hover:bg-background/90"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Backdrop */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-secondary sm:h-64">
              {backdropUrl && !imgError ? (
                <img
                  src={backdropUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                  <Film className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative -mt-20 px-6 pb-8 sm:px-8">
              <div className="sm:flex sm:gap-6">
                <div className="shrink-0">
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="mx-auto w-32 rounded-lg shadow-xl sm:mx-0 sm:w-40"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="mt-4 flex-1 sm:mt-8">
                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {year > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {year}
                      </span>
                    )}
                    {runtime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {runtime}
                      </span>
                    )}
                    {isTV && details.number_of_seasons && (
                      <span className="flex items-center gap-1">
                        <Tv className="h-3.5 w-3.5" />
                        {details.number_of_seasons} season{details.number_of_seasons > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Ratings */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RatingBadge source="TMDB" value={(details.vote_average || 0).toFixed(1)} />
                    {imdbId && (
                      <a
                        href={`https://www.imdb.com/title/${imdbId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:opacity-80"
                      >
                        <RatingBadge source="IMDb" value="View →" />
                      </a>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(details.genres || []).map((g) => (
                      <Badge key={g.id} variant="secondary" className="text-xs">
                        {g.name}
                      </Badge>
                    ))}
                    {providers.slice(0, 2).map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>

                  {/* Watch Free Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/watch?title=${encodeURIComponent(title)}&type=${isTV ? "tv" : "movie"}&id=${details.id}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Watch Free
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                          activeTab === tab.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {details.overview}
                    </p>
                    {director && (
                      <div className="mt-5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {isTV ? "Created by" : "Directed by"}
                        </span>
                        <p className="mt-0.5 text-sm font-medium text-foreground">{director}</p>
                      </div>
                    )}
                    {cast.length > 0 && (
                      <div className="mt-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Users className="h-3 w-3" /> Cast
                        </span>
                        <p className="mt-0.5 text-sm text-foreground">
                          {cast.slice(0, 6).map((c) => c.name).join(", ")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "cast" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
                      {cast.map((member) => {
                        const photoUrl = tmdbImg.profile(member.profile_path);
                        return (
                          <div key={member.id} className="flex w-28 shrink-0 flex-col items-center text-center">
                            <div className="h-28 w-28 overflow-hidden rounded-lg bg-secondary">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs font-semibold text-foreground leading-tight">
                              {member.name}
                            </p>
                            {member.character && (
                              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                                {member.character}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === "episodes" && isTV && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Season selector */}
                    {seasons.length > 1 && (
                      <div className="mb-4 flex items-center gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Season
                        </label>
                        <div className="relative">
                          <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(Number(e.target.value))}
                            className="appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-sm font-medium text-foreground outline-none transition focus:border-primary"
                          >
                            {seasons.map((s) => (
                              <option key={s.season_number} value={s.season_number}>
                                {s.name} ({s.episode_count} ep)
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    )}

                    {/* Episodes list */}
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                      {seasonData?.episodes ? (
                        seasonData.episodes.map((ep) => {
                          const stillUrl = ep.still_path
                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                            : null;
                          return (
                            <div
                              key={ep.id}
                              className="flex gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition hover:bg-secondary"
                            >
                              <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                                {stillUrl ? (
                                  <img
                                    src={stillUrl}
                                    alt={ep.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Film className="h-6 w-6 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {ep.episode_number}. {ep.name}
                                  </p>
                                  {ep.runtime && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {ep.runtime}m
                                    </span>
                                  )}
                                </div>
                                {ep.air_date && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {new Date(ep.air_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                )}
                                {ep.overview && (
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                    {ep.overview}
                                  </p>
                                )}
                                {ep.vote_average > 0 && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-gold text-gold" />
                                    <span className="text-[11px] font-medium text-foreground">
                                      {(ep.vote_average || 0).toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "trailer" && trailerUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <iframe
                        src={`${trailerUrl}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                        title={`${title} Trailer`}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieDetailModal;