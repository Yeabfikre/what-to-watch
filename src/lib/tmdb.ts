// TMDB API client - calls edge function proxy

const IMG_BASE = "https://image.tmdb.org/t/p";

export const tmdbImg = {
  poster: (path: string | null) => path ? `${IMG_BASE}/w500${path}` : null,
  backdrop: (path: string | null) => path ? `${IMG_BASE}/w1280${path}` : null,
  profile: (path: string | null) => path ? `${IMG_BASE}/w185${path}` : null,
};

async function callTmdb(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = `${supabaseUrl}/functions/v1/tmdb?${query}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`TMDB API error [${res.status}]: ${errorBody}`);
  }
  
  return res.json();
}

export interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  overview: string;
  media_type?: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  overview: string;
  runtime?: number;
  number_of_seasons?: number;
  seasons?: { season_number: number; name: string; episode_count: number; air_date: string | null }[];
  credits: { cast: TmdbCastMember[] };
  videos: { results: TmdbVideo[] };
  created_by?: { name: string }[];
  external_ids?: {
    imdb_id?: string | null;
  };
  "watch/providers"?: {
    results?: {
      US?: {
        flatrate?: { provider_name: string }[];
      };
    };
  };
  images?: {
    backdrops?: { file_path: string; width: number; height: number }[];
  };
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface TmdbSeason {
  id: number;
  name: string;
  season_number: number;
  episodes: TmdbEpisode[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

// Paginated response from TMDB list endpoints
export interface PaginatedResult {
  results: TmdbMovie[];
  page: number;
  total_pages: number;
}

// Fetch functions
export async function fetchTrending(type: "all" | "movie" | "tv" = "all") {
  const data = await callTmdb({ action: "trending", type });
  return data.results as TmdbMovie[];
}

export async function fetchPopular(type: "movie" | "tv" = "movie") {
  const data = await callTmdb({ action: "popular", type });
  return data.results as TmdbMovie[];
}

export async function fetchTopRated(type: "movie" | "tv" = "movie") {
  const data = await callTmdb({ action: "top_rated", type });
  return data.results as TmdbMovie[];
}

export async function fetchNowPlaying() {
  const data = await callTmdb({ action: "now_playing" });
  return data.results as TmdbMovie[];
}

export async function fetchOnTheAir() {
  const data = await callTmdb({ action: "on_the_air" });
  return data.results as TmdbMovie[];
}

// --- Paginated variants (for infinite scrolling) ---

export async function fetchTrendingPaged(type: "all" | "movie" | "tv" = "all", page = 1): Promise<PaginatedResult> {
  const data = await callTmdb({ action: "trending", type, page: String(page) });
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export async function fetchPopularPaged(type: "movie" | "tv" = "movie", page = 1): Promise<PaginatedResult> {
  const data = await callTmdb({ action: "popular", type, page: String(page) });
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export async function fetchTopRatedPaged(type: "movie" | "tv" = "movie", page = 1): Promise<PaginatedResult> {
  const data = await callTmdb({ action: "top_rated", type, page: String(page) });
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export async function fetchNowPlayingPaged(page = 1): Promise<PaginatedResult> {
  const data = await callTmdb({ action: "now_playing", page: String(page) });
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export async function fetchOnTheAirPaged(page = 1): Promise<PaginatedResult> {
  const data = await callTmdb({ action: "on_the_air", page: String(page) });
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export async function fetchDiscoverPaged(
  opts: DiscoverOptions,
  page = 1,
): Promise<PaginatedResult> {
  const params: Record<string, string> = { action: "discover", type: opts.type, page: String(page) };
  if (opts.genreId) params.genre_id = opts.genreId;
  if (opts.companyId) params.with_companies = opts.companyId;
  if (opts.sortBy) params.sort_by = opts.sortBy;
  if (opts.year) params.year = opts.year;
  if (opts.yearGte) params.year_gte = opts.yearGte;
  if (opts.yearLte) params.year_lte = opts.yearLte;
  if (opts.voteAverageGte) params.vote_average_gte = opts.voteAverageGte;
  if (opts.withOriginalLanguage) params.with_original_language = opts.withOriginalLanguage;
  if (opts.withOriginCountry) params.with_origin_country = opts.withOriginCountry;
  if (opts.withKeywords) params.with_keywords = opts.withKeywords;
  const data = await callTmdb(params);
  return { results: data.results as TmdbMovie[], page: data.page, total_pages: data.total_pages };
}

export interface DiscoverOptions {
  type: "movie" | "tv";
  genreId?: string;
  companyId?: string;
  sortBy?: string;
  year?: string;
  yearGte?: string;
  yearLte?: string;
  voteAverageGte?: string;
  withOriginalLanguage?: string;
  withOriginCountry?: string;
  withKeywords?: string;
}

export async function fetchDiscover(
  typeOrOpts: "movie" | "tv" | DiscoverOptions,
  genreId?: string,
  companyId?: string,
) {
  // Support both old signature and new options object
  const opts: DiscoverOptions =
    typeof typeOrOpts === "string"
      ? { type: typeOrOpts, genreId, companyId }
      : typeOrOpts;

  const params: Record<string, string> = { action: "discover", type: opts.type };
  if (opts.genreId) params.genre_id = opts.genreId;
  if (opts.companyId) params.with_companies = opts.companyId;
  if (opts.sortBy) params.sort_by = opts.sortBy;
  if (opts.year) params.year = opts.year;
  if (opts.yearGte) params.year_gte = opts.yearGte;
  if (opts.yearLte) params.year_lte = opts.yearLte;
  if (opts.voteAverageGte) params.vote_average_gte = opts.voteAverageGte;
  if (opts.withOriginalLanguage) params.with_original_language = opts.withOriginalLanguage;
  if (opts.withOriginCountry) params.with_origin_country = opts.withOriginCountry;
  if (opts.withKeywords) params.with_keywords = opts.withKeywords;
  const data = await callTmdb(params);
  return data.results as TmdbMovie[];
}

export async function fetchDetails(id: number, type: "movie" | "tv") {
  const data = await callTmdb({ action: "details", id: String(id), type });
  return data as TmdbDetails;
}

export async function fetchSearch(query: string) {
  const data = await callTmdb({ action: "search", query });
  return data.results as TmdbMovie[];
}

export async function fetchSeason(tvId: number, seasonNumber: number) {
  const data = await callTmdb({ action: "season", id: String(tvId), season_number: String(seasonNumber) });
  return data as TmdbSeason;
}

export async function fetchGenres() {
  const data = await callTmdb({ action: "genres" });
  return data.genres as TmdbGenre[];
}

export async function fetchImages(id: number, type: "movie" | "tv") {
  const data = await callTmdb({ action: "images", id: String(id), type });
  return data as { posters: { file_path: string; vote_average: number }[]; backdrops: { file_path: string }[] };
}

// Helper to get trailer YouTube URL
export function getTrailerUrl(details: TmdbDetails): string | null {
  const videos = details.videos?.results || [];
  const trailer =
    // Best: official YouTube Trailer
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
    // Good: any YouTube Trailer
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    // OK: official YouTube Teaser
    videos.find((v) => v.type === "Teaser" && v.site === "YouTube" && v.official) ||
    // Fallback: any YouTube Teaser
    videos.find((v) => v.type === "Teaser" && v.site === "YouTube");
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

// Helper to format runtime
export function formatRuntime(minutes: number | undefined): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

// Helper to get display title
export function getTitle(item: TmdbMovie | TmdbDetails): string {
  return (item as any).title || (item as any).name || "Unknown";
}

// Helper to get year
export function getYear(item: TmdbMovie | TmdbDetails): number {
  const date = (item as any).release_date || (item as any).first_air_date || "";
  return date ? new Date(date).getFullYear() : 0;
}

// Helper to determine media type
export function getMediaType(item: TmdbMovie): "movie" | "tv" {
  if (item.media_type === "tv") return "tv";
  if (item.media_type === "movie") return "movie";
  return item.first_air_date ? "tv" : "movie";
}

// Get streaming providers
export function getProviders(details: TmdbDetails): string[] {
  const providers = details["watch/providers"]?.results?.US?.flatrate || [];
  return providers.map((p) => p.provider_name);
}
